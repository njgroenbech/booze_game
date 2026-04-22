import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let _promise = null;

export function loadDie() {
  if (!_promise) {
    _promise = (async () => {
      const asset = Asset.fromModule(require('../assets/high-poly-die.glb'));
      await asset.downloadAsync();
      const file = await FileSystem.readAsStringAsync(asset.localUri, { encoding: 'base64' });
      const binary = atob(file);
      const buf = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);

      return new Promise((resolve, reject) => {
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
            s.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
          }
          resolve(s);
        }, reject);
      });
    })();
  }
  return _promise;
}
