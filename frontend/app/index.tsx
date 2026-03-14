import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from '../src/screens/AuthScreen';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function App() {
  const [user, setUser] = useState<{ nume: string; email: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const saved = await AsyncStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  };

  if (loading) return (
    <View style={styles.loading}>
      <Image
        source={require('../gallery/logo_app.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.loadingText}>FitApp</Text>
    </View>
  );

  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>Logat ca {user.nume}!</Text>
      <Text style={{ color: '#888', marginTop: 8 }}>Ecranele principale vin imediat...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 140, height: 140, marginBottom: 16 },
  loadingText: { color: '#fff', fontSize: 32, fontWeight: 'bold' }
});
