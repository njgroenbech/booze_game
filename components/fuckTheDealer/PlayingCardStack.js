import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PlayingCard, { CARD_WIDTH, CARD_HEIGHT } from './PlayingCard';

export const CARD_GAP = 20;

// Only the top MAX_VISIBLE cards are ever rendered. Cards deeper in the stack
// are completely hidden behind those above them, so unmounting them is
// imperceptible while keeping the rendered component count constant.
const MAX_VISIBLE = 6;
const MAX_OFFSET_XY = 10;
const MAX_TILT = 6;

const randomRange = (min, max) => Math.random() * (max - min) + min;

// Each card owns its animation value, initialized off-screen so the very first
// render already shows it at the correct start position — no flash at rest,
// no shared animation state to interfere with other cards.
const DrawnCard = ({ cardId, offsetX, offsetY, tilt, zIndex }) => {
  const slideAnim = useRef(new Animated.Value(-(CARD_WIDTH + CARD_GAP))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: offsetX,
      useNativeDriver: true,
      friction: 20,
      tension: 80,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex,
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
};

const PlayingCardStack = ({ drawnCards }) => {
  const offsetsRef = useRef([]);

  // Clear cached offsets when the deck is reset.
  if (drawnCards.length === 0) {
    offsetsRef.current = [];
  }

  // Append a stable random offset for each newly drawn card.
  while (offsetsRef.current.length < drawnCards.length) {
    offsetsRef.current.push({
      x: randomRange(-MAX_OFFSET_XY, MAX_OFFSET_XY),
      y: randomRange(-MAX_OFFSET_XY, MAX_OFFSET_XY),
      tilt: randomRange(-MAX_TILT, MAX_TILT),
    });
  }

  // Slice to the last MAX_VISIBLE cards. Use globalIndex as the key so
  // existing DrawnCard instances are reused (their settled animations stay put)
  // and only the incoming top card mounts fresh.
  const startIndex = Math.max(0, drawnCards.length - MAX_VISIBLE);
  const visibleCards = drawnCards.slice(startIndex);

  // Always render the container at full card size so the face-down deck
  // never shifts position when the first card is drawn.
  return (
    <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      {visibleCards.map((cardId, i) => {
        const globalIndex = startIndex + i;
        const { x, y, tilt } = offsetsRef.current[globalIndex];
        return (
          <DrawnCard
            key={globalIndex}
            cardId={cardId}
            offsetX={x}
            offsetY={y}
            tilt={tilt}
            zIndex={globalIndex + 1}
          />
        );
      })}
    </View>
  );
};

export default PlayingCardStack;
