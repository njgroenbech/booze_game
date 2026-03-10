import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ImageBackground } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import BackButton from '../components/BackButton';

const FACE_DOTS = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

const DIE_FACE_SIZE = 1.7;
const DIE_HEIGHT = 0.9;
const HALF_HEIGHT = DIE_HEIGHT / 2;
const PIP_RADIUS = 0.105;
const PIP_SPACING = 0.38;
const EDGE_RADIUS = 0.24;
const TOP_PIP_Y = HALF_HEIGHT + 0.006;

const WOOD_OVERLAY = 'rgba(0,0,0,0.08)';
const FULL_TURN = Math.PI * 2;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function Pip({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[PIP_RADIUS, 32]} />
      <meshBasicMaterial color="#14181d" />
    </mesh>
  );
}

function ResultFace({ value }) {
  return (
    <View style={styles.resultFace}>
      <View style={styles.resultFaceGlowTop} />
      <View style={styles.resultFaceGlowBottom} />
      {(FACE_DOTS[value] || []).map(([col, row], index) => (
        <View
          key={`result-${value}-${index}`}
          style={[
            styles.resultDot,
            {
              left: 76 + col * 34 - 12,
              top: 76 + row * 34 - 12,
            },
          ]}
        />
      ))}
    </View>
  );
}

function DiceMesh({ rollToken, faceValue, onSettled }) {
  const groupRef = useRef();
  const shadowRef = useRef();
  const currentRotation = useRef(new THREE.Euler(0, 0, 0, 'XYZ'));
  const animationRef = useRef(null);
  const geometry = useMemo(
    () => new RoundedBoxGeometry(DIE_FACE_SIZE, DIE_HEIGHT, DIE_FACE_SIZE, 8, EDGE_RADIUS),
    []
  );

  const pips = useMemo(
    () =>
      (FACE_DOTS[faceValue] || []).map(([col, row], index) => ({
        key: `top-${faceValue}-${index}`,
        position: [col * PIP_SPACING, TOP_PIP_Y, -row * PIP_SPACING],
      })),
    [faceValue]
  );

  useEffect(() => {
    if (!rollToken) return;

    const endRotation = {
      x: currentRotation.current.x + FULL_TURN * (2 + Math.floor(Math.random() * 2)) + (Math.random() - 0.5) * 1.4,
      y: currentRotation.current.y + FULL_TURN * (2 + Math.floor(Math.random() * 2)) + (Math.random() - 0.5) * 1.4,
      z: currentRotation.current.z + FULL_TURN * (2 + Math.floor(Math.random() * 2)) + (Math.random() - 0.5) * 1.2,
    };

    animationRef.current = {
      start: {
        x: currentRotation.current.x,
        y: currentRotation.current.y,
        z: currentRotation.current.z,
      },
      end: endRotation,
      startTime: null,
      duration: 1.2,
    };
  }, [rollToken, faceValue]);

  useFrame((state, delta) => {
    if (!groupRef.current || !shadowRef.current) return;

    if (!animationRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, currentRotation.current.x, 0.16);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, currentRotation.current.y, 0.16);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, currentRotation.current.z, 0.16);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.18);
      shadowRef.current.scale.x = THREE.MathUtils.lerp(shadowRef.current.scale.x, 1, 0.18);
      shadowRef.current.scale.y = THREE.MathUtils.lerp(shadowRef.current.scale.y, 1, 0.18);
      shadowRef.current.material.opacity = THREE.MathUtils.lerp(shadowRef.current.material.opacity, 0.22, 0.18);
      return;
    }

    if (animationRef.current.startTime === null) {
      animationRef.current.startTime = state.clock.getElapsedTime();
    }

    const elapsed = state.clock.getElapsedTime() - animationRef.current.startTime;
    const progress = Math.min(elapsed / animationRef.current.duration, 1);
    const eased = easeOutCubic(progress);

    groupRef.current.rotation.x = lerp(animationRef.current.start.x, animationRef.current.end.x, eased);
    groupRef.current.rotation.y = lerp(animationRef.current.start.y, animationRef.current.end.y, eased);
    groupRef.current.rotation.z = lerp(animationRef.current.start.z, animationRef.current.end.z, eased);

    const lift = Math.sin(progress * Math.PI) * 1.08;
    const wobble = Math.sin(progress * Math.PI * 6) * 0.045 * (1 - progress);
    groupRef.current.position.y = lift + wobble;

    const squash = 1 - Math.sin(progress * Math.PI) * 0.28;
    shadowRef.current.scale.x = squash;
    shadowRef.current.scale.y = squash * 0.85;
    shadowRef.current.material.opacity = 0.22 - Math.sin(progress * Math.PI) * 0.14;

    if (progress >= 1) {
      currentRotation.current.set(0, 0, 0);
      groupRef.current.rotation.copy(currentRotation.current);
      groupRef.current.position.y = 0;
      shadowRef.current.scale.set(1, 1, 1);
      shadowRef.current.material.opacity = 0.22;
      animationRef.current = null;
      onSettled?.();
    }
  });

  return (
    <>
      <group ref={groupRef} position={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <primitive object={geometry} attach="geometry" />
          <meshPhysicalMaterial
            color="#f6fbff"
            roughness={0.18}
            metalness={0.02}
            clearcoat={0.95}
            clearcoatRoughness={0.12}
            sheen={0.35}
            sheenColor="#ffffff"
          />
        </mesh>

        {pips.map((pip) => (
          <Pip key={pip.key} position={pip.position} />
        ))}
      </group>

      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]}>
        <circleGeometry args={[1.05, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
    </>
  );
}

function DiceScene({ rollToken, faceValue, onSettled }) {
  return (
    <Canvas
      orthographic
      gl={{ antialias: true, alpha: true }}
      style={styles.canvas}
      camera={{ position: [0, 8, 0.001], zoom: 92, near: 0.1, far: 100 }}
      onCreated={({ gl, camera, scene }) => {
        gl.setClearColor(0x000000, 0);
        camera.up.set(0, 0, -1);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        scene.background = null;
      }}
    >
      <ambientLight intensity={1.35} />
      <directionalLight position={[0.8, 7, 0.6]} intensity={2.45} color="#ffffff" />
      <directionalLight position={[-1.2, 3.5, -1.5]} intensity={0.38} color="#d9e8ff" />
      <pointLight position={[0, 5, 0.4]} intensity={0.34} color="#ffffff" />
      <DiceMesh rollToken={rollToken} faceValue={faceValue} onSettled={onSettled} />
    </Canvas>
  );
}

export default function DiceGameScreen({ navigation }) {
  const [rolling, setRolling] = useState(false);
  const [rollToken, setRollToken] = useState(0);
  const [displayValue, setDisplayValue] = useState(5);
  const pendingValueRef = useRef(5);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    pendingValueRef.current = Math.floor(Math.random() * 6) + 1;
    setRollToken((value) => value + 1);
  };

  return (
    <ImageBackground source={require('../assets/wood-table.png')} style={styles.screen}>
      <View style={styles.overlay} pointerEvents="none" />
      <BackButton navigation={navigation} />

      <View style={styles.container}>
        <View style={styles.stage}>
          <View style={[styles.canvasWrap, !rolling && styles.canvasHidden]} pointerEvents="none">
            <DiceScene
              rollToken={rollToken}
              faceValue={displayValue}
              onSettled={() => {
                setDisplayValue(pendingValueRef.current);
                setRolling(false);
              }}
            />
          </View>

          {!rolling && <ResultFace value={displayValue} />}

          <Pressable
            onPress={roll}
            disabled={rolling}
            style={styles.tapTarget}
          />
        </View>

        {!rolling && <Text style={styles.hint}>Tap the dice to roll</Text>}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WOOD_OVERLAY,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stage: {
    width: 360,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasWrap: {
    width: '100%',
    height: '100%',
  },
  canvasHidden: {
    opacity: 0,
  },
  tapTarget: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  canvas: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  resultFace: {
    width: 152,
    height: 152,
    borderRadius: 32,
    backgroundColor: '#f6fbff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 12,
    position: 'absolute',
    overflow: 'hidden',
  },
  resultFaceGlowTop: {
    position: 'absolute',
    top: 10,
    left: 18,
    right: 18,
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  resultFaceGlowBottom: {
    position: 'absolute',
    bottom: 10,
    left: 24,
    right: 24,
    height: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(220, 232, 244, 0.82)',
  },
  resultDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#14181d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  hint: {
    position: 'absolute',
    bottom: 56,
    fontSize: 16,
    color: 'rgba(255,255,255,0.84)',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.42)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
