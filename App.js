import React from 'react';
import { GameProvider } from './context/GameContext';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <GameProvider>
      <AppNavigator />
    </GameProvider>
  );
};

export default App;
