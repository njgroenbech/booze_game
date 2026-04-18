import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Canvas } from '@react-three/fiber/native';
import { useSpring, animated } from '@react-spring/three';
import BackButton from '../components/BackButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as THREE from 'three';

const FACES = {
  1: [0, 0, 0],
  2: [Math.PI * 0.5, 0, 0],
  3: [-Math.PI * 0.5, 0, 0],
  4: [0, Math.PI * 0.5, 0],
  5: [0, -Math.PI * 0.5, 0],
  6: [Math.PI, 0, 0],
};

const LAYOUT = {
  scale: 0.9,
  positions: [[-1.2, 0, 0], [1.2, 0, 0]],
};

function Die({ rotation, position, dieScale }) {
  const [scene, setScene] = useState(null);

  const { rot } = useSpring({
    rot: rotation,
    config: { mass: 1, tension: 120, friction: 20 },
  });

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
        for (let i = 0; i < binary.length; i += 1) {
          buf[i] = binary.charCodeAt(i);
        }

        new GLTFLoader().parse(
          buf.buffer,
          '',
          (gltf) => {
            const loadedScene = gltf.scene;
            loadedScene.updateWorldMatrix(true, true);
            const box = new THREE.Box3().setFromObject(loadedScene);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            if (maxDim > 0) {
              const scale = 2 / maxDim;
              loadedScene.scale.setScalar(scale);
              loadedScene.position.set(
                -center.x * scale,
                -center.y * scale,
                -center.z * scale
              );
            }

            setScene(loadedScene);
          },
          (err) => console.error('GLTFLoader error:', err)
        );
      } catch (e) {
        console.error('Load error:', e);
      }
    }

    load();
  }, []);

  if (!scene) return null;

  return (
    <animated.group rotation={rot} position={position} scale={[dieScale, dieScale, dieScale]}>
      <primitive object={scene} />
    </animated.group>
  );
}

export default function MayerGameScreen({ navigation }) {
  const [rotations, setRotations] = useState([FACES[1], FACES[1]]);
  const [isCovered, setIsCovered] = useState(true);
  const rollCount = useRef(0);

  function rollDice() {
    rollCount.current += 1;
    const spin = Math.PI * 4 * rollCount.current;
    const nextValues = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1);

    setRotations(nextValues.map((value) => {
      const [fx, fy, fz] = FACES[value];
      return [spin + fx, spin + fy, spin + fz];
    }));
    setIsCovered(false);
  }

  function toggleCover() {
    setIsCovered((current) => !current);
  }

  return (
    <ImageBackground source={require('../assets/wood-table.png')} style={styles.screen}>
      <View style={styles.rollArea}>
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <mesh onClick={rollDice} position={[0, 0, 2]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          {rotations.map((rotation, index) => (
            <Die
              key={index}
              rotation={rotation}
              position={LAYOUT.positions[index]}
              dieScale={LAYOUT.scale}
            />
          ))}
        </Canvas>
      </View>

      {isCovered && (
        <View style={styles.cover} pointerEvents="none">
          <BlurView intensity={140} tint="dark" style={styles.coverBlur}>
            <Text style={styles.coverTitle}>Skjult</Text>
            <Text style={styles.coverText}>Tryk hvor som helst for at slå, eller vælg at se forrige spillers terninger.</Text>
          </BlurView>
        </View>
      )}

      <View style={styles.backButtonLayer}>
        <BackButton navigation={navigation} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryButton} onPress={toggleCover}>
          <Text style={styles.secondaryButtonText}>
            {isCovered ? 'Se terninger' : 'Skjul'}
          </Text>
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
  rollArea: {
    flex: 1,
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  backButtonLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    pointerEvents: 'box-none',
  },
  coverBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 6, 4, 0.85)',
  },
  coverTitle: {
    color: '#fff7e8',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  coverText: {
    marginTop: 12,
    maxWidth: 520,
    color: 'rgba(248, 241, 223, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  controls: {
    position: 'absolute',
    bottom: 28,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 3,
  },
  secondaryButton: {
    minWidth: 280,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 18,
    backgroundColor: 'rgba(28, 18, 12, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(248, 241, 223, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#f8f1df',
    fontSize: 18,
    fontWeight: '800',
  },
});
