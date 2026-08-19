import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import WordListModal from '../components/charades/WordListModal';
import CharadesSession, { SESSION_PHASE, FEEDBACK } from '../models/charades/CharadesSession';
import { findCharadesCategory } from '../data/charadesCategories';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText from '../components/AnimatedText';

const ROUND_DURATION_SECONDS = 60;

const CharadesGameScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const category = useMemo(
    () => findCharadesCategory(route.params?.categoryId),
    [route.params?.categoryId]
  );

  const sessionRef = useRef(null);
  if (!sessionRef.current) {
    sessionRef.current = new CharadesSession(category, { durationSeconds: ROUND_DURATION_SECONDS });
  }
  const session = sessionRef.current;

  const [state, setState] = useState(session.state);
  const [activeList, setActiveList] = useState(null);

  useEffect(() => {
    const unsubscribe = session.subscribe(setState);
    session.start();
    return () => {
      unsubscribe();
      session.stop();
    };
  }, [session]);

  function goHome() {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  function playAgain() {
    setActiveList(null);
    session.restart();
  }

  const isFlashing = state.feedback != null;
  const flashStyle =
    state.feedback === FEEDBACK.CORRECT
      ? styles.correctFlash
      : state.feedback === FEEDBACK.PASS
      ? styles.passFlash
      : null;
  const flashTextStyle = isFlashing ? styles.textOnFlash : null;

  return (
    <View style={[styles.container, flashStyle]}>
      <BackButton navigation={navigation} />

      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        {state.phase === SESSION_PHASE.COUNTDOWN && (
          <View style={styles.centerContent}>
            <AnimatedText style={styles.categoryLabel}>{t(state.categoryName)}</AnimatedText>
            <Text style={styles.countdownText}>{state.countdownRemaining}</Text>
            <AnimatedText style={styles.hintText}>{t('charades.hint')}</AnimatedText>
          </View>
        )}

        {state.phase === SESSION_PHASE.PLAYING && (
          <View style={styles.playingContent}>
            <View style={styles.topBar}>
              <Text style={[styles.timerBig, flashTextStyle]}>{state.timeLeft}</Text>
              <AnimatedText style={[styles.scoreBadge, flashTextStyle]}>{t('charades.result.correctCount', { count: state.score })}</AnimatedText>
            </View>

            <View style={styles.wordWrapper}>
              <Text style={[styles.wordText, flashTextStyle]}>{state.currentWord}</Text>
            </View>

            <AnimatedText style={[styles.hintText, flashTextStyle]}>{t('charades.tiltHint')}</AnimatedText>
          </View>
        )}

        {state.phase === SESSION_PHASE.FINISHED && (
          <View style={styles.resultsContent}>
            <AnimatedText style={styles.categoryLabel}>{t(state.categoryName)}</AnimatedText>
            <AnimatedText style={styles.resultsHeading}>{t('charades.timeUp')}</AnimatedText>

            <View style={styles.statsRow}>
              <TouchableOpacity
                style={[styles.statCard, styles.statCardCorrect]}
                activeOpacity={0.8}
                onPress={() => setActiveList('correct')}
              >
                <Text style={styles.statNumber}>{state.correctWords.length}</Text>
                <AnimatedText style={styles.statLabel}>{t('charades.result.correctLabel')}</AnimatedText>
                <AnimatedText style={styles.statHint}>{t('charades.result.tapToReveal')}</AnimatedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statCard, styles.statCardPass]}
                activeOpacity={0.8}
                onPress={() => setActiveList('pass')}
              >
                <Text style={styles.statNumber}>{state.passedWords.length}</Text>
                <AnimatedText style={styles.statLabel}>{t('charades.result.skippedLabel')}</AnimatedText>
                <AnimatedText style={styles.statHint}>{t('charades.result.tapToReveal')}</AnimatedText>
              </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={playAgain}>
                <AnimatedText style={styles.primaryButtonText}>{t('charades.playAgain')}</AnimatedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={goHome}>
                <AnimatedText style={styles.secondaryButtonText}>{t('charades.backHome')}</AnimatedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>

      {activeList && (
        <WordListModal
          title={activeList === 'correct' ? t('charades.result.correctLabel') : t('charades.result.skippedLabel')}
          words={activeList === 'correct' ? state.correctWords : state.passedWords}
          accentColor={activeList === 'correct' ? '#C9EAD3' : '#F6D6E0'}
          onClose={() => setActiveList(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  correctFlash: {
    backgroundColor: '#34C759',
  },
  passFlash: {
    backgroundColor: '#FF3B30',
  },
  textOnFlash: {
    color: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdownText: {
    marginTop: 16,
    fontSize: 96,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  hintText: {
    marginTop: 24,
    fontSize: 15,
    color: 'rgba(0,0,0,0.45)',
    textAlign: 'center',
  },
  playingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  timerBig: {
    fontSize: 72,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  scoreBadge: {
    position: 'absolute',
    right: 70,
    top: 22,
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.45)',
  },
  wordWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 52,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  resultsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  resultsHeading: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 28,
  },
  statCard: {
    width: 150,
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  statCardCorrect: {
    backgroundColor: '#C9EAD3',
  },
  statCardPass: {
    backgroundColor: '#F6D6E0',
  },
  statNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statLabel: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.65)',
  },
  statHint: {
    marginTop: 6,
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 35,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: 'rgba(0,0,0,0.55)',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CharadesGameScreen;
