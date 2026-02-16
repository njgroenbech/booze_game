import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddPlayerScreen from '../screens/AddPlayerScreen';
import NeverHaveIEverScreen from '../screens/neverHaveIEverScreen';

const Stack = createNativeStackNavigator();

export const GAME_SCREENS = {
  '1': 'NeverHaveIEver',
  // '2': 'DrukQuiz',
  // '3': 'DetHemmeligeSpil',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddPlayer" component={AddPlayerScreen} />
        <Stack.Screen name="NeverHaveIEver" component={NeverHaveIEverScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
