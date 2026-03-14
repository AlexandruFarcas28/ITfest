import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS } from '../../src/styles/theme';

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statHint}>{hint}</Text>
    </View>
  );
}

type HabitRowProps = {
  title: string;
  detail: string;
  value: string;
};

function HabitRow({ title, detail, value }: HabitRowProps) {
  return (
    <View style={styles.habitRow}>
      <View>
        <Text style={styles.habitTitle}>{title}</Text>
        <Text style={styles.habitDetail}>{detail}</Text>
      </View>
      <View style={styles.habitPill}>
        <Text style={styles.habitPillText}>{value}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#19A7A0', '#FF6800']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroEyebrow}>TODAY PULSE</Text>
        <Text style={styles.heroTitle}>You are ahead of yesterday.</Text>
        <Text style={styles.heroSubtitle}>
          Keep the rhythm with one more session and a strong hydration finish.
        </Text>

        <View style={styles.heroFooter}>
          <View>
            <Text style={styles.heroMetricValue}>8 days</Text>
            <Text style={styles.heroMetricLabel}>streak</Text>
          </View>

          <View style={styles.heroDivider} />

          <View>
            <Text style={styles.heroMetricValue}>84%</Text>
            <Text style={styles.heroMetricLabel}>recovery</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={commonStyles.sectionRow}>
        <Text style={commonStyles.sectionTitle}>Daily overview</Text>
        <Text style={commonStyles.sectionMeta}>Updated 2m ago</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Steps" value="7,241" hint="Strong movement day" />
        <StatCard label="Calories" value="1,840" hint="Smooth intake balance" />
        <StatCard label="Hydration" value="1.5 L" hint="One refill left" />
        <StatCard label="Workout" value="42 min" hint="Push session complete" />
      </View>

      <View style={commonStyles.sectionRow}>
        <Text style={commonStyles.sectionTitle}>Today flow</Text>
        <Text style={commonStyles.sectionMeta}>3 active goals</Text>
      </View>

      <View style={commonStyles.card}>
        <HabitRow title="Morning mobility" detail="Light stretching block" value="Done" />
        <HabitRow title="Lunch protein target" detail="Aim for 35g this meal" value="Next" />
        <HabitRow title="Evening walk" detail="20 min low intensity" value="Planned" />
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipIconWrap}>
          <Ionicons name="sparkles" size={18} color={COLORS.accentDark} />
        </View>
        <View style={styles.tipTextWrap}>
          <Text style={styles.tipTitle}>Small edge, big payoff</Text>
          <Text style={styles.tipText}>
            A short walk after dinner will help both recovery and hydration rhythm.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 24,
  },
  heroEyebrow: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 10,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
    maxWidth: 290,
  },
  heroSubtitle: {
    color: 'rgba(255, 243, 232, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 290,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  heroDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 243, 232, 0.24)',
  },
  heroMetricValue: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  heroMetricLabel: {
    color: 'rgba(255, 243, 232, 0.84)',
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 14,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '700',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  statHint: {
    color: COLORS.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  habitTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  habitDetail: {
    color: COLORS.subtitle,
    fontSize: 13,
    maxWidth: 220,
  },
  habitPill: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  habitPillText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.highlight,
    borderRadius: RADIUS.lg,
    padding: 18,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(58, 19, 6, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    color: COLORS.accentDark,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },
  tipText: {
    color: '#163536',
    fontSize: 14,
    lineHeight: 20,
  },
});
