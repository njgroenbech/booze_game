import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TicketCardStack from '../components/neverHaveIEver/TicketCardStack';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

const NeverHaveIEverScreen = ({ navigation }) => {
  const { t } = useLanguage();
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <BackButton navigation={navigation} />
      <View style={styles.content}>
        <TicketCardStack
          body=""
          brand={t('home.title')}
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
