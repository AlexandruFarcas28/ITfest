import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS } from '../../src/styles/theme';

type StoredUser = {
  nume?: string;
  email?: string;
};

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem('user');

      if (!savedUser) return;

      try {
        const parsedUser = JSON.parse(savedUser) as StoredUser;
        setName(parsedUser.nume ?? '');
        setEmail(parsedUser.email ?? '');
      } catch {
        await AsyncStorage.removeItem('user');
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'F'}</Text>
        </View>

        <View style={styles.identityContent}>
          <Text style={styles.identityName}>{name || 'FitApp member'}</Text>
          <Text style={styles.identityEmail}>{email || 'demo@fitapp.com'}</Text>
        </View>
      </View>

      <View style={commonStyles.sectionRow}>
        <Text style={commonStyles.sectionTitle}>Personal details</Text>
        <Text style={commonStyles.sectionMeta}>Keep profile current</Text>
      </View>

      <View style={commonStyles.card}>
        <TextInput
          style={commonStyles.input}
          placeholder="Name"
          placeholderTextColor={COLORS.muted}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={commonStyles.input}
          placeholder="Weight (kg)"
          placeholderTextColor={COLORS.muted}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <TextInput
          style={commonStyles.input}
          placeholder="Height (cm)"
          placeholderTextColor={COLORS.muted}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />

        <TextInput
          style={[commonStyles.input, styles.inputLast]}
          placeholder="Age"
          placeholderTextColor={COLORS.muted}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={[commonStyles.primaryButton, styles.primarySpacing]}
        onPress={() => Alert.alert('Saved', 'Profile saved locally for demo.')}
      >
        <Text style={commonStyles.primaryButtonText}>Save changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={commonStyles.secondaryButton} onPress={logout}>
        <Text style={commonStyles.secondaryButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.accentDark,
    fontSize: 24,
    fontWeight: '900',
  },
  identityContent: {
    flex: 1,
  },
  identityName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  identityEmail: {
    color: COLORS.subtitle,
    fontSize: 14,
  },
  inputLast: {
    marginBottom: 0,
  },
  primarySpacing: {
    marginTop: 2,
    marginBottom: 12,
  },
});
