import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ImageBackground,
} from 'react-native';
import BackButton from '../components/BackButton';
import PlayingCard from '../components/fuckTheDealer/PlayingCard';
import PlayingCardStack, { CARD_GAP } from '../components/fuckTheDealer/PlayingCardStack';
import CardPreloader from '../components/fuckTheDealer/CardPreloader';
import DeckOfCards from "../services/DeckOfCards";

const PRELOAD_COUNT = 10;

const FuckTheDealerScreen = ({ navigation }) => {
  const deck = useMemo(() => new DeckOfCards().shuffle(), []);
  const [drawnCards, setDrawnCards] = useState([]);
  const [deckEmpty, setDeckEmpty] = useState(false);
  const [upcomingCards, setUpcomingCards] = useState(() => deck.peek(PRELOAD_COUNT));

  const handleDraw = () => {
    if (!deck.isEmpty) {
      const card = deck.drawNextCard();
      setDrawnCards(prev => [...prev, card]);
      setDeckEmpty(deck.isEmpty);
      setUpcomingCards(deck.peek(PRELOAD_COUNT));
    }
  };

  const handleReset = () => {
    deck.reset().shuffle();
    setDrawnCards([]);
    setDeckEmpty(false);
    setUpcomingCards(deck.peek(PRELOAD_COUNT));
  };

  return (
    <ImageBackground source={require("../assets/wood-table.png")} style={styles.screen}>
      <CardPreloader cardIds={upcomingCards} />
      <Pressable style={styles.screen} onPress={handleDraw}>
        <BackButton navigation={navigation} />

        <View style={styles.container}>
          {!deckEmpty && <PlayingCard cardId={null} />}
          <PlayingCardStack drawnCards={drawnCards} />
        </View>

        {deckEmpty && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}

      </Pressable>
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
    gap: CARD_GAP,
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
