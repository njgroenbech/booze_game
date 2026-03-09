import { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import BackButton from '../components/BackButton';

// Dot positions [col, row] on a 3x3 grid, values ∈ {-1, 0, 1}
const FACES = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

const DICE_SIZE = 120;
const DOT_SPACING = 26;
const DOT_SIZE = 20;
const CENTER = DICE_SIZE / 2;

function DiceFace({ value }) {
  return (
    <View style={styles.dice}>
      {(FACES[value] || []).map(([col, row], i) => (
        <View
          key={i}
          style={[styles.dot, {
            left: CENTER + col * DOT_SPACING - DOT_SIZE / 2,
            top: CENTER + row * DOT_SPACING - DOT_SIZE / 2,
          }]}
        />
      ))}
    </View>
  );
}

export default function DiceGameScreen({ navigation }) {
  const [face, setFace] = useState(null);
  const [rolling, setRolling] = useState(false);
  const resultRef = useRef(null);

  const spinX = useRef(new Animated.Value(0)).current;
  const spinY = useRef(new Animated.Value(0)).current;
  const spinZ = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const scaleDice = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.35)).current;
  const shadowScaleX = useRef(new Animated.Value(1)).current;

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    resultRef.current = Math.floor(Math.random() * 6) + 1;

    spinX.setValue(0);
    spinY.setValue(0);
    spinZ.setValue(0);
    lift.setValue(0);
    scaleDice.setValue(1);
    shadowOpacity.setValue(0.35);
    shadowScaleX.setValue(1);

    const spinsX = 3 + Math.floor(Math.random() * 3);
    const spinsY = 2 + Math.floor(Math.random() * 4);
    const spinsZ = 1 + Math.floor(Math.random() * 2);

    Animated.sequence([
      // Launch
      Animated.parallel([
        Animated.timing(lift, {
          toValue: -170,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleDice, {
          toValue: 1.25,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(shadowScaleX, {
          toValue: 0.55,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.08,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
      // Spin in air
      Animated.parallel([
        Animated.timing(spinX, {
          toValue: spinsX,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(spinY, {
          toValue: spinsY,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(spinZ, {
          toValue: spinsZ,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      // Land with bounce
      Animated.parallel([
        Animated.spring(lift, {
          toValue: 0,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleDice, {
          toValue: 1,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shadowScaleX, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.35,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      spinX.setValue(0);
      spinY.setValue(0);
      spinZ.setValue(0);
      setFace(resultRef.current);
      setRolling(false);
    });
  }, [rolling]);

  const rx = spinX.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const ry = spinY.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rz = spinZ.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ImageBackground source={require("../assets/wood-table.png")} style={styles.screen}>
      <Pressable style={styles.screen} onPress={roll}>
        <BackButton navigation={navigation} />

        <View style={styles.container}>
          <View style={styles.diceArea}>
            {/* Dice */}
            <Animated.View style={{
              transform: [
                { perspective: 700 },
                { translateY: lift },
                { scale: scaleDice },
                { rotateX: rx },
                { rotateY: ry },
                { rotateZ: rz },
              ],
            }}>
              <DiceFace value={face ?? 1} />
            </Animated.View>

            {/* Shadow */}
            <Animated.View style={[
              styles.shadow,
              {
                opacity: shadowOpacity,
                transform: [{ scaleX: shadowScaleX }],
              },
            ]} />
          </View>

          {face !== null && !rolling && (
            <Text style={styles.resultText}>{face}</Text>
          )}

          <Text style={styles.hint}>
            {rolling ? '' : face === null ? 'Tap anywhere to roll' : 'Tap to roll again'}
          </Text>
        </View>
      </Pressable>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 200,
  },
  dice: {
    width: DICE_SIZE,
    height: DICE_SIZE,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#1a1a1a',
  },
  shadow: {
    width: DICE_SIZE * 0.85,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000',
    marginTop: 8,
  },
  resultText: {
    fontSize: 72,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 36,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  hint: {
    position: 'absolute',
    bottom: 60,
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
