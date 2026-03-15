import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import API from '../api/config';
import { clearSession, saveSession } from '../auth/session';
import InteractivePressable from '../components/InteractivePressable';
import { COLORS, RADIUS } from '../styles/theme';
const normalizeEmail = (value) => value.trim().toLowerCase();

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [nume, setNume] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const persistSession = async (session) => {
    await saveSession(session);
    onLogin(session.user);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !nume.trim())) {
      return Alert.alert('Eroare', 'Completeaza toate campurile');
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin
        ? { email: normalizeEmail(email), password }
        : { nume: nume.trim(), email: normalizeEmail(email), password };

      let session;

      const response = await API.post(endpoint, body);
      session = response.data;

      await persistSession(session);
    } catch (error) {
      Alert.alert(
        'Eroare',
        error.response?.data?.error || error.message || 'Ceva nu a mers',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);

    try {
      await clearSession();
      const response = await API.post('/auth/demo');
      await persistSession(response.data);
    } catch (error) {
      Alert.alert(
        'Eroare',
        error.response?.data?.error || error.message || 'Nu s-a putut porni modul demo. Verifica backend-ul.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image
            source={require('../../gallery/logo_app.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logo}>FitApp</Text>
          <Text style={styles.subtitle}>AI meal coaching, smart logging, and habit momentum.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</Text>

          {!isLogin ? (
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={COLORS.muted}
              value={nume}
              onChangeText={setNume}
            />
          ) : null}

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
            placeholder="Password"
            placeholderTextColor={COLORS.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <InteractivePressable style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Create account'}
            </Text>
          </InteractivePressable>

          <InteractivePressable style={styles.demoButton} onPress={handleDemoLogin} disabled={loading}>
            <Text style={styles.demoButtonText}>ENTER DEMO MODE</Text>
          </InteractivePressable>

          <InteractivePressable onPress={() => setIsLogin((current) => !current)} scaleTo={0.99}>
            <Text style={styles.switchText}>
              {isLogin ? 'Need an account? Create one' : 'Already have an account? Sign in'}
            </Text>
          </InteractivePressable>
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
  subtitle: {
    fontSize: 16,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
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
  switchText: { color: COLORS.highlight, textAlign: 'center', fontSize: 14 },
});
