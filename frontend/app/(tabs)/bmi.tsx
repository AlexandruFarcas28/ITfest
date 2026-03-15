import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

import {
  fetchBmiDashboard,
  fetchProfile,
  updateProfile,
} from '../../src/api/health';
import BmiHeroCard from '../../src/components/BmiHeroCard';
import BmiInsightGrid from '../../src/components/BmiInsightGrid';
import BmiRangeBar from '../../src/components/BmiRangeBar';
import BmiTrendChart from '../../src/components/BmiTrendChart';
import InteractivePressable from '../../src/components/InteractivePressable';
import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { BmiDashboardPayload, ProfilePayload } from '../../src/types/health';
import {
  bmiCategoryTheme,
  formatBmiValue,
  formatWeightKg,
  goalTypeLabel,
  trendDirectionLabel,
} from '../../src/utils/bmi';

export default function BmiScreen() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [dashboard, setDashboard] = useState<BmiDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');

  const loadBmi = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profilePayload, bmiPayload] = await Promise.all([fetchProfile(), fetchBmiDashboard()]);
      setProfile(profilePayload);
      setDashboard(bmiPayload);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.error || loadError?.message || 'Could not load BMI data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBmi();
    }, [loadBmi]),
  );

  useEffect(() => {
    if (!profile) return;
    setWeightInput(profile.weight ? String(profile.weight) : '');
    setHeightInput(profile.height ? String(profile.height) : '');
  }, [profile]);

  const saveMeasurement = async () => {
    const nextWeight = Number(weightInput);
    const nextHeight = heightInput.trim() ? Number(heightInput) : profile?.height ?? 0;

    if (!nextWeight || Number.isNaN(nextWeight)) {
      Alert.alert('Weight required', 'Enter a valid weight to update BMI.');
      return;
    }

    if (!nextHeight || Number.isNaN(nextHeight)) {
      Alert.alert('Height required', 'Add your height so BMI can be calculated accurately.');
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await updateProfile({
        weight: nextWeight,
        height: nextHeight,
      });
      const bmiPayload = await fetchBmiDashboard();
      setProfile(updatedProfile);
      setDashboard(bmiPayload);
      Alert.alert('Measurement updated', 'Your latest weight is saved and BMI has been refreshed.');
    } catch (saveError: any) {
      Alert.alert('Update failed', saveError?.message || 'Could not update your measurement.');
    } finally {
      setSaving(false);
    }
  };

  const current = dashboard?.current ?? null;
  const trend = dashboard?.trend ?? null;
  const theme = useMemo(() => bmiCategoryTheme(current?.category ?? 'unknown'), [current?.category]);

  const insightItems = useMemo(() => {
    if (!dashboard || !current) return [];

    return [
      {
        label: 'BMI value',
        value: formatBmiValue(current.bmi),
        hint: current.recorded_at ? 'Latest measurement' : 'Estimated from profile',
      },
      {
        label: 'Category',
        value: current.category_label,
        hint: current.interpretation,
      },
      {
        label: 'Current weight',
        value: formatWeightKg(current.weight_kg),
        hint: current.height_cm ? `${current.height_cm.toFixed(0)} cm height` : 'Height missing',
      },
      {
        label: 'Goal focus',
        value: goalTypeLabel(dashboard.profile_snapshot.goal_type),
        hint: trendDirectionLabel(dashboard.trend.direction, dashboard.trend.bmi_change),
      },
    ];
  }, [current, dashboard]);

  const recentEntries = useMemo(
    () => [...(dashboard?.history ?? [])].reverse().slice(0, 4),
    [dashboard?.history],
  );

  const changeCopy = useMemo(() => {
    if (!trend || trend.bmi_change === null) {
      return 'No earlier measurement yet. Your next update will start a visible trend.';
    }

    const bmiDelta = `${trend.bmi_change > 0 ? '+' : ''}${trend.bmi_change.toFixed(1)} BMI`;
    const weightDelta =
      trend.weight_change === null
        ? 'Weight change unavailable'
        : `${trend.weight_change > 0 ? '+' : ''}${trend.weight_change.toFixed(1)} kg`;

    return `Since the previous log: ${bmiDelta} and ${weightDelta}.`;
  }, [trend]);

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="BMI TRACKER"
        title="Body status that feels informative, not clinical."
        subtitle="Use BMI as a broad signal, pair it with your goal, and watch how weight trends evolve over time."
      />

      {loading ? (
        <View style={[commonStyles.card, styles.centeredCard]}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.helperCopy}>Loading BMI dashboard...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <StatePanel title="BMI unavailable" description={error} actionLabel="Try again" onAction={loadBmi} />
      ) : null}

      {!loading && !error ? (
        <>
          <View style={commonStyles.card}>
            <View style={styles.updateHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Update weight</Text>
                <Text style={styles.cardCopy}>
                  Log your latest measurement and the BMI screen will refresh automatically.
                </Text>
              </View>
              <View style={[styles.updateBadge, { backgroundColor: theme.accentSoft }]}>
                <Text style={[styles.updateBadgeText, { color: theme.accent }]}>Live sync</Text>
              </View>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="Weight (kg)"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                value={weightInput}
                onChangeText={setWeightInput}
              />
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="Height (cm)"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                value={heightInput}
                onChangeText={setHeightInput}
              />
            </View>

            <InteractivePressable style={commonStyles.primaryButton} onPress={saveMeasurement} disabled={saving}>
              <Text style={commonStyles.primaryButtonText}>{saving ? 'Updating...' : 'Save measurement'}</Text>
            </InteractivePressable>
          </View>

          {current?.bmi ? (
            <>
              <BmiHeroCard summary={current} />

              <View style={commonStyles.card}>
                <Text style={styles.cardTitle}>BMI range</Text>
                <Text style={styles.cardCopy}>
                  See where your current BMI sits relative to the standard reference bands.
                </Text>
                <BmiRangeBar value={current.bmi} category={current.category} />
              </View>

              <BmiInsightGrid items={insightItems} />

              <View style={commonStyles.card}>
                <Text style={styles.cardTitle}>Healthy weight range</Text>
                <Text style={styles.cardCopy}>
                  Based on your height, the broad reference range is{' '}
                  <Text style={styles.cardHighlight}>
                    {current.healthy_weight_min_kg?.toFixed(1)} kg - {current.healthy_weight_max_kg?.toFixed(1)} kg
                  </Text>
                  .
                </Text>
                <Text style={styles.cardCopy}>Current weight: {formatWeightKg(current.weight_kg)}</Text>
                {current.healthy_weight_delta ? (
                  <View style={[styles.callout, { borderColor: theme.accent }]}>
                    <Text style={styles.calloutCopy}>{current.healthy_weight_delta.message}</Text>
                  </View>
                ) : null}
              </View>

              <View style={commonStyles.card}>
                <Text style={styles.cardTitle}>Goal alignment</Text>
                <Text style={styles.cardCopy}>{current.goal_alignment}</Text>
              </View>

              <View style={commonStyles.card}>
                <Text style={styles.cardTitle}>{dashboard?.interpretation.title}</Text>
                <Text style={styles.cardCopy}>{dashboard?.interpretation.body}</Text>
                <Text style={styles.disclaimer}>{dashboard?.interpretation.disclaimer}</Text>
              </View>

              <View style={commonStyles.card}>
                <Text style={styles.cardTitle}>{dashboard?.recommendation.title}</Text>
                <Text style={styles.cardCopy}>{dashboard?.recommendation.summary}</Text>
                <View style={styles.bulletList}>
                  {dashboard?.recommendation.actions?.map((item) => (
                    <Text key={item} style={styles.bulletCopy}>
                      • {item}
                    </Text>
                  ))}
                </View>
              </View>

              {dashboard?.history?.length ? (
                <>
                  <BmiTrendChart data={dashboard.history} accentColor={theme.accent} />

                  <View style={commonStyles.card}>
                    <Text style={styles.cardTitle}>Recent measurement readout</Text>
                    <Text style={styles.cardCopy}>{changeCopy}</Text>

                    <View style={styles.historySummaryRow}>
                      <View style={styles.historySummaryCard}>
                        <Text style={styles.historySummaryLabel}>Current</Text>
                        <Text style={styles.historySummaryValue}>{formatBmiValue(current.bmi)}</Text>
                      </View>
                      <View style={styles.historySummaryCard}>
                        <Text style={styles.historySummaryLabel}>Previous</Text>
                        <Text style={styles.historySummaryValue}>
                          {trend?.previous_bmi !== null && trend?.previous_bmi !== undefined
                            ? trend.previous_bmi.toFixed(1)
                            : '--'}
                        </Text>
                      </View>
                      <View style={styles.historySummaryCard}>
                        <Text style={styles.historySummaryLabel}>Change</Text>
                        <Text style={styles.historySummaryValue}>
                          {trend?.bmi_change !== null && trend?.bmi_change !== undefined
                            ? `${trend.bmi_change > 0 ? '+' : ''}${trend.bmi_change.toFixed(1)}`
                            : '--'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.recentList}>
                      {recentEntries.map((entry) => (
                        <View key={entry.id} style={styles.recentRow}>
                          <View>
                            <Text style={styles.recentDate}>
                              {new Date(entry.recorded_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Text>
                            <Text style={styles.recentMeta}>
                              {entry.weight_kg?.toFixed(1) ?? '--'} kg • {entry.height_cm?.toFixed(0) ?? '--'} cm
                            </Text>
                          </View>
                          <Text style={styles.recentValue}>{entry.bmi?.toFixed(1) ?? '--'}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              ) : null}

              <View style={commonStyles.card}>
                <Text style={styles.cardTitle}>BMI limitations</Text>
                <View style={styles.bulletList}>
                  {dashboard?.limitations?.map((item) => (
                    <Text key={item} style={styles.bulletCopy}>
                      • {item}
                    </Text>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <StatePanel
              title="BMI needs a measurement"
              description="Add both your current weight and height to unlock the BMI hero, healthy range, and trend sections."
              actionLabel="Open profile"
              onAction={() => router.replace('/(tabs)/profile')}
            />
          )}
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
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  updateBadge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  updateBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: SPACING.md,
  },
  cardHighlight: {
    color: COLORS.text,
    fontWeight: '800',
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: 52,
    fontSize: 15,
  },
  inlineInput: {
    flex: 1,
  },
  callout: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.cardInner,
  },
  calloutCopy: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  disclaimer: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  bulletList: {
    gap: 8,
  },
  bulletCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 21,
  },
  historySummaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  historySummaryCard: {
    flex: 1,
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 4,
  },
  historySummaryLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  historySummaryValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  recentList: {
    gap: SPACING.sm,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  recentDate: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  recentMeta: {
    color: COLORS.muted,
    fontSize: 12,
  },
  recentValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
});
