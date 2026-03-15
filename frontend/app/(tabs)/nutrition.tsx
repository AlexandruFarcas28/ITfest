import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import MealHistoryCard from '../../src/components/MealHistoryCard';
import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import InteractivePressable from '../../src/components/InteractivePressable';
import TrendChart from '../../src/components/TrendChart';
import {
  createMealEntry,
  deleteMealEntry,
  fetchMealHistory,
  repeatMealEntry,
  updateMealEntry,
} from '../../src/api/health';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { MealHistoryResponse } from '../../src/types/health';

const emptyManualForm = {
  name: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
};

export default function NutritionScreen() {
  const [history, setHistory] = useState<MealHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState(emptyManualForm);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchMealHistory(14, 24);
      setHistory(payload);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.error || loadError?.message || 'Could not load meal history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const calorieTrend = useMemo(
    () =>
      (history?.daily_totals || []).map((day) => ({
        label: day.label,
        value: day.total_calories,
      })),
    [history],
  );

  const addManualMeal = async () => {
    if (!manualForm.name.trim()) {
      Alert.alert('Meal required', 'Add a meal name first.');
      return;
    }

    setSaving(true);
    try {
      await createMealEntry({
        name: manualForm.name.trim(),
        calories: Number(manualForm.calories) || 0,
        protein: Number(manualForm.protein) || 0,
        carbs: Number(manualForm.carbs) || 0,
        fats: Number(manualForm.fats) || 0,
        source: 'manual',
      });
      setManualForm(emptyManualForm);
      await loadHistory();
    } catch (saveError: any) {
      Alert.alert('Save failed', saveError?.message || 'Could not save this meal.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (
    entryId: string,
    payload: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    },
  ) => {
    await updateMealEntry(entryId, payload);
    await loadHistory();
  };

  const handleRepeat = async (entryId: string) => {
    try {
      await repeatMealEntry(entryId);
      await loadHistory();
      Alert.alert('Meal repeated', 'A copy was added to today.');
    } catch (repeatError: any) {
      Alert.alert('Repeat failed', repeatError?.message || 'Could not repeat this meal.');
    }
  };

  const handleToggleFavorite = async (entryId: string, nextValue: boolean) => {
    try {
      await updateMealEntry(entryId, { favorite: nextValue });
      await loadHistory();
    } catch (favoriteError: any) {
      Alert.alert('Update failed', favoriteError?.message || 'Could not update favorite status.');
    }
  };

  const handleDelete = async (entryId: string) => {
    await deleteMealEntry(entryId);
    await loadHistory();
  };

  const inputStyle = {
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: 50,
    fontSize: 15,
  } as const;

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="SMART LOGGING"
        title="Your meal history is now built for repeatability."
        subtitle="Save AI scans, edit nutrition after corrections, favorite reliable meals, and replay them into today with one tap."
      />

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Quick manual log</Text>
        <Text style={styles.sectionCopy}>Use this when you know the numbers and want a fast entry.</Text>

        <TextInput
          style={[inputStyle, { marginBottom: SPACING.sm }]}
          placeholder="Meal name"
          placeholderTextColor={COLORS.muted}
          value={manualForm.name}
          onChangeText={(value) => setManualForm((current) => ({ ...current, name: value }))}
        />

        <View style={styles.inputRow}>
          {[
            ['calories', 'Calories'],
            ['protein', 'Protein'],
            ['carbs', 'Carbs'],
            ['fats', 'Fats'],
          ].map(([field, label]) => (
            <TextInput
              key={field}
              style={[inputStyle, styles.macroInput]}
              placeholder={label}
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              value={manualForm[field as keyof typeof manualForm]}
              onChangeText={(value) =>
                setManualForm((current) => ({
                  ...current,
                  [field]: value,
                }))
              }
            />
          ))}
        </View>

        <InteractivePressable style={commonStyles.primaryButton} onPress={addManualMeal} disabled={saving}>
          <Text style={commonStyles.primaryButtonText}>{saving ? 'Saving...' : 'Add manual meal'}</Text>
        </InteractivePressable>
      </View>

      {loading ? (
        <View style={[commonStyles.card, styles.centeredCard]}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.sectionCopy}>Loading meal history...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <StatePanel
          title="History unavailable"
          description={error}
          actionLabel="Try again"
          onAction={loadHistory}
        />
      ) : null}

      {!loading && !error && history ? (
        <>
          <TrendChart
            title="Two-week calorie trend"
            subtitle="This trend is derived from saved meals, so future analytics can build directly on this history."
            data={calorieTrend}
            target={2000}
            targetLabel="Reference target"
            valueFormatter={(value) => `${Math.round(value)} kcal`}
          />

          <View style={commonStyles.sectionRow}>
            <Text style={commonStyles.sectionTitle}>History snapshot</Text>
            <Text style={commonStyles.sectionMeta}>
              {history.stats.logged_meal_count} meals • {history.stats.favorite_count} favorites
            </Text>
          </View>

          {history.items.length === 0 ? (
            <StatePanel
              title="No meals saved yet"
              description="Scan a meal or add a manual entry to start building a reusable meal history."
            />
          ) : (
            <View style={styles.historyList}>
              {history.items.map((entry) => (
                <MealHistoryCard
                  key={entry.id}
                  entry={entry}
                  onSave={handleEdit}
                  onRepeat={handleRepeat}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  macroInput: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  centeredCard: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  historyList: {
    gap: SPACING.md,
  },
});
