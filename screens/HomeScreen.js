import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useGame } from '../context/GameContext';
import DrinkiesPlayerList from '../components/AddPlayer';
import { GAME_SCREENS } from '../navigation/gameScreens';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.75;
const SPACING = 16;
const FULL_SIZE = CARD_WIDTH + SPACING;
const SIDE_SPACING = (width - CARD_WIDTH) / 2;

export default function HomeScreen({ navigation }) {
  const { setGameId, setGameName } = useGame();
  const scrollOffsetRef = useRef(0);
  const [showPlayerList, setShowPlayerList] = React.useState(false);

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    scrollOffsetRef.current = scrollOffset;
  };

  const scrollX = useRef(new Animated.Value(0)).current;

  const games = [
    { id: '1', name: 'Jeg Har Aldrig', color: '#de4545' },
    { id: '2', name: 'Druk Quiz', color: '#45de6b' },
    { id: '3', name: 'Det Hemmelige Spil', color: '#4586de' },
  ];

  const { players, setPlayers, gameId } = useGame();

  const handleReady = () => {
      const screen = GAME_SCREENS[gameId];
      if (screen) {
        navigation.navigate(screen);
      } else {
        navigation.navigate('Home');
      }
    };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title}>Booze Game</Text>

      <View style={styles.carouselWrapper}>
        <Animated.FlatList
          data={games}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={FULL_SIZE}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: SIDE_SPACING - (SPACING / 2),
            alignItems: 'center',
          }}
          onScrollEndDrag={handleScroll}
          onMomentumScrollEnd={handleScroll}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: true,
              listener: handleScroll,
            }
          )}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * FULL_SIZE,
              index * FULL_SIZE,
              (index + 1) * FULL_SIZE,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.9, 1.05, 0.9],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.7, 1, 0.7],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View style={[
                styles.shadowWrapper,
                { transform: [{ scale }], opacity }
              ]}>
                <View style={[styles.card, { backgroundColor: item.color }]}>
                  <View style={styles.cardBody} />
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardText}>{item.name}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          }}
        />
      </View>

      <View style={styles.pagination}>
        {games.map((_, index) => {
          const inputRange = [
            (index - 1) * FULL_SIZE,
            index * FULL_SIZE,
            (index + 1) * FULL_SIZE,
          ];

          const scaleX = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1, 1],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[styles.dot, { opacity: dotOpacity, transform: [{ scaleX }] }]}
            />
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => {
          const currentIndex = Math.round(scrollOffsetRef.current / FULL_SIZE);
          const activeGame = games[currentIndex];
          if (activeGame) {
            setGameId(activeGame.id);
            setGameName(activeGame.name);
            setShowPlayerList(true);
          }
        }}
      >
        <Text style={styles.buttonText}>Play</Text>
      </TouchableOpacity>

      {showPlayerList && (
        <DrinkiesPlayerList
          players={players}
          setPlayers={setPlayers}
          onReady={handleReady}
          onClose={() => setShowPlayerList(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '500',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  carouselWrapper: {
    height: 480,
    width: '100%',
  },
  shadowWrapper: {
    width: CARD_WIDTH,
    height: 400,
    marginHorizontal: SPACING / 2,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  card: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'flex-end',
    overflow: "hidden",
  },
  cardBody: {
    flex: 1,
  },
  cardFooter: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: "flex-end",
  },
  cardText: {
    fontSize: 20,
    fontWeight: '700',
  },
  pagination: {
    flexDirection: 'row',
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 100,
    borderRadius: 35,
    elevation: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
