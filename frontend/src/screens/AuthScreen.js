import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/config';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [nume, setNume] = useState('');
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !parola.trim() || (!isLogin && !nume.trim())) {
      return Alert.alert('Eroare', 'Completeaza toate campurile');
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin
        ? { email: email.trim().toLowerCase(), parola }
        : { nume: nume.trim(), email: email.trim().toLowerCase(), parola };
      const { data } = await API.post(endpoint, body);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      Alert.alert('Eroare', err.response?.data?.mesaj || 'Ceva nu a mers');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      const fakeUser = {
        id: 'demo-user',
        nume: 'Demo User',
        email: 'demo@fitapp.com',
      };

      await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
      await AsyncStorage.setItem('token', 'demo-token');

      onLogin(fakeUser);
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut porni modul demo.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image
            source={require('../../gallery/logo_app.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logo}>FitApp</Text>
          <Text style={styles.subtitle}>Nutritie & Sport</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? 'Buna revenire!' : 'Cont nou'}</Text>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Numele tau"
              placeholderTextColor="#888"
              value={nume}
              onChangeText={setNume}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Parola"
            placeholderTextColor="#888"
            value={parola}
            onChangeText={setParola}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Se incarca...' : isLogin ? 'Intra in cont' : 'Creeaza cont'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.demoButtonText}>CONTINUE AS DEMO</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? 'Nu ai cont? Inregistreaza-te' : 'Ai deja cont? Autentifica-te'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 120, height: 120, marginBottom: 12 },
  logo: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  button: {
    backgroundColor: '#00d4aa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  demoButton: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },

  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  switchText: { color: '#00d4aa', textAlign: 'center', fontSize: 14 }
});
