import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import ProgressStatCard from '../../src/components/ProgressStatCard';
import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import InteractivePressable from '../../src/components/InteractivePressable';
import TrendChart from '../../src/components/TrendChart';
import { fetchGamification, fetchWaterHistory, fetchWaterStatus, updateWater } from '../../src/api/health';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { Gamification, WaterSnapshot } from '../../src/types/health';

export default function WaterScreen() {
  const [snapshot, setSnapshot] = useState<WaterSnapshot | null>(null);
  const [history, setHistory] = useState<{ date: string; amount_ml: number; goal_ml: number }[]>([]);
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWater = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [snapshotPayload, historyPayload, gamificationPayload] = await Promise.all([
        fetchWaterStatus(),
        fetchWaterHistory(7),
        fetchGamification(),
      ]);
      setSnapshot(snapshotPayload);
      setHistory(historyPayload);
      setGamification(gamificationPayload);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.error || loadError?.message || 'Could not load hydration data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWater();
    }, [loadWater]),
  );

  const applyWaterDelta = async (amountMl: number, mode: 'add' | 'set' = 'add') => {
    setSaving(true);

    try {
      const payload = await updateWater({ amount_ml: amountMl, mode });
      setSnapshot(payload);
      if (payload.gamification) {
        setGamification(payload.gamification);
      }
      const nextHistory = await fetchWaterHistory(7);
      setHistory(nextHistory);
    } catch (updateError: any) {
      setError(updateError?.response?.data?.error || updateError?.message || 'Could not update hydration.');
    } finally {
      setSaving(false);
    }
  };

  const trendData = useMemo(
    () =>
      history.map((day) => ({
        label: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }),
        value: day.amount_ml,
      })),
    [history],
  );

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="HYDRATION"
        title="Keep the water habit visible and easy."
        subtitle="The tracker now syncs with streaks, rewards, and weekly insights so hydration matters across the whole app."
      />

      {loading ? (
        <View style={[commonStyles.card, styles.centeredCard]}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.helperCopy}>Loading hydration status...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <StatePanel title="Hydration unavailable" description={error} actionLabel="Try again" onAction={loadWater} />
      ) : null}

      {!loading && !error && snapshot ? (
        <>
          <LinearGradient
            colors={['#0D4B50', '#19A7A0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroKicker}>TODAY’S WATER</Text>
            <Text style={styles.heroValue}>{snapshot.amount_ml} ml</Text>
            <Text style={styles.heroLabel}>Target {snapshot.goal_ml} ml</Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(snapshot.progress.ratio, 1) * 100}%` }]} />
            </View>

            <View style={styles.heroFooter}>
              <Text style={styles.heroFooterText}>{snapshot.progress.percent}% complete</Text>
              <Text style={styles.heroFooterText}>{snapshot.progress.remaining} ml remaining</Text>
            </View>
          </LinearGradient>

          <View style={styles.quickActions}>
            {[250, 500, 750].map((amount) => (
              <InteractivePressable
                key={amount}
                style={styles.actionCard}
                onPress={() => applyWaterDelta(amount)}
                disabled={saving}
              >
                <Text style={styles.actionValue}>+{amount}</Text>
                <Text style={styles.actionLabel}>ml</Text>
              </InteractivePressable>
            ))}
          </View>

          <InteractivePressable
            style={commonStyles.secondaryButton}
            onPress={() => applyWaterDelta(0, 'set')}
            disabled={saving}
          >
            <Text style={commonStyles.secondaryButtonText}>{saving ? 'Updating...' : 'Reset today'}</Text>
          </InteractivePressable>

          {gamification ? (
            <>
              <View style={commonStyles.sectionRow}>
                <Text style={commonStyles.sectionTitle}>Hydration momentum</Text>
                <Text style={commonStyles.sectionMeta}>{gamification.hydration_days_count} good days</Text>
              </View>

              <View style={styles.progressGrid}>
                <ProgressStatCard
                  label="Hydration streak"
                  valueLabel={`${gamification.hydration_streak} days`}
                  hint="Counts days that reach at least 80% of target."
                  ratio={Math.min(gamification.hydration_streak / 7, 1)}
                  accentColor="#54D2FF"
                />
                <ProgressStatCard
                  label="Consistency streak"
                  valueLabel={`${gamification.consistency_streak} days`}
                  hint="Hydration plus meal logging on consecutive days."
                  ratio={Math.min(gamification.consistency_streak / 7, 1)}
                  accentColor={COLORS.highlight}
                />
              </View>
            </>
          ) : null}

          <TrendChart
            title="Weekly hydration trend"
            subtitle="Hydration is persisted daily, so this chart now reflects real progress instead of placeholder data."
            data={trendData}
            target={snapshot.goal_ml}
            targetLabel="Daily goal"
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
  },
  heroKicker: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroLabel: {
    color: COLORS.subtitle,
    fontSize: 15,
    marginBottom: SPACING.lg,
  },
  progressTrack: {
    height: 16,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroFooterText: {
    color: COLORS.subtitle,
    fontSize: 13,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
  },
  actionValue: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
  },
  actionLabel: {
    color: COLORS.subtitle,
    fontSize: 13,
  },
  progressGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.section,
  },
});
