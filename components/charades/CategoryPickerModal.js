import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import ScaleInModal from '../addplayers/ScaleInModal';

export default function CategoryPickerModal({ categories, onSelect, onClose }) {
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, []);

  const modalRef = useRef(null);
  const isClosing = useRef(false);

  const animatedClose = (after) => {
    if (isClosing.current) return;
    isClosing.current = true;
    Animated.timing(bgOpacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
    modalRef.current?.exit(() => {
      onClose();
      after?.();
    });
  };

  const handleSelect = (category) => {
    animatedClose(() => onSelect(category));
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => animatedClose()}>
          <BlurView intensity={75} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
      </Animated.View>

      <ScaleInModal ref={modalRef} style={styles.card}>
        <View style={styles.inner}>
          <TouchableOpacity style={styles.closeButton} onPress={() => animatedClose()}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Vælg kategori</Text>
          <Text style={styles.subtitle}>Mixed blander ord fra alle kategorier</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryTile, { backgroundColor: category.color }]}
                onPress={() => handleSelect(category)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.wordCount} ord</Text>
              </TouchableOpacity>
            ))}
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
    width: '90%',
    height: '70%',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  inner: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  categoryTile: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  categoryCount: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
  },
});
