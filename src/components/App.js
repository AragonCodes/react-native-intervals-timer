import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TimerScreen from './TimerScreen';
import HomeScreen from './HomeScreen';
import EditPresetScreen from './EditPresetScreen';

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen name="EditPreset" component={EditPresetScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
