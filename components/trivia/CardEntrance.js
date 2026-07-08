import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const DROP_DISTANCE = 50;

// Plays a small drop/scale/fade-in whenever `cardKey` changes (i.e. a new
// card was drawn) and settles at the given tiny offset/tilt. Re-mounting on
// flip is avoided by keying only on cardKey, not on phase.
export default function CardEntrance({ cardKey, offsetX, offsetY, tilt, children }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.spring(progress, {
      toValue: 1,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [cardKey]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offsetY - DROP_DISTANCE, offsetY],
  });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateX: offsetX }, { translateY }, { scale }, { rotate: `${tilt}deg` }],
      }}
    >
      {children}
    </Animated.View>
  );
}
