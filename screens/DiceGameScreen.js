import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useSpring, animated } from '@react-spring/three';
import BackButton from '../components/BackButton';
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

function Die({ rotation, position, dieScale }) {
  const [scene, setScene] = useState(null);

  const { rot } = useSpring({
    rot: rotation,
    config: { mass: 1, tension: 120, friction: 20 },
  });

  useEffect(() => {
    loadDie()
      .then(base => setScene(base.clone(true)))
      .catch(e => console.error('Load error:', e));
  }, []);

  if (!scene) return null;
  return (
    <animated.group rotation={rot} position={position} scale={[dieScale, dieScale, dieScale]}>
      <primitive object={scene} />
    </animated.group>
  );
}

export default function ClassicCardGameScreen({ navigation }) {
  const [diceCount, setDiceCount] = useState(1);
  const [rotations, setRotations] = useState([[0, 0, 0]]);
  const rollCount = useRef(0);

  const layout = LAYOUTS[diceCount];

  function rollAllDice() {
    rollCount.current += 1;
    const spin = Math.PI * 4 * rollCount.current;
    setRotations(prev => prev.map(() => {
      const [fx, fy, fz] = FACES[Math.floor(Math.random() * FACES.length)];
      return [spin + fx, spin + fy, spin + fz];
    }));
  }

  function addDie() {
    if (diceCount < 5) {
      setDiceCount(c => c + 1);
      setRotations(prev => [...prev, [0, 0, 0]]);
    }
  }

  function removeDie() {
    if (diceCount > 1) {
      setDiceCount(c => c - 1);
      setRotations(prev => prev.slice(0, -1));
    }
  }

  return (
    <ImageBackground source={require("../assets/wood-table.png")} style={styles.screen}>
      <BackButton navigation={navigation} />
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <mesh onClick={rollAllDice} position={[0, 0, 2]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {rotations.map((rotation, i) => (
          <Die
            key={i}
            rotation={rotation}
            position={layout.positions[i]}
            dieScale={layout.scale}
          />
        ))}
      </Canvas>
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
