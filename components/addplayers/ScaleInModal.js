import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Animated } from 'react-native';

/**
 * Wraps children in an Apple-style scale-in entrance animation.
 * Exposes an exit(onDone) method via ref so the parent can trigger
 * the dismiss animation before unmounting.
 */
const ScaleInModal = forwardRef(function ScaleInModal({ children, style }, ref) {
  const scale = useRef(new Animated.Value(0.72)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Expose exit animation to parent
  useImperativeHandle(ref, () => ({
    exit(onDone) {
      // Run spring and opacity independently — unmount after opacity finishes
      // (not after the spring settles, which takes much longer)
      Animated.spring(scale, {
        toValue: 0.72,
        damping: 16,
        stiffness: 340,
        mass: 1,
        useNativeDriver: true,
      }).start();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => onDone?.());
    },
  }));

  // Enter animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 16,
        stiffness: 340,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
});

export default ScaleInModal;
