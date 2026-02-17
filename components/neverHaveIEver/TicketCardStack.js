import React, { useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import TicketCard from './TicketCard';
import questions from '../../data/questions.json';

const EXHAUSTED_BODY_TEXT = 'der er ikke flere spørgsmål tilbage';

const COLOR_PALETTE = ['#f85d63', '#34b0fcff', '#00d031ff', '#f67efcff'];
const QUESTION_KEY_BY_COLOR = {
  '#f85d63': 'jegHarAldrig',
  '#34b0fcff': 'kategori',
  '#00d031ff': 'mestTilbøjeligTil',
  '#f67efcff': 'joker',
};
const LABEL_BY_QUESTION_KEY = {
  jegHarAldrig: 'Jeg har aldrig..',
  kategori: 'Kategori',
  mestTilbøjeligTil: 'Mest tilbøjelig til..',
  joker: 'Joker',
};

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];
const randomRange = (min, max) => Math.random() * (max - min) + min;
const normalizeQuestion = (question) => question.trim().toLowerCase();

const SOURCE_QUESTIONS_BY_COLOR = COLOR_PALETTE.reduce((accumulator, backgroundColor) => {
  const questionKey = QUESTION_KEY_BY_COLOR[backgroundColor];
  const questionPool = Array.isArray(questions[questionKey]) ? questions[questionKey] : [];

  // De-duper pr. kategori, så samme tekst ikke kan optræde flere gange i samme runde.
  const uniqueQuestionPool = [];
  const seenNormalizedQuestions = new Set();
  questionPool.forEach((question) => {
    const normalizedQuestion = normalizeQuestion(question);
    if (!seenNormalizedQuestions.has(normalizedQuestion)) {
      seenNormalizedQuestions.add(normalizedQuestion);
      uniqueQuestionPool.push(question);
    }
  });

  accumulator[backgroundColor] = uniqueQuestionPool;
  return accumulator;
}, {});

const buildRoundBuckets = () =>
  COLOR_PALETTE.reduce((accumulator, backgroundColor) => {
    accumulator[backgroundColor] = [...SOURCE_QUESTIONS_BY_COLOR[backgroundColor]];
    return accumulator;
  }, {});

// Modul-scope state: undgår reset af brugte spørgsmål ved evt. remount af skærmen.
let sessionRemainingQuestionsByColor = buildRoundBuckets();

const resetSessionQuestions = () => {
  sessionRemainingQuestionsByColor = buildRoundBuckets();
};

const drawQuestionWithoutRepeat = () => {
  const availableColors = COLOR_PALETTE.filter(
    (backgroundColor) => sessionRemainingQuestionsByColor[backgroundColor].length > 0
  );
  if (availableColors.length === 0) {
    return null;
  }

  const backgroundColor = randomFrom(availableColors);
  const questionKey = QUESTION_KEY_BY_COLOR[backgroundColor];
  const label = LABEL_BY_QUESTION_KEY[questionKey] ?? 'Booze Game';

  // selectAndRemoveQuestion-princip: vælg random index og fjern med splice.
  const questionArray = sessionRemainingQuestionsByColor[backgroundColor];
  const randomIndex = Math.floor(Math.random() * questionArray.length);
  const [questionBody] = questionArray.splice(randomIndex, 1);

  return {
    questionId: `${questionKey}:${normalizeQuestion(questionBody)}`,
    title: label,
    cornerLabel: label,
    body: questionBody,
    backgroundColor,
  };
};

const createRandomizedCard = (id, defaultBody) => {
  const questionEntry = drawQuestionWithoutRepeat();

  if (!questionEntry) {
    return {
      id,
      questionId: `exhausted:${id}`,
      title: null,
      body: EXHAUSTED_BODY_TEXT,
      cornerLabel: null,
      tilt: randomRange(-7, 7),
      backgroundColor: randomFrom(COLOR_PALETTE),
      offsetX: randomRange(-12, 12),
      offsetY: randomRange(-10, 10),
      isExhausted: true,
    };
  }

  return {
    id,
    questionId: questionEntry.questionId,
    title: questionEntry.title,
    body: questionEntry.body ?? defaultBody,
    cornerLabel: questionEntry.cornerLabel,
    tilt: randomRange(-7, 7),
    backgroundColor: questionEntry.backgroundColor,
    offsetX: randomRange(-12, 12),
    offsetY: randomRange(-10, 10),
    isExhausted: false,
  };
};

const TicketCardStack = ({
  body,
  brand,
  maxCards = 10,
  backgroundImageSource,
}) => {
  const nextIdRef = useRef(2);
  const [cards, setCards] = useState([createRandomizedCard(1, body)]);
  const [hasNoMoreQuestions, setHasNoMoreQuestions] = useState(false);

  const addCard = () => {
    if (hasNoMoreQuestions) {
      return;
    }

    // Træk udføres udenfor setState-updateren for at undgå side effects i dev Strict Mode.
    const nextCard = createRandomizedCard(nextIdRef.current, body);
    nextIdRef.current += 1;

    if (nextCard.isExhausted) {
      setHasNoMoreQuestions(true);
    }

    setCards((prevCards) => {
      const nextCards = [...prevCards, nextCard];

      if (nextCards.length <= maxCards) {
        return nextCards;
      }

      return nextCards.slice(nextCards.length - maxCards);
    });
  };

  const resetQuestions = () => {
    resetSessionQuestions();
    const firstCard = createRandomizedCard(1, body);
    nextIdRef.current = 2;
    setCards([firstCard]);
    setHasNoMoreQuestions(Boolean(firstCard.isExhausted));
  };

  const stackContent = (
    <Pressable style={styles.stackLayer} onPress={addCard} disabled={hasNoMoreQuestions}>
      {cards.map((card, index) => (
        <TicketCard
          key={`${card.id}:${card.questionId}`}
          title={card.title}
          body={card.body}
          cornerLabel={card.cornerLabel}
          brand={brand}
          backgroundColor={card.backgroundColor}
          tilt={card.tilt}
          style={[
            styles.absoluteCard,
            {
              zIndex: index + 1,
              transform: [
                { translateX: card.offsetX },
                { translateY: card.offsetY },
              ],
            },
          ]}
        />
      ))}

      {!hasNoMoreQuestions && (
        <View style={styles.hintWrapper}>
          <Text style={styles.hintText}>Tryk for at trække et nyt kort</Text>
        </View>
      )}

      {hasNoMoreQuestions && (
        <View style={styles.actionsWrapper}>
          <Pressable style={styles.actionButton} onPress={resetQuestions}>
            <Text style={styles.actionButtonText}>Nulstil spørgsmål</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {backgroundImageSource ? (
        <ImageBackground
          source={backgroundImageSource}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          {stackContent}
        </ImageBackground>
      ) : (
        stackContent
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImage: {},
  stackLayer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteCard: {
    position: 'absolute',
    width: '100%',
  },
  hintWrapper: {
    position: 'absolute',
    bottom: 24,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  actionsWrapper: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    minWidth: 220,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TicketCardStack;
