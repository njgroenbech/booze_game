import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameId, setGameId] = useState(null);
  const [gameName, setGameName] = useState(null);
  const [players, setPlayers] = useState([]);

  const addPlayer = (name) => {
    if (name.trim()) {
      setPlayers((prev) => [...prev, name.trim()]);
    }
  };

  const removePlayer = (index) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <GameContext.Provider
      value={{
        gameId,
        setGameId,
        gameName,
        setGameName,
        players,
        setPlayers,
        addPlayer,
        removePlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
