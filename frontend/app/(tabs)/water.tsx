import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function WaterScreen() {
  const [water, setWater] = useState(1500);
  const goal = 2500;
  const progress = Math.min((water / goal) * 100, 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Tracker</Text>
      <Text style={styles.value}>{water} ml</Text>
      <Text style={styles.subtitle}>Goal: {goal} ml</Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setWater(water + 250)}>
        <Text style={styles.buttonText}>+250 ml</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setWater(water + 500)}>
        <Text style={styles.buttonText}>+500 ml</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={() => setWater(0)}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 10 },
  value: { color: '#fff', fontSize: 40, fontWeight: '900' },
  subtitle: { color: '#888', marginTop: 4, marginBottom: 18 },
  progressBar: {
    height: 18,
    backgroundColor: '#151515',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#232323',
    marginBottom: 18,
  },
  progressFill: { height: '100%', backgroundColor: '#22C55E' },
  button: {
    backgroundColor: '#151515',
    borderColor: '#232323',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontWeight: '800' },
  resetButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  resetText: { color: '#04130A', fontWeight: '900' },
});