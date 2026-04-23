import { useState, useEffect, useRef } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useSpring, animated } from '@react-spring/three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import BackButton from '../components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { loadDie } from '../services/dieLoader';

const FACES = [
  { rotation: [0, 0, 0],              value: 1 },
  { rotation: [Math.PI * 0.5, 0, 0],  value: 2 },
  { rotation: [-Math.PI * 0.5, 0, 0], value: 5 },
  { rotation: [0, Math.PI * 0.5, 0],  value: 3 },
  { rotation: [0, -Math.PI * 0.5, 0], value: 4 },
  { rotation: [Math.PI, 0, 0],        value: 6 },
];

const LAYOUTS = {
  1: { scale: 0.9,  positions: [[0, 0, 0]] },
  2: { scale: 0.9, positions: [[-1.2, 0, 0], [1.2, 0, 0]] },
  3: { scale: 0.7, positions: [[-1.0, 0.8, 0], [1.0, 0.8, 0], [0, -0.8, 0]] },
  4: { scale: 0.7, positions: [[-1.0, 0.8, 0], [1.0, 0.8, 0], [-1.0, -0.8, 0], [1.0, -0.8, 0]] },
  5: { scale: 0.7, positions: [[-1.8, 0.8, 0], [0, 0.8, 0], [1.8, 0.8, 0], [-1.0, -0.8, 0], [1.0, -0.8, 0]] },
};

const NUM_PLAYERS = 4;

const SHEET_ROWS = [
  { key: 'navn',          label: 'Navn',                      numeric: false },
  { key: 'ones',          label: "1'ere",                     numeric: true  },
  { key: 'twos',          label: "2'ere",                     numeric: true  },
  { key: 'threes',        label: "3'ere",                     numeric: true  },
  { key: 'fours',         label: "4'ere",                     numeric: true  },
  { key: 'fives',         label: "5'ere",                     numeric: true  },
  { key: 'sixes',         label: "6'ere",                     numeric: true  },
  { key: 'total',         label: 'Total',                     numeric: true, divider: true },
  { key: 'bonus',         label: 'Bonus 50 point (min. 63)',  numeric: true  },
  { key: 'onePair',       label: '1 par',                     numeric: true, divider: true },
  { key: 'twoPairs',      label: '2 par',                     numeric: true  },
  { key: 'threeOfKind',   label: '3 ens',                     numeric: true  },
  { key: 'fourOfKind',    label: '4 ens',                     numeric: true  },
  { key: 'smallStraight', label: 'Lille straight 1-2-3-4-5',  numeric: true  },
  { key: 'largeStraight', label: 'Stor straight 2-3-4-5-6',   numeric: true  },
  { key: 'fullHouse',     label: 'Hus 3+2 ens',               numeric: true  },
  { key: 'chance',        label: 'Chance',                    numeric: true  },
  { key: 'yatzy',         label: 'Yatzy',                     numeric: true  },
  { key: 'ialt',          label: 'I alt',                     numeric: true, divider: true },
];

function initSheetData() {
  const data = {};
  SHEET_ROWS.forEach(r => { data[r.key] = Array(NUM_PLAYERS).fill(''); });
  return data;
}

function calcBestValue(rowKey, faceValues) {
  const dice = faceValues.filter(v => v !== null);
  if (dice.length === 0) return 0;
  const counts = Array(7).fill(0);
  dice.forEach(v => counts[v]++);

  switch (rowKey) {
    case 'ones':   return counts[1] * 1;
    case 'twos':   return counts[2] * 2;
    case 'threes': return counts[3] * 3;
    case 'fours':  return counts[4] * 4;
    case 'fives':  return counts[5] * 5;
    case 'sixes':  return counts[6] * 6;
    case 'onePair': {
      for (let v = 6; v >= 1; v--) if (counts[v] >= 2) return v * 2;
      return 0;
    }
    case 'twoPairs': {
      const pairs = [];
      for (let v = 6; v >= 1; v--) if (counts[v] >= 2) pairs.push(v);
      return pairs.length >= 2 ? pairs[0] * 2 + pairs[1] * 2 : 0;
    }
    case 'threeOfKind': {
      for (let v = 6; v >= 1; v--) if (counts[v] >= 3) return v * 3;
      return 0;
    }
    case 'fourOfKind': {
      for (let v = 6; v >= 1; v--) if (counts[v] >= 4) return v * 4;
      return 0;
    }
    case 'smallStraight':
      return [1,2,3,4,5].every(v => counts[v] >= 1) ? 15 : 0;
    case 'largeStraight':
      return [2,3,4,5,6].every(v => counts[v] >= 1) ? 20 : 0;
    case 'fullHouse': {
      let three = 0, two = 0;
      for (let v = 6; v >= 1; v--) {
        if (counts[v] >= 3 && !three) three = v;
        else if (counts[v] >= 2 && !two) two = v;
      }
      return three && two ? three * 3 + two * 2 : 0;
    }
    case 'chance':
      return dice.reduce((s, v) => s + v, 0);
    case 'yatzy':
      return dice.length === 5 && dice.every(v => v === dice[0]) ? 50 : 0;
    default: return 0;
  }
}

function Die({ rotation, position, dieScale, isLocked, onPress }) {
  const [scene, setScene] = useState(null);
  const originalColors = useRef({});

  const { rot, zOff } = useSpring({
    rot: rotation,
    zOff: isLocked ? -0.5 : 0,
    config: { mass: 1, tension: 120, friction: 20 },
  });

  useEffect(() => {
    if (!scene) return;
    scene.traverse(child => {
      if (child.isMesh) {
        if (!(child.uuid in originalColors.current)) {
          originalColors.current[child.uuid] = child.material.color.clone();
        }
        const orig = originalColors.current[child.uuid];
        if (isLocked) {
          child.material.color.setRGB(orig.r * 0.5, orig.g * 0.5, orig.b * 0.5);
        } else {
          child.material.color.copy(orig);
        }
      }
    });
  }, [isLocked, scene]);

  useEffect(() => {
    async function load() {
      try {
        const asset = Asset.fromModule(require('../assets/high-poly-die.glb'));
        await asset.downloadAsync();
        const file = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: 'base64',
        });
        const binary = atob(file);
        const buf = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);

        new GLTFLoader().parse(buf.buffer, '', (gltf) => {
          const s = gltf.scene;
          s.updateWorldMatrix(true, true);
          const box = new THREE.Box3().setFromObject(s);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scale = 2 / maxDim;
            s.scale.setScalar(scale);
            s.position.set(
              -center.x * scale,
              -center.y * scale,
              -center.z * scale
            );
          }
          setScene(s);
        }, (err) => console.error('GLTFLoader error:', err));
      } catch (e) {
        console.error('Load error:', e);
      }
    }
    load();
  }, []);

  if (!scene) return null;
  return (
    <animated.group
      rotation={rot}
      position={zOff.to(z => [position[0], position[1], position[2] + z])}
      scale={[dieScale, dieScale, dieScale]}
      onClick={onPress}
    >
      <primitive object={scene} />
    </animated.group>
  );
}


export default function YatzyGameScreen({ navigation }) {
  const [diceCount, setDiceCount] = useState(5);
  const [rotations, setRotations] = useState([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]);
  const [lockedDice, setLockedDice] = useState([false, false, false, false, false]);
  const [faceValues, setFaceValues] = useState([null, null, null, null, null]);
  const [diceVisible, setDiceVisible] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetData, setSheetData] = useState(initSheetData);
  const [savedCells, setSavedCells] = useState(() => {
    const s = {};
    SHEET_ROWS.forEach(r => { s[r.key] = Array(NUM_PLAYERS).fill(false); });
    return s;
  });
  const [pendingEntry, setPendingEntry] = useState(null);
  const rollCount = useRef(0);

  function updateSheet(rowKey, playerIndex, value) {
    setSheetData(prev => ({
      ...prev,
      [rowKey]: prev[rowKey].map((v, i) => i === playerIndex ? value : v),
    }));
  }

  function handleCellPress(rowKey, playerIndex) {
    if (savedCells[rowKey][playerIndex]) return;
    const value = String(calcBestValue(rowKey, faceValues));
    setPendingEntry({ rowKey, playerIndex, value });
  }

  function handleSave() {
    if (!pendingEntry) return;
    const { rowKey, playerIndex, value } = pendingEntry;
    updateSheet(rowKey, playerIndex, value);
    setSavedCells(prev => ({
      ...prev,
      [rowKey]: prev[rowKey].map((s, i) => i === playerIndex ? true : s),
    }));
    setPendingEntry(null);
  }

  function handleCancel() {
    setPendingEntry(null);
  }

  const layout = LAYOUTS[diceCount];

  function rollAllDice() {
    rollCount.current += 1;
    const spin = Math.PI * 4 * rollCount.current;
    const newFaceValues = [...faceValues];
    setRotations(prev => prev.map((rot, i) => {
      if (lockedDice[i]) return rot;
      const face = FACES[Math.floor(Math.random() * FACES.length)];
      newFaceValues[i] = face.value;
      return [spin + face.rotation[0], spin + face.rotation[1], spin + face.rotation[2]];
    }));
    setFaceValues(newFaceValues);
  }

  function toggleDieLock(index) {
    setLockedDice(prev => prev.map((locked, i) => i === index ? !locked : locked));
  }

  function addDie() {
    if (diceCount < 5) {
      setDiceCount(c => c + 1);
      setRotations(prev => [...prev, [0, 0, 0]]);
      setLockedDice(prev => [...prev, false]);
      setFaceValues(prev => [...prev, null]);
    }
  }

  function removeDie() {
    if (diceCount > 1) {
      setDiceCount(c => c - 1);
      setRotations(prev => prev.slice(0, -1));
      setLockedDice(prev => prev.slice(0, -1));
      setFaceValues(prev => prev.slice(0, -1));
    }
  }

  return (
    <ImageBackground source={require("../assets/wood-table.png")} style={styles.screen}>
      <BackButton navigation={navigation} />
      <Pressable style={styles.sheetButton} onPress={() => setSheetVisible(true)}>
        <Ionicons name="list" size={22} color="white" />
      </Pressable>

      {sheetVisible && (
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setSheetVisible(false)} />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Yatzy</Text>
              <Pressable onPress={() => setSheetVisible(false)}>
                <Ionicons name="close" size={26} color="white" />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {SHEET_ROWS.map((row, rowIdx) => (
                <View key={row.key} style={[styles.sheetRow, row.divider && styles.sheetRowDivider, rowIdx % 2 === 0 && styles.sheetRowAlt]}>
                  <Text style={styles.sheetLabel} numberOfLines={1}>{row.label}</Text>
                  {Array.from({ length: NUM_PLAYERS }).map((_, pi) => {
                    if (row.key === 'navn') {
                      return (
                        <TextInput
                          key={pi}
                          style={styles.sheetCell}
                          value={sheetData[row.key][pi]}
                          onChangeText={v => updateSheet(row.key, pi, v)}
                          placeholder="—"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          textAlign="center"
                        />
                      );
                    }
                    const isPending = pendingEntry?.rowKey === row.key && pendingEntry?.playerIndex === pi;
                    const isSaved = savedCells[row.key][pi];
                    const displayValue = isPending ? pendingEntry.value : sheetData[row.key][pi];
                    return (
                      <Pressable
                        key={pi}
                        style={[styles.sheetCell, isPending && styles.sheetCellPending, isSaved && styles.sheetCellSaved]}
                        onPress={() => handleCellPress(row.key, pi)}
                        disabled={isSaved}
                      >
                        <Text style={[styles.sheetCellText, isPending && styles.sheetCellTextPending]}>
                          {displayValue || '—'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
            {pendingEntry && (
              <View style={styles.sheetActions}>
                <Pressable style={[styles.actionBtn, styles.cancelBtn]} onPress={handleCancel}>
                  <Text style={styles.actionBtnText}>Annullér</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave}>
                  <Text style={styles.actionBtnText}>Gem</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <mesh onClick={diceVisible ? rollAllDice : undefined} position={[0, 0, -2]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {diceVisible && rotations.map((rotation, i) => (
          <Die
            key={i}
            rotation={rotation}
            position={layout.positions[i]}
            dieScale={layout.scale}
            isLocked={lockedDice[i]}
            onPress={diceCount > 1 ? (e) => { e.stopPropagation(); toggleDieLock(i); } : undefined}
          />
        ))}
      </Canvas>
      {!diceVisible && (
        <View style={styles.hiddenOverlay}>
          <Text style={styles.hiddenTitle}>Terningerne er skjult</Text>
          <Text style={styles.hiddenSubtitle}>Tryk på ikonet oppe i højre hjørne for at vise terningerne.</Text>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
  },
  sheetButton: {
    position: 'absolute',
    top: 25,
    right: 20,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    maxHeight: '90%',
    paddingBottom: 30,
    marginHorizontal: 40,
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  sheetTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sheetRowAlt: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sheetRowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  sheetLabel: {
    flex: 1,
    color: 'white',
    fontSize: 13,
    paddingRight: 6,
  },
  sheetCell: {
    width: 52,
    height: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCellPending: {
    borderColor: '#f0c040',
    backgroundColor: 'rgba(240,192,64,0.18)',
  },
  sheetCellSaved: {
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sheetCellText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  sheetCellTextPending: {
    color: '#f0c040',
    fontWeight: 'bold',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  saveBtn: {
    backgroundColor: '#2e7d32',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  hiddenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  hiddenTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  hiddenSubtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  hideButton: {
    position: 'absolute',
    top: 25,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    gap: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  controlText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 28,
  },
});
