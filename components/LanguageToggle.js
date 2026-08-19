import React from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const FLAGS = {
  da: require('../assets/flags/icons8-denmark-96.png'),
  en: require('../assets/flags/icons8-great-britain-96.png'),
};

// Shows the flag of the currently active language.
const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={[styles.button, { top: insets.top + 12 }]}
      onPress={toggleLanguage}
    >
      <Image source={FLAGS[language]} style={styles.flag} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    zIndex: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  flag: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});

export default LanguageToggle;
