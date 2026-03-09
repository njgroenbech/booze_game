import React, { useRef, useEffect, memo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import PlayingCard, { CARD_WIDTH, CARD_HEIGHT } from './PlayingCard';

export const CARD_GAP = 20;

const MAX_VISIBLE = 6;    // how many active (non-fading) cards are shown
const MAX_OFFSET_XY = 14;
const MAX_TILT = 9;

const randomRange = (min, max) => Math.random() * (max - min) + min;

const DrawnCard = memo(({ cardId, offsetX, offsetY, tilt, zIndex, friction, tension, velocity, delay, isExiting }) => {
  const slideAnim = useRef(new Animated.Value(-(CARD_WIDTH + CARD_GAP))).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Slide in from the left on mount.
  useEffect(() => {
    const spring = Animated.spring(slideAnim, {
      toValue: offsetX,
      useNativeDriver: true,
      friction,
      tension,
      velocity,
    });
    if (delay > 0) {
      Animated.sequence([Animated.delay(delay), spring]).start();
    } else {
      spring.start();
    }
  }, []);

  // Fade out when the card is pushed below the visible window.
  // Because the card stays in the render tree and only this prop changes,
  // there is no flash or twitch — the card is always present, just fading.
  useEffect(() => {
    if (isExiting) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isExiting]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          zIndex,
          opacity,
          transform: [
            { translateX: slideAnim },
            { translateY: offsetY },
            { rotate: `${tilt}deg` },
          ],
        },
      ]}
    >
      <PlayingCard cardId={cardId} />
    </Animated.View>
  );
});

const PlayingCardStack = ({ drawnCards }) => {
  const offsetsRef = useRef([]);

  // Clear cached offsets when the deck is reset.
  if (drawnCards.length === 0) {
    offsetsRef.current = [];
  }

  // Assign stable random properties to each newly drawn card.
  while (offsetsRef.current.length < drawnCards.length) {
    offsetsRef.current.push({
      x: randomRange(-MAX_OFFSET_XY, MAX_OFFSET_XY),
      y: randomRange(-MAX_OFFSET_XY, MAX_OFFSET_XY),
      tilt: randomRange(-MAX_TILT, MAX_TILT),
      friction: randomRange(9, 15),
      tension: randomRange(22, 45),
      velocity: randomRange(1, 5),
      delay: Math.floor(randomRange(0, 40)),
    });
  }

  // Render the top MAX_VISIBLE cards plus one exiting card beneath them.
  // The exiting card receives isExiting=true and fades in-place — it is never
  // removed and re-added, which eliminates the twitch seen with the old approach.
  const startIndex = Math.max(0, drawnCards.length - MAX_VISIBLE);
  const renderStart = Math.max(0, startIndex - 1);

  return (
    <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      {drawnCards.slice(renderStart).map((cardId, i) => {
        const globalIndex = renderStart + i;
        const { x, y, tilt, friction, tension, velocity, delay } = offsetsRef.current[globalIndex];
        return (
          <DrawnCard
            key={globalIndex}
            cardId={cardId}
            offsetX={x}
            offsetY={y}
            tilt={tilt}
            zIndex={globalIndex + 1}
            friction={friction}
            tension={tension}
            velocity={velocity}
            delay={delay}
            isExiting={globalIndex < startIndex}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { position: 'absolute' },
});

export default PlayingCardStack;
