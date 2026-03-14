import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import AuthScreen from '../src/screens/AuthScreen';

type User = {
  nume: string;
  email: string;
  id: string;
};

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const saved = await AsyncStorage.getItem('user');

        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          router.replace('/(tabs)/home');
          return;
        }
      } catch (err) {
        console.log('checkLogin error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    router.replace('/(tabs)/home');
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Image source={require('../gallery/logo_app.png')} style={styles.logo} />
        <Text style={styles.loadingText}>FitApp</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return null;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});