import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';

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
    if (!b) return '-';
    if (b < 20) return 'Bulk';
    if (b <= 25) return 'Recomp';
    return 'Cut';
  }, [bmi]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Body Metrics</Text>

      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        placeholderTextColor="#777"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        placeholderTextColor="#777"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <View style={styles.card}>
        <Text style={styles.label}>BMI</Text>
        <Text style={styles.value}>{bmi}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Suggested goal</Text>
        <Text style={styles.value}>{goal}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#0A0A0A', flexGrow: 1 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 18 },
  input: {
    backgroundColor: '#151515',
    borderColor: '#232323',
    borderWidth: 1,
    borderRadius: 16,
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#151515',
    borderColor: '#232323',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
  },
  label: { color: '#888', marginBottom: 6 },
  value: { color: '#fff', fontSize: 26, fontWeight: '900' },
});