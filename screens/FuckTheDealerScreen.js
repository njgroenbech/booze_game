import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import BackButton from '../components/BackButton';
import PlayingCard from '../components/fuckTheDealer/PlayingCard';
import DeckOfCards from "../services/DeckOfCards";

const FuckTheDealerScreen = ({ navigation }) => {
  // useMemo ensures the deck is only initialized ONCE.
  const deck = useMemo(() => new DeckOfCards().shuffle(), []);

  return (
    <View style={styles.screen}>
      <BackButton navigation={navigation} />

      <View style={styles.container}>
        <PlayingCard cardId={deck.drawNextCard()}/>
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