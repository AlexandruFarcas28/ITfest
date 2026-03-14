import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import InteractivePressable from '../../src/components/InteractivePressable';
import ScreenHeader from '../../src/components/ScreenHeader';
import TopNav from '../../src/components/TopNav';
import {
  clearStoredProfile,
  getStoredProfile,
  saveStoredProfile,
  type StoredProfile,
} from '../../src/storage/profile';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';
import { profileScreenStyles as styles } from '../../src/styles/screens/tabs';

type StoredUser = {
  id?: string;
  nume?: string;
  email?: string;
};

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        try {
          const [storedProfile, savedUser] = await Promise.all([
            getStoredProfile(),
            AsyncStorage.getItem('user'),
          ]);

          let parsedUser: StoredUser | null = null;

          if (savedUser) {
            try {
              parsedUser = JSON.parse(savedUser) as StoredUser;
            } catch {
              await Promise.all([AsyncStorage.removeItem('token'), AsyncStorage.removeItem('user')]);
            }
          }

          if (!isActive) return;

          setName(storedProfile?.name ?? parsedUser?.nume ?? '');
          setEmail(storedProfile?.email ?? parsedUser?.email ?? '');
          setWeight(storedProfile?.weight ?? '');
          setHeight(storedProfile?.height ?? '');
          setAge(storedProfile?.age ?? '');
        } catch {
          if (isActive) {
            Alert.alert('Eroare', 'Nu s-a putut incarca profilul.');
          }
        }
      };

      loadProfile();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const saveProfile = async () => {
    try {
      const nextProfile: StoredProfile = {
        name,
        email,
        weight,
        height,
        age,
      };
      const normalizedProfile = await saveStoredProfile(nextProfile);
      const savedUser = await AsyncStorage.getItem('user');

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as StoredUser;
          const nextUser = {
            ...parsedUser,
            nume: normalizedProfile.name ?? parsedUser.nume ?? '',
            email: normalizedProfile.email ?? parsedUser.email ?? '',
          };

          await AsyncStorage.setItem('user', JSON.stringify(nextUser));
        } catch {
          await Promise.all([AsyncStorage.removeItem('token'), AsyncStorage.removeItem('user')]);
        }
      }

      setName(normalizedProfile.name ?? '');
      setEmail(normalizedProfile.email ?? '');
      setWeight(normalizedProfile.weight ?? '');
      setHeight(normalizedProfile.height ?? '');
      setAge(normalizedProfile.age ?? '');
      Alert.alert('Salvat', 'Profilul a fost actualizat local.');
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut salva profilul.');
    }
  };

  const logout = async () => {
    await clearStoredProfile();
    await Promise.all([AsyncStorage.removeItem('token'), AsyncStorage.removeItem('user')]);
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="PROFILE"
        title="Personal details that stay current."
        subtitle="Keep your identity and body metrics aligned so the rest of the app reflects the right context."
      />

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

      <InteractivePressable
        style={[commonStyles.primaryButton, styles.primarySpacing]}
        onPress={saveProfile}
      >
        <Text style={commonStyles.primaryButtonText}>Save changes</Text>
      </InteractivePressable>

      <InteractivePressable style={commonStyles.secondaryButton} onPress={logout}>
        <Text style={commonStyles.secondaryButtonText}>Logout</Text>
      </InteractivePressable>
    </ScrollView>
  );
}
