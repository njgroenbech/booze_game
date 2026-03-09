import React, { useMemo, useState, useRef, useEffect } from 'react';
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
import PlayingCard, { CARD_WIDTH } from '../components/classicCardGame/PlayingCard';
import PlayingCardStack, { CARD_GAP } from '../components/classicCardGame/PlayingCardStack';
import CardPreloader from '../components/classicCardGame/CardPreloader';
import DeckOfCards from "../services/DeckOfCards";

const PRELOAD_COUNT = 10;

const ClassicCardGameScreen = ({ navigation }) => {
  const deck = useMemo(() => new DeckOfCards().shuffle(), []);
  const [drawnCards, setDrawnCards] = useState([]);
  const [deckEmpty, setDeckEmpty] = useState(false);
  const [upcomingCards, setUpcomingCards] = useState(() => deck.peek(PRELOAD_COUNT));

  const backOpacity = useRef(new Animated.Value(1)).current;
  const backTranslateX = useRef(new Animated.Value(0)).current;
  const stackOpacity = useRef(new Animated.Value(1)).current;
  const stackTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (deckEmpty) {
      // Step 1: back card springs into the drawn pile (like being drawn)
      Animated.spring(backTranslateX, {
        toValue: CARD_WIDTH + CARD_GAP,
        friction: 8,
        tension: 35,
        useNativeDriver: true,
      }).start(() => {
        // Step 2: hide the back card and slide the stack to center
        backOpacity.setValue(0);
        Animated.spring(stackTranslateX, {
          toValue: -(CARD_WIDTH + CARD_GAP) / 2,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    } else {
      backOpacity.setValue(1);
      backTranslateX.setValue(0);
      stackTranslateX.setValue(0);
    }
  }, [deckEmpty]);

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

  const handleResetPress = () => {
    // Place the back card at the center (where the stack currently is) and show it
    backTranslateX.setValue((CARD_WIDTH + CARD_GAP) / 2);
    backOpacity.setValue(1);

    Animated.parallel([
      // Fade out the drawn cards
      Animated.timing(stackOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      // Slide the back card left to its correct position
      Animated.spring(backTranslateX, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      stackOpacity.setValue(1);
      handleReset();
    });
  };

  return (
    <ImageBackground source={require("../assets/wood-table.png")} style={styles.screen}>
      <CardPreloader cardIds={upcomingCards} />
      <Pressable style={styles.screen} onPress={handleDraw}>
        <BackButton navigation={navigation} />

        <View style={styles.container}>
          <Animated.View style={{ opacity: backOpacity, transform: [{ translateX: backTranslateX }] }}>
            <PlayingCard cardId={null} />
          </Animated.View>
          <Animated.View style={{ opacity: stackOpacity, transform: [{ translateX: stackTranslateX }] }}>
            <PlayingCardStack drawnCards={drawnCards} />
          </Animated.View>
        </View>

        {deckEmpty && (
          <TouchableOpacity style={styles.resetButton} onPress={handleResetPress}>
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

export default ClassicCardGameScreen;
