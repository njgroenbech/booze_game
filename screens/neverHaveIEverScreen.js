import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TicketCardStack from '../components/neverHaveIEver/TicketCardStack';

const NeverHaveIEverScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.content}>
        <TicketCardStack
          title="Jeg har aldrig"
          body="...glemt at mobilepay for drinks i byen"
          cornerLabel="Jeg har aldrig"
          brand="Booze Game"
          maxCards={10}
          backgroundImageSource={require('../assets/wood-table.png')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a1810',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NeverHaveIEverScreen;
