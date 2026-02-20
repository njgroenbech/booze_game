import React, { useMemo, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ImageBackground,
  Animated,
} from 'react-native';
import BackButton from '../components/BackButton';
import PlayingCard, { CARD_WIDTH, CARD_HEIGHT } from '../components/fuckTheDealer/PlayingCard';
import DeckOfCards from "../services/DeckOfCards";

const CARD_GAP = 20;

const FuckTheDealerScreen = ({ navigation }) => {
  // useMemo ensures the deck is only initialized ONCE.
  const deck = useMemo(() => new DeckOfCards().shuffle(), []);
  const [displayedCard, setDisplayedCard] = useState(null);
  const [animatingCard, setAnimatingCard] = useState(null);
  const [deckEmpty, setDeckEmpty] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleDraw = () => {
    if (!deck.isEmpty) {
      const card = deck.drawNextCard();
      slideAnim.setValue(-(CARD_WIDTH + CARD_GAP));
      setAnimatingCard(card);
      setDeckEmpty(deck.isEmpty);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 20,
        tension: 80,
      }).start(({ finished }) => {
        if (finished) {
          setDisplayedCard(card)
        }
      });
    }
  };

  const handleReset = () => {
    deck.reset().shuffle();
    setDisplayedCard(null);
    setAnimatingCard(null);
    setDeckEmpty(false);
  };

  return (
    <ImageBackground source={require("../assets/wood-table.png")} style={styles.screen}>
      <Pressable style={styles.screen} onPress={handleDraw}>
        <BackButton navigation={navigation} />

        <View style={styles.container}>
          {!deckEmpty && <PlayingCard cardId={null} />}
          {(displayedCard !== null || animatingCard !== null) && (
            <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
              {displayedCard !== null && <PlayingCard cardId={displayedCard} />}
              {animatingCard !== null && (
                <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: slideAnim }] }]}>
                  <PlayingCard cardId={animatingCard} />
                </Animated.View>
              )}
            </View>
          )}
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