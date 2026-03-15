import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import InteractivePressable from '../../src/components/InteractivePressable';
import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import { fetchProfile, updateProfile } from '../../src/api/health';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { ProfilePayload } from '../../src/types/health';

type ProfileForm = {
  nume: string;
  weight: string;
  height: string;
  age: string;
  activity_level: string;
};

function toFormState(profile: ProfilePayload): ProfileForm {
  return {
    nume: profile.nume || '',
    weight: profile.weight ? String(profile.weight) : '',
    height: profile.height ? String(profile.height) : '',
    age: profile.age ? String(profile.age) : '',
    activity_level: profile.activity_level || 'moderate',
  };
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchProfile();
      setProfile(payload);
      setForm(toFormState(payload));
    } catch (loadError: any) {
      setError(loadError?.response?.data?.error || loadError?.message || 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const initials = useMemo(() => {
    if (!form?.nume) return 'F';
    return form.nume
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, [form?.nume]);

  const saveChanges = async () => {
    if (!form) return;

    setSaving(true);

    try {
      const payload = await updateProfile({
        nume: form.nume.trim(),
        weight: Number(form.weight) || undefined,
        height: Number(form.height) || undefined,
        age: Number(form.age) || undefined,
        activity_level: form.activity_level.trim() || 'moderate',
      });
      setProfile(payload);
      setForm(toFormState(payload));
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({
            ...parsedUser,
            nume: payload.nume,
            email: payload.email,
          }),
        );
      }
      Alert.alert('Profile saved', 'Your profile details are now updated.');
    } catch (saveError: any) {
      Alert.alert('Save failed', saveError?.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await Promise.all([AsyncStorage.removeItem('token'), AsyncStorage.removeItem('user')]);
    router.replace('/');
  };

  const inputStyle = {
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: 50,
    fontSize: 15,
  } as const;

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="PROFILE"
        title="Personal context that keeps the coaching relevant."
        subtitle="Name, body metrics, and activity context influence the goals that the dashboard and meal coach compare against."
      />

      {loading ? (
        <View style={[commonStyles.card, styles.centeredCard]}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.helperCopy}>Loading profile...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <StatePanel title="Profile unavailable" description={error} actionLabel="Try again" onAction={loadProfile} />
      ) : null}

      {!loading && !error && profile && form ? (
        <>
          <View style={styles.identityCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.identityName}>{profile.nume || 'FitApp member'}</Text>
              <Text style={styles.identityEmail}>{profile.email}</Text>
              <Text style={styles.identityMeta}>Goal plan: {profile.resolved_targets.goal_type}</Text>
            </View>
          </View>

          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Personal details</Text>

            <TextInput
              style={[inputStyle, { marginBottom: SPACING.sm }]}
              placeholder="Name"
              placeholderTextColor={COLORS.muted}
              value={form.nume}
              onChangeText={(value) => setForm((current) => (current ? { ...current, nume: value } : current))}
            />

            <View style={styles.inputRow}>
              {[
                ['weight', 'Weight (kg)'],
                ['height', 'Height (cm)'],
                ['age', 'Age'],
              ].map(([field, label]) => (
                <TextInput
                  key={field}
                  style={[inputStyle, styles.inlineInput]}
                  placeholder={label}
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                  value={form[field as keyof ProfileForm]}
                  onChangeText={(value) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            [field]: value,
                          }
                        : current,
                    )
                  }
                />
              ))}
            </View>

            <TextInput
              style={inputStyle}
              placeholder="Activity level"
              placeholderTextColor={COLORS.muted}
              value={form.activity_level}
              onChangeText={(value) =>
                setForm((current) => (current ? { ...current, activity_level: value } : current))
              }
            />
          </View>

          <InteractivePressable style={[commonStyles.primaryButton, styles.actionSpacing]} onPress={saveChanges} disabled={saving}>
            <Text style={commonStyles.primaryButtonText}>{saving ? 'Saving...' : 'Save profile'}</Text>
          </InteractivePressable>

          <InteractivePressable style={commonStyles.secondaryButton} onPress={logout}>
            <Text style={commonStyles.secondaryButtonText}>Logout</Text>
          </InteractivePressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centeredCard: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  helperCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
  },
  identityCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.card,
    marginBottom: SPACING.section,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.accentDark,
    fontSize: 26,
    fontWeight: '900',
  },
  identityName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  identityEmail: {
    color: COLORS.subtitle,
    fontSize: 14,
    marginBottom: 4,
  },
  identityMeta: {
    color: COLORS.muted,
    fontSize: 13,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  inlineInput: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  actionSpacing: {
    marginBottom: SPACING.md,
  },
});
