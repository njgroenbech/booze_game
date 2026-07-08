import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ImageBackground } from 'react-native';
import BackButton from '../components/BackButton';
import CardEntrance from '../components/trivia/CardEntrance';
import FlipCard from '../components/trivia/FlipCard';
import TriviaCardFace, { CARD_WIDTH, CARD_HEIGHT } from '../components/trivia/TriviaCardFace';
import TriviaSession, { TRIVIA_PHASE } from '../models/trivia/TriviaSession';
import { TRIVIA_CARDS } from '../data/triviaQuestions';

const TriviaGameScreen = ({ navigation }) => {
  const sessionRef = useRef(null);
  if (!sessionRef.current) {
    sessionRef.current = new TriviaSession(TRIVIA_CARDS);
  }
  const session = sessionRef.current;
  const [state, setState] = useState(session.state);

  useEffect(() => session.subscribe(setState), [session]);

  const { phase, card, cardId, presentation } = state;

  return (
    <ImageBackground source={require('../assets/wood-table.png')} style={styles.screen}>
      <Pressable style={styles.screen} onPress={() => session.handleTap()}>
        <BackButton navigation={navigation} />

        <View style={styles.tableArea}>
          <CardEntrance
            cardKey={cardId}
            offsetX={presentation.offsetX}
            offsetY={presentation.offsetY}
            tilt={presentation.tilt}
          >
            <FlipCard
              style={styles.cardBox}
              flipped={phase === TRIVIA_PHASE.ANSWER}
              front={<TriviaCardFace label="Spørgsmål" text={card.question} variant="question" />}
              back={<TriviaCardFace label="Svar" text={card.answer} variant="answer" />}
            />
          </CardEntrance>
        </View>

        <Text style={styles.hintText}>
          {phase === TRIVIA_PHASE.QUESTION ? 'Tryk for at se svaret' : 'Tryk for næste spørgsmål'}
        </Text>
      </Pressable>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
  },
  tableArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  hintText: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
});

export default TriviaGameScreen;
