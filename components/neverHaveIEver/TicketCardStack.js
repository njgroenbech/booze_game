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

const createRandomizedCard = (id, defaultBody) => {
  const backgroundColor = randomFrom(COLOR_PALETTE);
  const questionKey = QUESTION_KEY_BY_COLOR[backgroundColor];
  const questionPool = Array.isArray(questions[questionKey]) ? questions[questionKey] : [];
  const randomQuestion = questionPool.length > 0 ? randomFrom(questionPool) : defaultBody;
  const label = LABEL_BY_QUESTION_KEY[questionKey] ?? 'Booze Game';

  return {
    id,
    title: label,
    body: randomQuestion,
    cornerLabel: label,
    tilt: randomRange(-7, 7),
    backgroundColor,
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
    setCards((prevCards) => {
      const nextCard = createRandomizedCard(nextIdRef.current, body);
      nextIdRef.current += 1;
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
          key={card.id}
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
    width: '100%',
    height: 320,
  },
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  backgroundImage: {
    borderRadius: 24,
  },
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
    bottom: -24,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
});

export default TicketCardStack;
