import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Pressable,
  ImageBackground,
} from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import BackButton from '../components/BackButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as THREE from 'three';

function Die() {
  const [scene, setScene] = useState(null);
  const ref = useRef();

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
          // Force matrix updates so Box3 gets real values
          s.updateWorldMatrix(true, true);
          const box = new THREE.Box3().setFromObject(s);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          console.log('GLB loaded, size:', size, 'maxDim:', maxDim);
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

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.8;
      ref.current.rotation.z += delta * 0.2;
    }
  });

  if (!scene) return null;
  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

export default function ClassicCardGameScreen ({ navigation }) {
  return (
    <ImageBackground source={require("../assets/wood-table.png")} style={styles.screen}>
      <Pressable style={styles.screen}>
        <BackButton navigation={navigation} />
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <Die />
        </Canvas>
      </Pressable>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    height: "100%",
  },
});
