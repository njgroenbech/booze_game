import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedPlayerItem from './AnimatedPlayerItem';

function randomColor(alpha = 1) {
  const base = Math.floor(Math.random() * 40) + 20;
  const r = base + Math.floor(Math.random() * 12);
  const g = base + Math.floor(Math.random() * 12);
  const b = base + Math.floor(Math.random() * 12);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function DrinkiesPlayerList({ players, setPlayers, onReady, onClose }) {
  const [playerName, setPlayerName] = useState('');
  const idCounter = useRef(0);

  // Internal list with stable IDs so animations target the right item
  const [playerItems, setPlayerItems] = useState(() =>
    players.map(name => ({ id: idCounter.current++, name }))
  );

  // Keep external players in sync whenever playerItems changes
  useEffect(() => {
    setPlayers(playerItems.map(p => p.name));
  }, [playerItems]);

  // Generate 4 random faded colors once per mount for the gradient
  const gradientColors = useMemo(
    () => [randomColor(1), randomColor(1), randomColor(1), randomColor(1)],
    []
  );

  const addPlayer = () => {
    if (playerName.trim()) {
      setPlayerItems(prev => [...prev, { id: idCounter.current++, name: playerName.trim() }]);
      setPlayerName('');
    }
  };

  const removePlayer = (id) => {
    setPlayerItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <TouchableWithoutFeedback onPress={onClose} accessible={false}>
      <View style={styles.container}>
        <View style={styles.backgroundBlur} />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.inner}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Text at top */}
              <Text style={styles.chalkText}>
                Spillet er federe,{'\n'}hvis du tilføjer{'\n'}spillere
              </Text>

              {/* Input field */}
              <TextInput
                style={styles.input}
                placeholder="Skriv navn..."
                placeholderTextColor="rgba(255,255,255,0.55)"
                value={playerName}
                onChangeText={setPlayerName}
                onSubmitEditing={addPlayer}
                maxLength={20}
              />

              {/* Player list */}
              <ScrollView style={styles.playerList} showsVerticalScrollIndicator={true}>
                {playerItems.map(item => (
                  <AnimatedPlayerItem
                    key={item.id}
                    name={item.name}
                    onRemove={() => removePlayer(item.id)}
                  />
                ))}
              </ScrollView>

              {/* Ready button */}
              <View style={styles.readyButtonRow}>
                <TouchableOpacity onPress={onReady} style={styles.readyButtonWrapper}>
                  <Text style={styles.readyButton}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.73)',
  },
  card: {
    width: '90%',
    height: '70%',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  inner: {
    flex: 1,
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 24,
  },
  chalkText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    lineHeight: 38,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 20,
  },
  playerList: {
    flex: 1,
    marginBottom: 16,
  },
  readyButtonRow: {
    alignItems: 'center',
  },
  readyButtonWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  readyButton: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
