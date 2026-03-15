import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import TrendChart from '../../src/components/TrendChart';
import { fetchWeeklyInsights } from '../../src/api/health';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { WeeklyInsights } from '../../src/types/health';

export default function MetricsScreen() {
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchWeeklyInsights();
      setInsights(payload);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.error || loadError?.message || 'Could not load weekly insights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights]),
  );

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="WEEKLY INSIGHTS"
        title="A sharper read on the week you just built."
        subtitle="Calories, macro balance, hydration, and habits are aggregated into a single view with a concise weekly summary."
      />

      {loading ? (
        <View style={[commonStyles.card, styles.centeredCard]}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.helperCopy}>Building your weekly readout...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <StatePanel title="Insights unavailable" description={error} actionLabel="Try again" onAction={loadInsights} />
      ) : null}

      {!loading && !error && insights ? (
        <>
          <LinearGradient
            colors={['#6F2107', '#0D4B50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroKicker}>WEEKLY SUMMARY</Text>
            <Text style={styles.heroTitle}>{insights.period_start} to {insights.period_end}</Text>
            <Text style={styles.heroCopy}>{insights.weekly_summary}</Text>
          </LinearGradient>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Most common meal</Text>
              <Text style={styles.infoValue}>{insights.most_common_meal_type}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Strongest habit</Text>
              <Text style={styles.infoValue}>{insights.strongest_habit}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Weakest habit</Text>
              <Text style={styles.infoValue}>{insights.weakest_habit}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Average macros</Text>
              <Text style={styles.infoValue}>
                P {insights.macro_average.protein} / C {insights.macro_average.carbs} / F {insights.macro_average.fats}
              </Text>
            </View>
          </View>

          <TrendChart
            title="Calories trend"
            subtitle="Daily calorie totals across the current rolling week."
            data={insights.calorie_trend}
            target={insights.goals.daily_calorie_goal}
            targetLabel="Daily goal"
            valueFormatter={(value) => `${Math.round(value)} kcal`}
          />

          <TrendChart
            title="Macro balance trend"
            subtitle="This score tracks how closely each day matched your macro goals."
            data={insights.macro_balance_trend}
            target={85}
            targetLabel="Balanced day benchmark"
            accentColor={COLORS.highlight}
            valueFormatter={(value) => `${Math.round(value)}/100`}
          />

          <TrendChart
            title="Hydration trend"
            subtitle="Hydration adherence over the same weekly window."
            data={insights.hydration_trend}
            target={insights.goals.water_goal_ml}
            targetLabel="Daily water goal"
            accentColor="#54D2FF"
            valueFormatter={(value) => `${Math.round(value)} ml`}
          />
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
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.section,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    gap: SPACING.md,
  },
  heroKicker: {
    color: COLORS.highlight,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  heroCopy: {
    color: COLORS.subtitle,
    fontSize: 15,
    lineHeight: 22,
  },
  infoGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.section,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
});
