import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const randomRange = (min, max) => Math.random() * (max - min) + min;

const pickStartPosition = () => {
  // Pick a random edge: 0=top, 1=bottom, 2=left, 3=right
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: // top
      return { x: randomRange(-SCREEN_WIDTH * 0.3, SCREEN_WIDTH * 0.3), y: -SCREEN_HEIGHT * 0.7 };
    case 1: // bottom
      return { x: randomRange(-SCREEN_WIDTH * 0.3, SCREEN_WIDTH * 0.3), y: SCREEN_HEIGHT * 0.7 };
    case 2: // left
      return { x: -SCREEN_WIDTH * 0.7, y: randomRange(-SCREEN_HEIGHT * 0.3, SCREEN_HEIGHT * 0.3) };
    case 3: // right
    default:
      return { x: SCREEN_WIDTH * 0.7, y: randomRange(-SCREEN_HEIGHT * 0.3, SCREEN_HEIGHT * 0.3) };
  }
};

const CardThrowAnimation = ({ offsetX = 0, offsetY = 0, tilt = 0, skipAnimation = false, style, children }) => {
  const startPos = useRef(pickStartPosition()).current;
  const startRotation = useRef(randomRange(-30, 30)).current;

  const progress = useRef(new Animated.Value(skipAnimation ? 1 : 0)).current;

  useEffect(() => {
    if (skipAnimation) return;

    Animated.spring(progress, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startPos.x, offsetX],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startPos.y, offsetY],
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${startRotation}deg`, '0deg'],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
          opacity,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default CardThrowAnimation;
