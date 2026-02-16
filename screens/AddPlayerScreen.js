import React from 'react';
import { useGame } from '../context/GameContext';
import DrinkiesPlayerList from '../components/AddPlayer';
import { GAME_SCREENS } from '../navigation/AppNavigator';

export default function AddPlayerScreen({ navigation }) {
  const { players, setPlayers, gameId } = useGame();

  const handleReady = () => {
    const screen = GAME_SCREENS[gameId];
    if (screen) {
      navigation.navigate(screen);
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <DrinkiesPlayerList
      players={players}
      setPlayers={setPlayers}
      onReady={handleReady}
    />
  );
}
