import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/config';
import { COLORS, RADIUS } from '../styles/theme';

const LOCAL_USERS_KEY = 'fitapp_local_users';

const normalizeEmail = (value) => value.trim().toLowerCase();

const buildSession = (user) => ({
  token: `local-token-${user.id}`,
  user: {
    id: user.id,
    nume: user.nume,
    email: user.email,
  },
});

async function readLocalUsers() {
  const stored = await AsyncStorage.getItem(LOCAL_USERS_KEY);

  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalUsers(users) {
  await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

async function loginLocally({ email, parola }) {
  const users = await readLocalUsers();
  const normalizedEmail = normalizeEmail(email);
  const user = users.find((item) => item.email === normalizedEmail && item.parola === parola);

  if (!user) {
    throw new Error('Email sau parola invalida');
  }

  return buildSession(user);
}

async function registerLocally({ nume, email, parola }) {
  const users = await readLocalUsers();
  const normalizedEmail = normalizeEmail(email);

  if (users.some((item) => item.email === normalizedEmail)) {
    throw new Error('Exista deja un cont cu acest email');
  }

  const user = {
    id: Date.now().toString(),
    nume: nume.trim(),
    email: normalizedEmail,
    parola,
  };

  users.push(user);
  await writeLocalUsers(users);

  return buildSession(user);
}

function shouldFallbackToLocalAuth(error) {
  return !error?.response;
}

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
        ? { email: normalizeEmail(email), parola }
        : { nume: nume.trim(), email: normalizeEmail(email), parola };

      let data;

      try {
        const response = await API.post(endpoint, body);
        data = response.data;
      } catch (error) {
        if (!shouldFallbackToLocalAuth(error)) throw error;
        data = isLogin ? await loginLocally(body) : await registerLocally(body);
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (error) {
      Alert.alert('Eroare', error.response?.data?.mesaj || error.message || 'Ceva nu a mers');
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
    } catch (_error) {
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

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Nume"
            value={nume}
            onChangeText={setNume}
            placeholderTextColor="#999"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Parolă"
          value={parola}
          onChangeText={setParola}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Se încarcă...' : (isLogin ? 'Conectează-te' : 'Înregistrează-te')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai cont? Conectează-te'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
          <Text style={styles.demoText}>Demo</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.medium,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.medium,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  switchText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  demoButton: {
    alignItems: 'center',
    padding: 10,
  },
  demoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
