import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GameProvider } from './context/GameContext';
import HomeScreen from './screens/HomeScreen';
import AddPlayerScreen from './screens/AddPlayerScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <GameProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddPlayer" component={AddPlayerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GameProvider>
  );
};

export default App;
