import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import TicketCardStack from './components/neverHaveIEver/TicketCardStack';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TicketCardStack
          title="Jeg har aldrig"
          body="...glemt at mobilepay for drinks i byen"
          cornerLabel="Jeg har aldrig"
          brand="Booze Game"
          maxCards={3}
          backgroundImageSource={require('./assets/wood-table.png')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8f6a43',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 16,
  },
});

export default App;
