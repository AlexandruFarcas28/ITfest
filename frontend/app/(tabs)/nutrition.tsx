import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import TopNav from '../../src/components/TopNav';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';

export default function NutritionScreen() {
  const [foodName, setFoodName] = useState('');
  const [foods, setFoods] = useState([
    { name: 'Chicken breast', calories: 220 },
    { name: 'Rice', calories: 180 },
    { name: 'Eggs', calories: 140 },
  ]);

  const addFood = () => {
    if (!foodName.trim()) return;
    setFoods([...foods, { name: foodName.trim(), calories: 100 }]);
    setFoodName('');
  };

  const total = useMemo(
    () => foods.reduce((sum, food) => sum + food.calories, 0),
    [foods]
  );

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <Text style={commonStyles.kicker}>NUTRITION</Text>
      <Text style={commonStyles.title}>Daily intake</Text>
      <Text style={commonStyles.subtitle}>
        Add foods quickly and keep an eye on your calorie target.
      </Text>

      <View style={commonStyles.card}>
        <Text style={styles.summaryValue}>{total} kcal</Text>
        <Text style={styles.summaryLabel}>today</Text>
        <Text style={styles.summaryMacros}>Protein 120g • Carbs 180g • Fats 55g</Text>
      </View>

      <Text style={commonStyles.sectionTitle}>Add food</Text>
      <View style={styles.row}>
        <TextInput
          style={[commonStyles.input, styles.rowInput]}
          placeholder="Enter food name"
          placeholderTextColor="#777"
          value={foodName}
          onChangeText={setFoodName}
        />
        <TouchableOpacity style={[commonStyles.primaryButton, styles.addButton]} onPress={addFood}>
          <Text style={commonStyles.primaryButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={commonStyles.sectionTitle}>Food list</Text>
      {foods.map((food, index) => (
        <View key={index} style={commonStyles.card}>
          <View style={styles.foodRow}>
            <View>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodHint}>manual entry</Text>
            </View>
            <Text style={styles.foodCalories}>{food.calories} kcal</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  rowInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    minWidth: 82,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 10,
  },
  summaryMacros: {
    color: '#A0A0A0',
    fontSize: 14,
    lineHeight: 20,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  foodHint: {
    color: COLORS.muted,
    fontSize: 13,
  },
  foodCalories: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
});