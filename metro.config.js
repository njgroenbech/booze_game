const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb', 'gltf', 'bin');

// Gem Expos originale resolveRequest, så vi ikke overskriver den fuldstændig
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 1. Håndter jeres Three.js fix først
  if (moduleName === 'three') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/three/build/three.cjs'),
      type: 'sourceFile',
    };
  }
  
  // 2. Hvis det ikke er Three.js, så lad Expos originale funktion håndtere det (vigtigt for splash art/billeder)
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  
  // Fallback til standard Metro hvis Expo mod forventning ikke har defineret en
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;