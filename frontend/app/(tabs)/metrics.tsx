import React, { useMemo, useState } from 'react';
import { Text, TextInput, StyleSheet, ScrollView, View } from 'react-native';
import TopNav from '../../src/components/TopNav';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';

export default function MetricsScreen() {
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');

  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return '-';
    return (w / (h * h)).toFixed(1);
  }, [weight, height]);

  const goal = useMemo(() => {
    const b = parseFloat(bmi);
    if (!b || bmi === '-') return '-';
    if (b < 20) return 'Bulk';
    if (b <= 25) return 'Recomp';
    return 'Cut';
  }, [bmi]);

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <Text style={commonStyles.kicker}>BODY METRICS</Text>
      <Text style={commonStyles.title}>Body overview</Text>
      <Text style={commonStyles.subtitle}>
        Estimate your BMI and get a simple suggested goal.
      </Text>

      <View style={commonStyles.card}>
        <TextInput
          style={[commonStyles.input, styles.inputNoMargin]}
          placeholder="Weight (kg)"
          placeholderTextColor="#777"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <TextInput
          style={[commonStyles.input, styles.inputNoMargin]}
          placeholder="Height (cm)"
          placeholderTextColor="#777"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.resultLabel}>BMI</Text>
        <Text style={styles.resultValue}>{bmi}</Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.resultLabel}>Suggested goal</Text>
        <Text style={styles.resultValue}>{goal}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputNoMargin: {
    backgroundColor: COLORS.cardInner,
  },
  resultLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  resultValue: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
  },
});