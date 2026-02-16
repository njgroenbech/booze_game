import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';

export default function DrinkiesPlayerList({ players, setPlayers, navigation }) {
  const [playerName, setPlayerName] = useState('');

  const addPlayer = () => {
    if (playerName.trim()) {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundBlur} />
      
      {/* Header */}
      <Text style={styles.title}>Drinkies</Text>
      
      {/* Rope decoration */}
      <View style={styles.ropeContainer}>
        <View style={styles.rope} />
      </View>

      {/* Chalkboard */}
      <View style={styles.chalkboard}>
        <View style={styles.chalkboardBorder}>
          {/* Text at top */}
          <Text style={styles.chalkText}>
            Spillet er federe,{'\n'}hvis du tilføjer{'\n'}spillere
          </Text>

          {/* Input field */}
          <TextInput
            style={styles.input}
            placeholder="Skriv navn..."
            placeholderTextColor="#999"
            value={playerName}
            onChangeText={setPlayerName}
            onSubmitEditing={addPlayer}
          />

          {/* Player list */}
          <ScrollView style={styles.playerList} showsVerticalScrollIndicator={true}>
            {players.map((player, index) => (
              <TouchableOpacity
                key={index}
                style={styles.playerItem}
                onPress={() => removePlayer(index)}
              >
                <Text style={styles.xMark}>✗</Text>
                <Text style={styles.playerName}>{player}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Ready button */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.readyButton}>Færdig</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a1810',
    alignItems: 'center',
    paddingTop: 60,
  },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(42, 24, 16, 0.9)',
  },
  title: {
    fontFamily: 'System',
    fontSize: 64,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  ropeContainer: {
    width: 300,
    height: 40,
    alignItems: 'center',
    marginBottom: -20,
    zIndex: 10,
  },
  rope: {
    width: 4,
    height: 40,
    backgroundColor: '#8B7355',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  chalkboard: {
    width: 380,
    height: 600,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  chalkboardBorder: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#666',
    borderRadius: 4,
    padding: 24,
  },
  chalkText: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    lineHeight: 38,
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: '#d4d4d4',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
    fontWeight: '500',
  },
  playerList: {
    flex: 1,
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  xMark: {
    fontSize: 24,
    color: '#fff',
    marginRight: 16,
    fontWeight: '600',
  },
  playerName: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  readyButton: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});