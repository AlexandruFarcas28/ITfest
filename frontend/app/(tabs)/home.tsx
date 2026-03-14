import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopNav from '../../src/components/TopNav';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={commonStyles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {hint ? <Text style={styles.cardHint}>{hint}</Text> : null}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <Text style={commonStyles.kicker}>DASHBOARD</Text>
      <Text style={commonStyles.title}>Today’s progress</Text>
      <Text style={commonStyles.subtitle}>
        Track your activity, nutrition and hydration in one place.
      </Text>

      <View style={styles.section}>
        <Text style={commonStyles.sectionTitle}>Quick stats</Text>
        <StatCard label="Steps" value="7,241" hint="daily activity" />
        <StatCard label="Calories" value="1,840 kcal" hint="consumed today" />
        <StatCard label="Water" value="1.5 L" hint="hydration progress" />
      </View>

      <View style={styles.section}>
        <Text style={commonStyles.sectionTitle}>Current goal</Text>
        <StatCard label="Goal" value="Cut" hint="active plan" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  cardHint: {
    color: COLORS.subtitle,
    fontSize: 13,
  },
});