import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register } from '../api/api';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin]     = useState(true);
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');

  const handleSubmit = async () => {
    try {
      let res;
      if (isLogin) {
        res = await login({ email, password });
      } else {
        res = await register({ username, email, password });
      }
      await AsyncStorage.setItem('token', res.data.token);
      onLogin(res.data.token);
    } catch (err) {
      Alert.alert('Eroare', err.response?.data?.message || 'Ceva n-a mers');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>📝 Todo App</Text>
      <Text style={styles.subtitle}>{isLogin ? 'Bun venit!' : 'Cont nou'}</Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
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
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>{isLogin ? 'Login' : 'Register'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggle}>
          {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Login'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', padding: 24 },
  title:     { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle:  { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  input:     { backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 12, padding: 14,
               marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  btn:       { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  toggle:    { color: '#6C63FF', textAlign: 'center', marginTop: 20, fontSize: 14 },
});