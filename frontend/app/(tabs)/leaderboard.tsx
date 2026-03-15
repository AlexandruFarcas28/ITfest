import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import BadgeChip from '../../src/components/BadgeChip';
import ProgressStatCard from '../../src/components/ProgressStatCard';
import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import { fetchGamification } from '../../src/api/health';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { Gamification } from '../../src/types/health';
import { levelProgress } from '../../src/utils/health';

export default function LeaderboardScreen() {
  const [progress, setProgress] = useState<Gamification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchGamification();
      setProgress(payload);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.error || loadError?.message || 'Could not load rewards.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress]),
  );

  const xpProgress = useMemo(() => (progress ? levelProgress(progress) : null), [progress]);

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="REWARDS"
        title="Streaks, XP, levels, and badges that persist."
        subtitle="This is the retention layer: every log and hydration win now compounds into visible progress."
      />

      {loading ? (
        <View style={[commonStyles.card, styles.centeredCard]}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.helperCopy}>Loading rewards...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <StatePanel title="Rewards unavailable" description={error} actionLabel="Try again" onAction={loadProgress} />
      ) : null}

      {!loading && !error && progress ? (
        <>
          <LinearGradient
            colors={['#19A7A0', '#164247', '#081E20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroKicker}>LEVEL PROGRESSION</Text>
            <Text style={styles.heroValue}>Level {progress.level}</Text>
            <Text style={styles.heroCopy}>{progress.xp} XP accumulated across meals, hydration, and consistency.</Text>

            {xpProgress ? (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(xpProgress.ratio, 1) * 100}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {xpProgress.current} / {xpProgress.target} XP this level
                </Text>
              </>
            ) : null}
          </LinearGradient>

          <View style={styles.grid}>
            <ProgressStatCard
              label="Meal logging streak"
              valueLabel={`${progress.meal_logging_streak} days`}
              hint={`${progress.meal_logs_count} total logged meals`}
              ratio={Math.min(progress.meal_logging_streak / 7, 1)}
            />
            <ProgressStatCard
              label="Hydration streak"
              valueLabel={`${progress.hydration_streak} days`}
              hint={`${progress.hydration_days_count} days above threshold`}
              ratio={Math.min(progress.hydration_streak / 7, 1)}
              accentColor="#54D2FF"
            />
            <ProgressStatCard
              label="Consistency streak"
              valueLabel={`${progress.consistency_streak} days`}
              hint={`${progress.consistency_days_count} days with nutrition + hydration`}
              ratio={Math.min(progress.consistency_streak / 7, 1)}
              accentColor={COLORS.highlight}
            />
          </View>

          <View style={commonStyles.sectionRow}>
            <Text style={commonStyles.sectionTitle}>Milestone badges</Text>
            <Text style={commonStyles.sectionMeta}>{progress.badges.length} unlocked</Text>
          </View>

          {progress.badges.length === 0 ? (
            <StatePanel
              title="No badges yet"
              description="Log meals and hit hydration targets for a few days to start unlocking milestones."
            />
          ) : (
            <View style={styles.badgeList}>
              {progress.badges.map((badge) => (
                <BadgeChip key={badge.id} label={badge.label} description={badge.description} />
              ))}
            </View>
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
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.section,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  heroKicker: {
    color: COLORS.highlight,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroCopy: {
    color: COLORS.subtitle,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  progressTrack: {
    height: 14,
    backgroundColor: COLORS.cardInner,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
  },
  progressLabel: {
    color: COLORS.subtitle,
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    gap: SPACING.md,
    marginBottom: SPACING.section,
  },
  badgeList: {
    gap: SPACING.md,
  },
});
