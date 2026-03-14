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

        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? 'Buna revenire!' : 'Cont nou'}</Text>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Numele tau"
              placeholderTextColor={COLORS.muted}
              value={nume}
              onChangeText={setNume}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Parola"
            placeholderTextColor={COLORS.muted}
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
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 120, height: 120, marginBottom: 12 },
  logo: { fontSize: 48, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.muted, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  input: {
    backgroundColor: COLORS.cardInner,
    borderRadius: RADIUS.md,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  demoButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },

  demoButtonText: {
    color: COLORS.highlight,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  buttonText: { color: COLORS.accentDark, fontSize: 16, fontWeight: 'bold' },
  switchText: { color: COLORS.highlight, textAlign: 'center', fontSize: 14 }
});
