import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AnimatedPlayerItem({ name, onRemove }) {
  const opacity = useRef(new Animated.Value(0)).current;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fade out then call onRemove
  const handlePress = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onRemove());
  };

  return (
    <Animated.View style={[styles.playerItem, { opacity }]}>
      <TouchableOpacity style={styles.row} onPress={handlePress}>
        <Text style={styles.playerName}>{name}</Text>
        <Text style={styles.xMark}>✗</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  playerItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  playerName: {
    flex: 1,
    fontSize: 26,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  xMark: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 16,
    fontWeight: '600',
  },
});
