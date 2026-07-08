import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import ScaleInModal from '../addplayers/ScaleInModal';

export default function WordListModal({ title, words, accentColor, onClose }) {
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, []);

  const modalRef = useRef(null);
  const isClosing = useRef(false);

  const animatedClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    Animated.timing(bgOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
    modalRef.current?.exit(() => onClose());
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={animatedClose}>
          <BlurView intensity={75} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
      </Animated.View>

      <ScaleInModal ref={modalRef} style={styles.card}>
        <View style={styles.inner}>
          <TouchableOpacity style={styles.closeButton} onPress={animatedClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{title}</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {words.length === 0 ? (
              <Text style={styles.emptyText}>Ingen ord her endnu</Text>
            ) : (
              <View style={styles.chipWrap}>
                {words.map((word, index) => (
                  <View key={`${word}-${index}`} style={[styles.chip, { backgroundColor: accentColor }]}>
                    <Text style={styles.chipText}>{word}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </ScaleInModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    height: '78%',
    borderRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  inner: {
    flex: 1,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    padding: 22,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(0,0,0,0.45)',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
