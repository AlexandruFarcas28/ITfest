import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS } from '../../src/styles/theme';

type Food = {
  name: string;
  calories: number;
};

export default function NutritionScreen() {
  const [foodName, setFoodName] = useState('');
  const [foods, setFoods] = useState<Food[]>([
    { name: 'Chicken breast', calories: 220 },
    { name: 'Rice bowl', calories: 180 },
    { name: 'Eggs', calories: 140 },
  ]);

  const addFood = () => {
    if (!foodName.trim()) return;
    setFoods((current) => [...current, { name: foodName.trim(), calories: 100 }]);
    setFoodName('');
  };

  const total = useMemo(
    () => foods.reduce((sum, food) => sum + food.calories, 0),
    [foods]
  );

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0D4B50', '#6F2107']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <Text style={styles.summaryKicker}>DAILY INTAKE</Text>
        <Text style={styles.summaryValue}>{total} kcal</Text>
        <Text style={styles.summaryCopy}>Protein 120g / Carbs 180g / Fats 55g</Text>

        <View style={styles.macroRow}>
          <View style={styles.macroChip}>
            <Text style={styles.macroChipValue}>72%</Text>
            <Text style={styles.macroChipLabel}>goal reached</Text>
          </View>
          <View style={styles.macroChip}>
            <Text style={styles.macroChipValue}>3</Text>
            <Text style={styles.macroChipLabel}>meals logged</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={commonStyles.sectionRow}>
        <Text style={commonStyles.sectionTitle}>Quick add</Text>
        <Text style={commonStyles.sectionMeta}>Keep it lightweight</Text>
      </View>

      <View style={commonStyles.card}>
        <TextInput
          style={[commonStyles.input, styles.inputNoMargin]}
          placeholder="Enter food name"
          placeholderTextColor={COLORS.muted}
          value={foodName}
          onChangeText={setFoodName}
        />
        <TouchableOpacity style={commonStyles.primaryButton} onPress={addFood}>
          <Text style={commonStyles.primaryButtonText}>Add to log</Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.sectionRow}>
        <Text style={commonStyles.sectionTitle}>Food list</Text>
        <Text style={commonStyles.sectionMeta}>{foods.length} items</Text>
      </View>

      {foods.map((food, index) => (
        <View key={`${food.name}-${index}`} style={styles.foodCard}>
          <View>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodHint}>manual entry</Text>
          </View>
          <View style={styles.caloriePill}>
            <Text style={styles.calorieText}>{food.calories} kcal</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryKicker: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 38,
    fontWeight: '900',
    marginBottom: 6,
  },
  summaryCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.md,
    padding: 14,
  },
  macroChipValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  macroChipLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  inputNoMargin: {
    marginBottom: 14,
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 14,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },
  foodHint: {
    color: COLORS.muted,
    fontSize: 13,
  },
  caloriePill: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  calorieText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
});
