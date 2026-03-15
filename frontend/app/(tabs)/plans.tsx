import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import InteractivePressable from '../../src/components/InteractivePressable';
import { fetchProfile, updateProfile } from '../../src/api/health';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { ProfilePayload } from '../../src/types/health';

const planDefaults = {
  cut: {
    daily_calorie_goal: '1900',
    daily_protein_goal: '155',
    daily_carbs_goal: '170',
    daily_fats_goal: '60',
    water_goal_ml: '2600',
  },
  recomp: {
    daily_calorie_goal: '2200',
    daily_protein_goal: '160',
    daily_carbs_goal: '210',
    daily_fats_goal: '70',
    water_goal_ml: '2700',
  },
  bulk: {
    daily_calorie_goal: '2700',
    daily_protein_goal: '175',
    daily_carbs_goal: '310',
    daily_fats_goal: '80',
    water_goal_ml: '3000',
  },
} as const;

type GoalFormState = {
  goal_type: 'cut' | 'recomp' | 'bulk';
  daily_calorie_goal: string;
  daily_protein_goal: string;
  daily_carbs_goal: string;
  daily_fats_goal: string;
  water_goal_ml: string;
};

function toFormState(profile: ProfilePayload): GoalFormState {
  return {
    goal_type: (profile.goal_type as GoalFormState['goal_type']) || 'recomp',
    daily_calorie_goal: String(
      profile.daily_calorie_goal ?? profile.resolved_targets.daily_calorie_goal,
    ),
    daily_protein_goal: String(
      profile.daily_protein_goal ?? profile.resolved_targets.daily_protein_goal,
    ),
    daily_carbs_goal: String(profile.daily_carbs_goal ?? profile.resolved_targets.daily_carbs_goal),
    daily_fats_goal: String(profile.daily_fats_goal ?? profile.resolved_targets.daily_fats_goal),
    water_goal_ml: String(profile.water_goal_ml ?? profile.resolved_targets.water_goal_ml),
  };
}

export default function PlansScreen() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [form, setForm] = useState<GoalFormState | null>(null);
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
      setError(loadError?.response?.data?.error || loadError?.message || 'Could not load goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const selectedPlan = useMemo(() => form?.goal_type ?? 'recomp', [form]);

  const applyPlanPreset = (goalType: GoalFormState['goal_type']) => {
    setForm((current) => ({
      ...(current || {
        goal_type: goalType,
        ...planDefaults[goalType],
      }),
      goal_type: goalType,
      ...planDefaults[goalType],
    }));
  };

  const saveGoals = async () => {
    if (!form) return;

    setSaving(true);
    try {
      const payload = await updateProfile({
        goal_type: form.goal_type,
        daily_calorie_goal: Number(form.daily_calorie_goal) || undefined,
        daily_protein_goal: Number(form.daily_protein_goal) || undefined,
        daily_carbs_goal: Number(form.daily_carbs_goal) || undefined,
        daily_fats_goal: Number(form.daily_fats_goal) || undefined,
        water_goal_ml: Number(form.water_goal_ml) || undefined,
      });
      setProfile(payload);
      setForm(toFormState(payload));
      Alert.alert('Goals saved', 'Your plan targets are now live across the dashboard and meal coach.');
    } catch (saveError: any) {
      Alert.alert('Save failed', saveError?.message || 'Could not update goals.');
    } finally {
      setSaving(false);
    }
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
        kicker="GOALS"
        title="Choose the target the app should coach against."
        subtitle="These plan targets drive your meal comparisons, dashboard progress, hydration goals, and weekly analytics."
      />

      {loading ? (
        <View style={[commonStyles.card, styles.centeredCard]}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.helperCopy}>Loading your plan...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <StatePanel title="Goals unavailable" description={error} actionLabel="Try again" onAction={loadProfile} />
      ) : null}

      {!loading && !error && form && profile ? (
        <>
          <View style={styles.planList}>
            {(['cut', 'recomp', 'bulk'] as const).map((plan) => (
              <InteractivePressable
                key={plan}
                style={[styles.planCard, selectedPlan === plan && styles.planCardActive]}
                onPress={() => applyPlanPreset(plan)}
              >
                <Text style={styles.planTitle}>{plan.toUpperCase()}</Text>
                <Text style={styles.planCopy}>
                  {plan === 'cut'
                    ? 'Tighter calories and controlled fats.'
                    : plan === 'bulk'
                      ? 'Higher carbs and calories for growth.'
                      : 'Balanced intake for steady composition.'}
                </Text>
              </InteractivePressable>
            ))}
          </View>

          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Custom targets</Text>
            <Text style={styles.helperCopy}>Fine-tune the numbers if you want a plan that is more specific than the preset.</Text>

            <View style={styles.inputGrid}>
              {[
                ['daily_calorie_goal', 'Calories'],
                ['daily_protein_goal', 'Protein'],
                ['daily_carbs_goal', 'Carbs'],
                ['daily_fats_goal', 'Fats'],
                ['water_goal_ml', 'Water ml'],
              ].map(([field, label]) => (
                <TextInput
                  key={field}
                  style={[inputStyle, field === 'water_goal_ml' ? styles.fullWidthInput : styles.halfWidthInput]}
                  placeholder={label}
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                  value={form[field as keyof GoalFormState]}
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

            <InteractivePressable style={commonStyles.primaryButton} onPress={saveGoals} disabled={saving}>
              <Text style={commonStyles.primaryButtonText}>{saving ? 'Saving...' : 'Save goal targets'}</Text>
            </InteractivePressable>
          </View>

          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Current live targets</Text>
            <Text style={styles.liveTargetCopy}>
              {profile.resolved_targets.daily_calorie_goal} kcal • P {profile.resolved_targets.daily_protein_goal}g • C {profile.resolved_targets.daily_carbs_goal}g • F {profile.resolved_targets.daily_fats_goal}g • Water {profile.resolved_targets.water_goal_ml} ml
            </Text>
          </View>
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
    lineHeight: 21,
    marginBottom: SPACING.md,
  },
  planList: {
    gap: SPACING.md,
    marginBottom: SPACING.section,
  },
  planCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  planCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentSoft,
  },
  planTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  planCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  halfWidthInput: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  fullWidthInput: {
    width: '100%',
  },
  liveTargetCopy: {
    color: COLORS.subtitle,
    fontSize: 15,
    lineHeight: 22,
  },
});
