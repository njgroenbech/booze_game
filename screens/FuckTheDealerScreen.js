import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import BackButton from '../components/BackButton';
import PlayingCard from '../components/fuckTheDealer/PlayingCard';
import DeckOfCards from "../services/DeckOfCards";

const FuckTheDealerScreen = ({ navigation }) => {
  // useMemo ensures the deck is only initialized ONCE.
  const deck = useMemo(() => new DeckOfCards().shuffle(), []);
  const [drawnCard, setDrawnCard] = useState(null);
  const [deckEmpty, setDeckEmpty] = useState(false);

  const handleDraw = () => {
    if (!deck.isEmpty) {
      const card = deck.drawNextCard();
      setDrawnCard(card);
      setDeckEmpty(deck.isEmpty);
    }
  };

  const handleReset = () => {
    deck.reset().shuffle();
    setDrawnCard(null);
    setDeckEmpty(false);
  };

  return (
    <ImageBackground source={require("../assets/wood-table.png")}>
      <TouchableOpacity style={styles.screen} onPress={handleDraw} activeOpacity={1}>
        <BackButton navigation={navigation} />

        <View style={styles.container}>
          {!deckEmpty && <PlayingCard cardId={null} />}
          {drawnCard !== null && <PlayingCard cardId={drawnCard} />}
        </View>

        {deckEmpty && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}

      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  resetButton: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FuckTheDealerScreen;