import { useState, useEffect, useRef } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useSpring, animated } from '@react-spring/three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import BackButton from '../components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { loadDie } from '../services/dieLoader';

const FACES = [
  [0, 0, 0],
  [Math.PI * 0.5, 0, 0],
  [-Math.PI * 0.5, 0, 0],
  [0, Math.PI * 0.5, 0],
  [0, -Math.PI * 0.5, 0],
  [Math.PI, 0, 0],
];

const LAYOUTS = {
  1: { scale: 0.9,  positions: [[0, 0, 0]] },
  2: { scale: 0.9, positions: [[-1.2, 0, 0], [1.2, 0, 0]] },
  3: { scale: 0.7, positions: [[-1.0, 0.8, 0], [1.0, 0.8, 0], [0, -0.8, 0]] },
  4: { scale: 0.7, positions: [[-1.0, 0.8, 0], [1.0, 0.8, 0], [-1.0, -0.8, 0], [1.0, -0.8, 0]] },
  5: { scale: 0.7, positions: [[-1.8, 0.8, 0], [0, 0.8, 0], [1.8, 0.8, 0], [-1.0, -0.8, 0], [1.0, -0.8, 0]] },
};

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

export default function ClassicCardGameScreen({ navigation }) {
  const [diceCount, setDiceCount] = useState(1);
  const [rotations, setRotations] = useState([[0, 0, 0]]);
  const [lockedDice, setLockedDice] = useState([false]);
  const [diceVisible, setDiceVisible] = useState(true);
  const rollCount = useRef(0);

  const layout = LAYOUTS[diceCount];

  function rollAllDice() {
    rollCount.current += 1;
    const spin = Math.PI * 4 * rollCount.current;
    setRotations(prev => prev.map((rot, i) => {
      if (lockedDice[i]) return rot;
      const [fx, fy, fz] = FACES[Math.floor(Math.random() * FACES.length)];
      return [spin + fx, spin + fy, spin + fz];
    }));
  }

  function toggleDieLock(index) {
    setLockedDice(prev => prev.map((locked, i) => i === index ? !locked : locked));
  }

  function addDie() {
    if (diceCount < 5) {
      setDiceCount(c => c + 1);
      setRotations(prev => [...prev, [0, 0, 0]]);
      setLockedDice(prev => [...prev, false]);
    }
  }

  function removeDie() {
    if (diceCount > 1) {
      setDiceCount(c => c - 1);
      setRotations(prev => prev.slice(0, -1));
      setLockedDice(prev => prev.slice(0, -1));
    }
  }

  return (
    <ImageBackground source={require("../assets/wood-table.png")} style={styles.screen}>
      <BackButton navigation={navigation} />
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
      <TouchableOpacity style={styles.hideButton} onPress={() => setDiceVisible(v => !v)}>
        <Ionicons name={diceVisible ? 'eye' : 'eye-off'} size={22} color="white" />
      </TouchableOpacity>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, diceCount >= 5 && styles.controlButtonDisabled]}
          onPress={addDie}
        >
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, diceCount <= 1 && styles.controlButtonDisabled]}
          onPress={removeDie}
        >
          <Text style={styles.controlText}>−</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
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
