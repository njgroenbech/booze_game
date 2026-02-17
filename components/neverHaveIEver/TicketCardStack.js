import React, { useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import TicketCard from './TicketCard';
import questions from '../../data/questions.json';

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

const drawQuestionWithoutRepeat = () => {
  const colorsWithQuestionsLeft = COLOR_PALETTE.filter(
    (backgroundColor) => sessionRemainingQuestionsByColor[backgroundColor].length > 0
  );

  // Når hele runden er tømt, starter en ny blandet runde.
  if (colorsWithQuestionsLeft.length === 0) {
    sessionRemainingQuestionsByColor = buildRoundBuckets();
  }

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

  return {
    id,
    questionId: questionEntry?.questionId ?? `fallback:${id}`,
    title: questionEntry?.title ?? 'Booze Game',
    body: questionEntry?.body ?? defaultBody,
    cornerLabel: questionEntry?.cornerLabel ?? 'Booze Game',
    tilt: randomRange(-7, 7),
    backgroundColor: questionEntry?.backgroundColor ?? randomFrom(COLOR_PALETTE),
    offsetX: randomRange(-12, 12),
    offsetY: randomRange(-10, 10),
  };
};

const TicketCardStack = ({
  title,
  body,
  cornerLabel,
  brand,
  maxCards = 10,
  backgroundImageSource,
}) => {
  const nextIdRef = useRef(2);
  const [cards, setCards] = useState([createRandomizedCard(1, body)]);

  const addCard = () => {
    // Træk udføres udenfor setState-updateren for at undgå side effects i dev Strict Mode.
    const nextCard = createRandomizedCard(nextIdRef.current, body);
    nextIdRef.current += 1;

    setCards((prevCards) => {
      const nextCards = [...prevCards, nextCard];

      if (nextCards.length <= maxCards) {
        return nextCards;
      }

      return nextCards.slice(nextCards.length - maxCards);
    });
  };

  const stackContent = (
    <Pressable style={styles.stackLayer} onPress={addCard}>
      {cards.map((card, index) => (
        <TicketCard
          key={`${card.id}:${card.questionId}`}
          title={card.title || title}
          body={card.body || body}
          cornerLabel={card.cornerLabel || cornerLabel}
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

      <View style={styles.hintWrapper}>
        <Text style={styles.hintText}>Tryk for at trække et nyt kort</Text>
      </View>
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
});

export default TicketCardStack;
