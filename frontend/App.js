import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from './src/screens/AuthScreen';
import TodoScreen from './src/screens/TodoScreen';

const Stack = createStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('token').then(t => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Todos">
            {props => <TodoScreen {...props} onLogout={() => setToken(null)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth">
            {props => <AuthScreen {...props} onLogin={setToken} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
