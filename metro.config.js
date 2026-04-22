const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb', 'gltf', 'bin');

// three ships both an ESM and CJS build; Metro can end up loading both when
// three/examples/jsm/* files re-import 'three', triggering the
// "Multiple instances of Three.js" warning and GL conflicts.
// Pinning every 'three' import to the CJS build keeps a single instance.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/three/build/three.cjs'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
