import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#777" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Weight (kg)" placeholderTextColor="#777" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Height (cm)" placeholderTextColor="#777" value={height} onChangeText={setHeight} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Age" placeholderTextColor="#777" value={age} onChangeText={setAge} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Saved', 'Profile saved locally for demo.')}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#0A0A0A', flexGrow: 1 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 18 },
  input: {
    backgroundColor: '#151515',
    borderColor: '#232323',
    borderWidth: 1,
    borderRadius: 16,
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#04130A', fontWeight: '900' },
  logoutButton: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#232323',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutText: { color: '#fff', fontWeight: '800' },
});