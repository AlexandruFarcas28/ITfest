import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TopNav from '../../src/components/TopNav';
import TrendChart, { type TrendDatum } from '../../src/components/TrendChart';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';
import { homeScreenStyles as styles } from '../../src/styles/screens/tabs';

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

const weeklyMomentum: TrendDatum[] = [
  { label: 'Mon', value: 62 },
  { label: 'Tue', value: 74 },
  { label: 'Wed', value: 71 },
  { label: 'Thu', value: 80 },
  { label: 'Fri', value: 76 },
  { label: 'Sat', value: 88 },
  { label: 'Sun', value: 84 },
];

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

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

      <TrendChart
        title="Weekly momentum"
        subtitle="Prepared for daily activity history once the database stores workouts, steps and recovery."
        data={weeklyMomentum}
        accentColor={COLORS.highlight}
        target={80}
        targetLabel="Target score"
        valueFormatter={(value) => `${Math.round(value)}%`}
      />

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
