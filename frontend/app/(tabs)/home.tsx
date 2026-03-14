import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Card({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>DASHBOARD</Text>
      <Text style={styles.title}>Today’s progress</Text>

      <Card label="Steps" value="7,241" />
      <Card label="Calories" value="1,840 kcal" />
      <Card label="Water" value="1.5 L" />
      <Card label="Goal" value="Cut" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 16 },
  kicker: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 18 },
  card: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#232323',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  label: { color: '#888', marginBottom: 6 },
  value: { color: '#fff', fontSize: 22, fontWeight: '800' },
});