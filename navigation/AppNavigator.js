import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddPlayerScreen from '../screens/AddPlayerScreen';
import NeverHaveIEverScreen from '../screens/neverHaveIEverScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{orientation: 'portrait'}}/>
        <Stack.Screen 
          name="AddPlayer" 
          component={AddPlayerScreen} 
          options={{orientation: 'portrait'}}/>
        <Stack.Screen
          name="NeverHaveIEver"
          component={NeverHaveIEverScreen}
          options={{ orientation: 'landscape' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
