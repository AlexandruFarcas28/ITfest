import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import TopNav from '../../src/components/TopNav';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';

export default function WaterScreen() {
  const [water, setWater] = useState(1500);
  const goal = 2500;

  const progress = useMemo(() => Math.min((water / goal) * 100, 100), [water]);

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <Text style={commonStyles.kicker}>HYDRATION</Text>
      <Text style={commonStyles.title}>Water tracker</Text>
      <Text style={commonStyles.subtitle}>
        Stay consistent with your daily hydration target.
      </Text>

      <View style={commonStyles.card}>
        <Text style={styles.heroValue}>{water} ml</Text>
        <Text style={styles.heroLabel}>Goal: {goal} ml</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.progressText}>{Math.round(progress)}% completed</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={commonStyles.secondaryButton} onPress={() => setWater(water + 250)}>
          <Text style={commonStyles.secondaryButtonText}>+250 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity style={commonStyles.secondaryButton} onPress={() => setWater(water + 500)}>
          <Text style={commonStyles.secondaryButtonText}>+500 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[commonStyles.primaryButton, styles.resetButton]} onPress={() => setWater(0)}>
          <Text style={commonStyles.primaryButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroValue: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroLabel: {
    color: COLORS.subtitle,
    fontSize: 14,
    marginBottom: 16,
  },
  progressBar: {
    height: 18,
    backgroundColor: COLORS.cardInner,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  progressText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  actions: {
    gap: 12,
  },
  resetButton: {
    marginTop: 4,
  },
});