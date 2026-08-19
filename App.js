import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { GameProvider } from './context/GameContext';
import { LanguageProvider } from './context/LanguageContext';
import AppNavigator from './navigation/AppNavigator';
import LanguageToggle from './components/LanguageToggle';
import { loadDie } from './services/dieLoader';
import { silenceKnownThirdPartyWarnings } from './services/consoleFilters';
import { CARD_IMAGES } from './assets/playingCards/CARD_IMAGES';

silenceKnownThirdPartyWarnings();

const STATIC_ASSETS = [
  require('./assets/bamsefar.jpg'),
  require('./assets/cool-kid.jpg'),
  require('./assets/dj-toenail.jpg'),
  require('./assets/wood-table.png'),
  require('./assets/flags/icons8-denmark-96.png'),
  require('./assets/flags/icons8-great-britain-96.png'),
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
    <SafeAreaProvider>
      <GameProvider>
        <LanguageProvider>
          <View style={{ flex: 1 }}>
            <AppNavigator />
            <LanguageToggle />
          </View>
        </LanguageProvider>
      </GameProvider>
    </SafeAreaProvider>
  );
}
