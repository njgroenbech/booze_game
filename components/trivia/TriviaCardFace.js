import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const CARD_WIDTH = 400;
export const CARD_HEIGHT = 250;

const VARIANT_COLORS = {
  question: '#3D7DD8',
  answer: '#2FA972',
};

export default function TriviaCardFace({ label, text, variant = 'question' }) {
  const backgroundColor = VARIANT_COLORS[variant] ?? VARIANT_COLORS.question;

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 32,
    borderWidth: 9,
    borderColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  label: {
    position: 'absolute',
    top: 18,
    left: 24,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
});
