import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddPlayerScreen from '../screens/AddPlayerScreen';
import NeverHaveIEverScreen from '../screens/neverHaveIEverScreen';
import FuckTheDealerScreen from '../screens/FuckTheDealerScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{orientation: 'portrait', animation: 'none'}}/>
        <Stack.Screen
          name="AddPlayer"
          component={AddPlayerScreen}
          options={{orientation: 'portrait', animation: 'none'}}/>
        <Stack.Screen
          name="NeverHaveIEver"
          component={NeverHaveIEverScreen}
          options={{ orientation: 'landscape', animation: 'none' }}
        />
        <Stack.Screen
          name="FuckTheDealer"
          component={FuckTheDealerScreen}
          options={{ orientation: 'landscape', animation: 'none' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
