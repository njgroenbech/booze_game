import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText from './AnimatedText';

const LoadingScreen = ({ onDismiss }) => {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeAnim]);

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <View style={styles.container}>
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          {t('loading.title')}
        </Animated.Text>
        <ActivityIndicator size="large" color="#007bff" style={styles.spinner} />
        <AnimatedText style={styles.subtitle}>{t('loading.subtitle')}</AnimatedText>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212529',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default LoadingScreen;
