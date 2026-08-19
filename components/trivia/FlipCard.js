import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export const FLIP_DURATION_MS = 260;

// Generic 3D flip wrapper: renders `front` normally (which sizes the box)
// and `back` absolutely on top of it, rotating both around the Y axis as
// `flipped` toggles. Knows nothing about trivia - just flips two nodes.
export default function FlipCard({ flipped, front, back, style }) {
  const progress = useRef(new Animated.Value(flipped ? 1 : 0)).current;

  useEffect(() => {
    progress.stopAnimation();
    const animation = Animated.timing(progress, {
      toValue: flipped ? 1 : 0,
      duration: FLIP_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [flipped]);

  const frontRotateY = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotateY = progress.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = progress.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = progress.interpolate({ inputRange: [0, 0.499, 0.5, 1], outputRange: [0, 0, 1, 1] });

  return (
    <View style={style}>
      <Animated.View
        collapsable={false}
        renderToHardwareTextureAndroid
        style={[
          styles.face,
          { opacity: frontOpacity, transform: [{ perspective: 1400 }, { rotateY: frontRotateY }] },
        ]}
      >
        {front}
      </Animated.View>
      <Animated.View
        collapsable={false}
        renderToHardwareTextureAndroid
        style={[
          styles.face,
          styles.backFace,
          { opacity: backOpacity, transform: [{ perspective: 1400 }, { rotateY: backRotateY }] },
        ]}
      >
        {back}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  backFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
