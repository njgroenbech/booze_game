import { LogBox } from 'react-native';

// Known-harmless noise from @react-three/fiber (still uses the deprecated
// THREE.Clock internally) and expo-gl (no-ops a couple of pixelStorei
// parameters three.js sets while uploading textures for the dice models).
const IGNORED_LOG_PATTERNS = [
  'THREE.Clock',
  "gl.pixelStorei() doesn't support this parameter yet",
];

function matchesIgnoredPattern(message) {
  return typeof message === 'string' && IGNORED_LOG_PATTERNS.some((pattern) => message.includes(pattern));
}

export function silenceKnownThirdPartyWarnings() {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (matchesIgnoredPattern(args[0])) return;
    originalWarn(...args);
  };

  const originalLog = console.log;
  console.log = (...args) => {
    if (matchesIgnoredPattern(args[0])) return;
    originalLog(...args);
  };

  LogBox.ignoreLogs(IGNORED_LOG_PATTERNS);
}
