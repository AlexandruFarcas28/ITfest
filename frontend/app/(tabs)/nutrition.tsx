import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

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

  const total = foods.reduce((sum, f) => sum + f.calories, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.total}>{total} kcal today</Text>
      <Text style={styles.subtitle}>Protein 120g • Carbs 180g • Fats 55g</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Add food"
          placeholderTextColor="#777"
          value={foodName}
          onChangeText={setFoodName}
        />
        <TouchableOpacity style={styles.addButton} onPress={addFood}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {foods.map((food, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodCalories}>{food.calories} kcal</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#0A0A0A', flexGrow: 1 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 8 },
  total: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#888', marginBottom: 18, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: '#151515',
    borderColor: '#232323',
    borderWidth: 1,
    borderRadius: 14,
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  addButton: {
    backgroundColor: '#22C55E',
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonText: { color: '#04130A', fontWeight: '900' },
  card: {
    backgroundColor: '#151515',
    borderColor: '#232323',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  foodName: { color: '#fff', fontWeight: '700', fontSize: 16 },
  foodCalories: { color: '#888', marginTop: 4 },
});