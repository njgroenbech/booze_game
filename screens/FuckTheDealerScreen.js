import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { GAME_SCREENS } from '../navigation/gameScreens';
import BackButton from '../components/BackButton';

let deckOfCards = {}

const FuckTheDealerScreen = ({ navigation }) => {
  return (
    <View style={styles.screen}>
      <BackButton navigation={navigation} />

      <View style={styles.container}>
        <Text>Hejsa :3</Text>
      </View>
    </View> 
    )
}

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    height: "100%"
  },
  container: {
    flex: 1,
    backgroundColor: '#b7ffb0',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default FuckTheDealerScreen;