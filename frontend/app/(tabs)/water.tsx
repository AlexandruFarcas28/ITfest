import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS } from '../../src/styles/theme';

export default function WaterScreen() {
  const [water, setWater] = useState(1500);
  const goal = 2500;

  const progress = useMemo(() => Math.min((water / goal) * 100, 100), [water]);

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
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
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
        <TouchableOpacity style={styles.actionCard} onPress={() => setWater((value) => value + 250)}>
          <Text style={styles.actionValue}>+250</Text>
          <Text style={styles.actionLabel}>small bottle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => setWater((value) => value + 500)}>
          <Text style={styles.actionValue}>+500</Text>
          <Text style={styles.actionLabel}>large bottle</Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.tipTitle}>Hydration note</Text>
        <Text style={styles.tipText}>
          Spread your intake across the full day to keep energy and focus more stable.
        </Text>
        <TouchableOpacity style={[commonStyles.secondaryButton, styles.resetButton]} onPress={() => setWater(0)}>
          <Text style={commonStyles.secondaryButtonText}>Reset tracker</Text>
        </TouchableOpacity>
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
