import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InteractivePressable from '../../src/components/InteractivePressable';
import TrendChart from '../../src/components/TrendChart';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS } from '../../src/styles/theme';

export default function WaterScreen() {
  const [water, setWater] = useState(1500);
  const goal = 2500;

  const progress = useMemo(() => Math.min((water / goal) * 100, 100), [water]);
  const progressWidth = useRef(new Animated.Value(progress)).current;
  const hydrationTrend = useMemo(
    () => [
      { label: 'Mon', value: 1800 },
      { label: 'Tue', value: 2100 },
      { label: 'Wed', value: 1950 },
      { label: 'Thu', value: 2300 },
      { label: 'Fri', value: 2050 },
      { label: 'Sat', value: 2400 },
      { label: 'Now', value: water },
    ],
    [water]
  );

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressWidth]);

  const animatedProgressWidth = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0D4B50', '#19A7A0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroKicker}>WATER STATUS</Text>
        <Text style={styles.heroValue}>{water} ml</Text>
        <Text style={styles.heroLabel}>Goal: {goal} ml today</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: animatedProgressWidth }]} />
        </View>

        <View style={styles.heroFooter}>
          <Text style={styles.heroFooterText}>{Math.round(progress)}% complete</Text>
          <Text style={styles.heroFooterText}>
            {goal - water > 0 ? `${goal - water} ml left` : 'Goal hit'}
          </Text>
        </View>
      </LinearGradient>

      <View style={commonStyles.sectionRow}>
        <Text style={commonStyles.sectionTitle}>Quick actions</Text>
        <Text style={commonStyles.sectionMeta}>One tap updates</Text>
      </View>

      <View style={styles.actionGrid}>
        <InteractivePressable style={styles.actionCard} onPress={() => setWater((value) => value + 250)}>
          <Text style={styles.actionValue}>+250</Text>
          <Text style={styles.actionLabel}>small bottle</Text>
        </InteractivePressable>

        <InteractivePressable style={styles.actionCard} onPress={() => setWater((value) => value + 500)}>
          <Text style={styles.actionValue}>+500</Text>
          <Text style={styles.actionLabel}>large bottle</Text>
        </InteractivePressable>
      </View>

      <TrendChart
        title="Hydration history"
        subtitle="Ready for database-backed daily hydration entries as soon as you persist water logs."
        data={hydrationTrend}
        accentColor={COLORS.highlight}
        target={goal}
        targetLabel="Daily goal"
        valueFormatter={(value) => `${Math.round(value)} ml`}
      />

      <View style={commonStyles.card}>
        <Text style={styles.tipTitle}>Hydration note</Text>
        <Text style={styles.tipText}>
          Spread your intake across the full day to keep energy and focus more stable.
        </Text>
        <InteractivePressable style={[commonStyles.secondaryButton, styles.resetButton]} onPress={() => setWater(0)}>
          <Text style={commonStyles.secondaryButtonText}>Reset tracker</Text>
        </InteractivePressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroKicker: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  heroValue: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroLabel: {
    color: COLORS.subtitle,
    fontSize: 15,
    marginBottom: 18,
  },
  progressTrack: {
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginBottom: 14,
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
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 20,
  },
  actionValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  actionLabel: {
    color: COLORS.subtitle,
    fontSize: 13,
  },
  tipTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  tipText: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  resetButton: {
    marginTop: 4,
  },
});
