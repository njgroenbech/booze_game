import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import { GameProvider } from './context/GameContext';
import AppNavigator from './navigation/AppNavigator';
import { loadDie } from './services/dieLoader';
import { CARD_IMAGES } from './assets/playingCards/CARD_IMAGES';

const STATIC_ASSETS = [
  require('./assets/bamsefar.jpg'),
  require('./assets/cool-kid.jpg'),
  require('./assets/dj-toenail.jpg'),
  require('./assets/wood-table.png'),
  ...Object.values(CARD_IMAGES),
];

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      Asset.loadAsync(STATIC_ASSETS),
      loadDie(),
    ])
      .catch(e => console.warn('Asset preload error:', e))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <GameProvider>
      <AppNavigator />
    </GameProvider>
  );
}
