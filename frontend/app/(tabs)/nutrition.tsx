import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TopNav from '../../src/components/TopNav';
import InteractivePressable from '../../src/components/InteractivePressable';
import TrendChart from '../../src/components/TrendChart';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';
import { nutritionScreenStyles as styles } from '../../src/styles/screens/tabs';

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

  const calorieTrend = useMemo(
    () => [
      { label: 'Mon', value: 1680 },
      { label: 'Tue', value: 1740 },
      { label: 'Wed', value: 1810 },
      { label: 'Thu', value: 1650 },
      { label: 'Fri', value: 1900 },
      { label: 'Sat', value: 1760 },
      { label: 'Now', value: total },
    ],
    [total]
  );

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

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

      <TrendChart
        title="Calorie trend"
        subtitle="This section is ready for meal history once your backend saves daily nutrition entries."
        data={calorieTrend}
        accentColor={COLORS.accent}
        target={2000}
        targetLabel="Daily target"
        valueFormatter={(value) => `${Math.round(value)} kcal`}
      />

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
        <InteractivePressable style={commonStyles.primaryButton} onPress={addFood}>
          <Text style={commonStyles.primaryButtonText}>Add to log</Text>
        </InteractivePressable>
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
