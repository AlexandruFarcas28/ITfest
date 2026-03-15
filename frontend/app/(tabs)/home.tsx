import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import ProgressStatCard from '../../src/components/ProgressStatCard';
import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import BadgeChip from '../../src/components/BadgeChip';
import { fetchDashboard } from '../../src/api/health';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { DashboardPayload } from '../../src/types/health';
import { formatGoalValue, levelProgress, progressLabel } from '../../src/utils/health';

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchDashboard();
      setDashboard(payload);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.error || loadError?.message || 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const xpProgress = useMemo(
    () => (dashboard ? levelProgress(dashboard.gamification) : null),
    [dashboard],
  );

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="DAILY DASHBOARD"
        title="Adaptive guidance for the rest of your day."
        subtitle="Your intake, hydration, focus, and momentum stay synced so the app feels alive instead of static."
      />

      {loading ? (
        <View style={[commonStyles.card, styles.centeredCard]}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.mutedCopy}>Refreshing your day...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <StatePanel
          title="Dashboard unavailable"
          description={error}
          actionLabel="Try again"
          onAction={loadDashboard}
        />
      ) : null}

      {!loading && !error && dashboard ? (
        <>
          <LinearGradient
            colors={['#19A7A0', '#0D4B50', '#6F2107']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroKicker}>TODAY STATUS</Text>
            <Text style={styles.heroTitle}>Stay steady. Your day is still shapeable.</Text>
            <Text style={styles.heroSubtitle}>{dashboard.quick_summary}</Text>

            <View style={styles.heroMetrics}>
              <View style={styles.heroMetricBlock}>
                <Text style={styles.heroMetricValue}>{dashboard.gamification.level}</Text>
                <Text style={styles.heroMetricLabel}>level</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetricBlock}>
                <Text style={styles.heroMetricValue}>{dashboard.gamification.consistency_streak}</Text>
                <Text style={styles.heroMetricLabel}>consistency streak</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetricBlock}>
                <Text style={styles.heroMetricValue}>{dashboard.gamification.xp}</Text>
                <Text style={styles.heroMetricLabel}>xp total</Text>
              </View>
            </View>

            {xpProgress ? (
              <View style={styles.levelCard}>
                <View style={styles.levelRow}>
                  <Text style={styles.levelTitle}>XP to next level</Text>
                  <Text style={styles.levelValue}>
                    {xpProgress.current} / {xpProgress.target}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(xpProgress.ratio, 1) * 100}%` }]} />
                </View>
              </View>
            ) : null}
          </LinearGradient>

          <View style={commonStyles.sectionRow}>
            <Text style={commonStyles.sectionTitle}>Goal progress</Text>
            <Text style={commonStyles.sectionMeta}>{dashboard.totals.meals_logged} meals today</Text>
          </View>

          <View style={styles.grid}>
            <ProgressStatCard
              label="Calories"
              valueLabel={progressLabel(dashboard.progress.calories, ' kcal')}
              hint={`${dashboard.progress.calories.remaining} kcal remaining`}
              ratio={dashboard.progress.calories.ratio}
            />
            <ProgressStatCard
              label="Protein"
              valueLabel={progressLabel(dashboard.progress.protein, 'g')}
              hint={`${dashboard.progress.protein.remaining}g left for your target`}
              ratio={dashboard.progress.protein.ratio}
              accentColor={COLORS.highlight}
            />
            <ProgressStatCard
              label="Carbs"
              valueLabel={progressLabel(dashboard.progress.carbs, 'g')}
              hint={`${dashboard.progress.carbs.remaining}g remaining`}
              ratio={dashboard.progress.carbs.ratio}
              accentColor="#F6C667"
            />
            <ProgressStatCard
              label="Water"
              valueLabel={formatGoalValue(dashboard.totals.water_ml, ' ml')}
              hint={`${dashboard.progress.water.remaining} ml to goal`}
              ratio={dashboard.progress.water.ratio}
              accentColor="#54D2FF"
            />
          </View>

          <View style={commonStyles.sectionRow}>
            <Text style={commonStyles.sectionTitle}>Today’s focus</Text>
            <Text style={commonStyles.sectionMeta}>{dashboard.today_focus.cta}</Text>
          </View>

          <View style={commonStyles.card}>
            <Text style={styles.focusTitle}>{dashboard.today_focus.title}</Text>
            <Text style={styles.focusCopy}>{dashboard.today_focus.description}</Text>
          </View>

          <View style={commonStyles.sectionRow}>
            <Text style={commonStyles.sectionTitle}>Recent meals</Text>
            <Text style={commonStyles.sectionMeta}>Latest log snapshots</Text>
          </View>

          {dashboard.recent_meals.length === 0 ? (
            <StatePanel
              title="No meals logged yet"
              description="Use the meal coach or smart logging screen to start building your day."
            />
          ) : (
            <View style={styles.mealList}>
              {dashboard.recent_meals.map((meal) => (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealMeta}>
                      {meal.meal_type_label} • {meal.calories} kcal • P {meal.protein}g
                    </Text>
                  </View>
                  <Text style={styles.mealSource}>{meal.source === 'scan' ? 'AI' : 'LOG'}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={commonStyles.sectionRow}>
            <Text style={commonStyles.sectionTitle}>Badge momentum</Text>
            <Text style={commonStyles.sectionMeta}>{dashboard.gamification.badges.length} earned</Text>
          </View>

          <View style={styles.badgeWrap}>
            {dashboard.gamification.badges.slice(-3).map((badge) => (
              <BadgeChip key={badge.id} label={badge.label} description={badge.description} />
            ))}
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
  mutedCopy: {
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
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    maxWidth: 320,
  },
  heroSubtitle: {
    color: 'rgba(255,243,232,0.92)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  heroMetricBlock: {
    flex: 1,
    gap: 2,
  },
  heroMetricValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
  },
  heroMetricLabel: {
    color: 'rgba(255,243,232,0.82)',
    fontSize: 12,
    fontWeight: '700',
  },
  heroDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,243,232,0.2)',
  },
  levelCard: {
    backgroundColor: 'rgba(8, 30, 32, 0.32)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelTitle: {
    color: COLORS.white,
    fontWeight: '800',
  },
  levelValue: {
    color: COLORS.white,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,243,232,0.16)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
  },
  grid: {
    gap: SPACING.md,
    marginBottom: SPACING.section,
  },
  focusTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: SPACING.sm,
  },
  focusCopy: {
    color: COLORS.subtitle,
    fontSize: 15,
    lineHeight: 22,
  },
  mealList: {
    gap: SPACING.md,
    marginBottom: SPACING.section,
  },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  mealName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  mealMeta: {
    color: COLORS.subtitle,
    fontSize: 13,
  },
  mealSource: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  badgeWrap: {
    gap: SPACING.md,
  },
});
