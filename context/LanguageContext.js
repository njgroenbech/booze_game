import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STRINGS } from '../i18n/strings';

const LANGUAGE_STORAGE_KEY = 'booze-game-language';

const LanguageContext = createContext();

function resolve(key, language) {
  const entry = key.split('.').reduce((node, part) => node?.[part], STRINGS);
  if (!entry) return key;
  return entry[language] ?? entry.da;
}

function interpolate(template, vars) {
  if (!vars) return template;
  return Object.keys(vars).reduce(
    (str, name) => str.replaceAll(`{${name}}`, vars[name]),
    template
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('da');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
      if (stored === 'da' || stored === 'en') {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'da' ? 'en' : 'da');
  };

  const t = (key, vars) => interpolate(resolve(key, language), vars);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
