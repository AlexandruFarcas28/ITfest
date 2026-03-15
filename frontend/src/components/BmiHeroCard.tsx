import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, RADIUS, SPACING } from '../styles/theme';
import type { BmiSummary } from '../types/health';
import { bmiCategoryTheme, formatBmiValue } from '../utils/bmi';

type BmiHeroCardProps = {
  summary: BmiSummary;
};

export default function BmiHeroCard({ summary }: BmiHeroCardProps) {
  const theme = bmiCategoryTheme(summary.category);

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>BODY MASS INDEX</Text>
          <Text style={styles.title}>{summary.category_label}</Text>
          <Text style={styles.copy}>{summary.interpretation}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.badgeText, { color: theme.accent }]}>Current</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricValue}>{formatBmiValue(summary.bmi)}</Text>
          <Text style={styles.metricLabel}>BMI</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricBlock}>
          <Text style={styles.metricValue}>{summary.weight_kg?.toFixed(1) ?? '--'}</Text>
          <Text style={styles.metricLabel}>kg now</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.section,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    gap: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  headerText: {
    flex: 1,
    gap: SPACING.xs,
  },
  kicker: {
    color: 'rgba(255,243,232,0.84)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
  },
  copy: {
    color: 'rgba(255,243,232,0.92)',
    fontSize: 15,
    lineHeight: 22,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metricBlock: {
    flex: 1,
  },
  metricValue: {
    color: COLORS.white,
    fontSize: 38,
    fontWeight: '900',
    marginBottom: 4,
  },
  metricLabel: {
    color: 'rgba(255,243,232,0.82)',
    fontSize: 13,
    fontWeight: '700',
  },
  metricDivider: {
    width: 1,
    height: 42,
    backgroundColor: 'rgba(255,243,232,0.22)',
  },
});
