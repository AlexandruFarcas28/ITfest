import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import TopNav from '../../src/components/TopNav';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';

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
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <Text style={commonStyles.kicker}>PROFILE</Text>
      <Text style={commonStyles.title}>Your details</Text>
      <Text style={commonStyles.subtitle}>
        Save your basic information for a more personalized experience.
      </Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Name"
        placeholderTextColor="#777"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Weight (kg)"
        placeholderTextColor="#777"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Height (cm)"
        placeholderTextColor="#777"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Age"
        placeholderTextColor="#777"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[commonStyles.primaryButton, styles.primarySpacing]}
        onPress={() => Alert.alert('Saved', 'Profile saved locally for demo.')}
      >
        <Text style={commonStyles.primaryButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={commonStyles.secondaryButton} onPress={logout}>
        <Text style={commonStyles.secondaryButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  primarySpacing: {
    marginTop: 8,
    marginBottom: 12,
  },
});