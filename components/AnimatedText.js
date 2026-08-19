import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

// Drop-in replacement for <Text> that crossfades its content, but ONLY when
// the change is caused by a language toggle - not on every content change.
// Several translated strings also embed live game data (score, dice values,
// trivia cards on flip/draw), which must keep updating instantly; only the
// language-driven swap should animate.
const AnimatedText = ({ children, style, ...rest }) => {
  const { language } = useLanguage();
  const opacity = useRef(new Animated.Value(1)).current;
  const [displayContent, setDisplayContent] = useState(children);
  const previousLanguageRef = useRef(language);

  useEffect(() => {
    if (language === previousLanguageRef.current) {
      // Content changed for a reason other than a language switch (e.g. a
      // score/timer update) - sync immediately, same as plain Text.
      setDisplayContent(children);
      return;
    }
    previousLanguageRef.current = language;

    Animated.timing(opacity, {
      toValue: 0,
      duration: 60,
      useNativeDriver: true,
    }).start(() => {
      setDisplayContent(children);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }).start();
    });
  }, [language, children]);

  return (
    <Animated.Text style={[style, { opacity }]} {...rest}>
      {displayContent}
    </Animated.Text>
  );
};

export default AnimatedText;
