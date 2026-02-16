import React from 'react';
import { useGame } from '../context/GameContext';
import DrinkiesPlayerList from '../components/AddPlayer';

export default function AddPlayerScreen({ navigation }) {
  const { players, setPlayers } = useGame();

  return (
    <DrinkiesPlayerList
      players={players}
      setPlayers={setPlayers}
      navigation={navigation}
    />
  );
}
