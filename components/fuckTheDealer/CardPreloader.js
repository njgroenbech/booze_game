import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { CARD_IMAGES } from '../../assets/playingCards/CARD_IMAGES';
import { CARD_WIDTH, CARD_HEIGHT } from './PlayingCard';

// Renders upcoming card images off-screen so they are decoded and uploaded
// to GPU memory before they are needed. Prevents the texture-upload hitch
// that occurs the first time each unique card image is drawn.
const CardPreloader = ({ cardIds }) => {
  if (!cardIds || cardIds.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {cardIds.map(id => (
        <Image
          key={id}
          source={CARD_IMAGES[id]}
          style={styles.image}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -9999,
    opacity: 0,
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
});

export default CardPreloader;
