import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import ScreenHeader from '../../src/components/ScreenHeader';
import StatePanel from '../../src/components/StatePanel';
import TopNav from '../../src/components/TopNav';
import InteractivePressable from '../../src/components/InteractivePressable';
import { createMealEntry } from '../../src/api/health';
import { analyzeMealImage } from '../../src/api/mealCoach';
import { commonStyles } from '../../src/styles/common';
import { COLORS, RADIUS, SPACING } from '../../src/styles/theme';
import type { MealCoachResult } from '../../src/types/health';

async function pickImageFromLibrary() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission required', 'Photo library access is needed to upload a meal.');
    return null;
  }

  const response = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });

  if (response.canceled) return null;
  return response.assets?.[0] ?? null;
}

async function takeImageWithCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission required', 'Camera access is needed to scan a meal.');
    return null;
  }

  const response = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });

  if (response.canceled) return null;
  return response.assets?.[0] ?? null;
}

export default function MealScanScreen() {
  const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [result, setResult] = useState<MealCoachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectPhoto = async (mode: 'camera' | 'library') => {
    const asset = mode === 'camera' ? await takeImageWithCamera() : await pickImageFromLibrary();
    if (!asset?.uri) return;

    setImageAsset(asset);
    setResult(null);
    setError(null);
  };

  const analyzeMeal = async () => {
    if (!imageAsset) {
      Alert.alert('Image required', 'Take or upload a meal photo first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await analyzeMealImage(imageAsset);
      setResult(payload);
    } catch (analysisError: any) {
      const message =
        analysisError?.message || 'The meal coach could not analyze this image right now.';
      setError(message);
      Alert.alert('Analysis failed', message);
    } finally {
      setLoading(false);
    }
  };

  const saveMeal = async () => {
    if (!result) {
      Alert.alert('Analysis required', 'Analyze the meal before saving it.');
      return;
    }

    setSaving(true);

    try {
      await createMealEntry({
        name: result.meal_name,
        meal_type: result.meal_type,
        calories: result.estimated_calories ?? 0,
        protein: result.protein_g ?? 0,
        carbs: result.carbs_g ?? 0,
        fats: result.fats_g ?? 0,
        source: 'scan',
        image_uri: result.image_url ?? null,
        image_url: result.image_url ?? null,
        image_file_id: result.image_file_id ?? null,
        image_storage: result.image_storage ?? null,
        image_filename: result.image_filename ?? null,
        image_content_type: result.image_content_type ?? null,
        analysis_mode: result.analysis_mode,
        detected_foods: result.detected_foods,
        ai_description: result.description,
        ai_confidence: result.confidence,
        confidence_reason: result.confidence_reason,
        goal_comparison: result.goal_comparison,
        improvement_suggestions: result.improvement_suggestions,
        later_meal_suggestion: result.later_meal_suggestion,
        notes: result.notes,
      });

      Alert.alert('Meal saved', 'The meal is now in your history and daily totals.', [
        {
          text: 'Open meals',
          onPress: () => router.replace('/(tabs)/nutrition'),
        },
        {
          text: 'Stay here',
          style: 'cancel',
        },
      ]);
    } catch (saveError: any) {
      Alert.alert('Save failed', saveError?.message || 'Could not save this meal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="AI MEAL COACH"
        title="Scan a meal, then get coaching instead of just numbers."
        subtitle="The coach estimates macros, explains what it sees, compares the meal to your goal, and suggests how to balance the rest of the day."
      />

      <View style={styles.actionRow}>
        <InteractivePressable
          style={[commonStyles.primaryButton, styles.actionButton]}
          onPress={() => selectPhoto('camera')}
        >
          <Text style={commonStyles.primaryButtonText}>Open camera</Text>
        </InteractivePressable>
        <InteractivePressable
          style={[commonStyles.secondaryButton, styles.actionButton]}
          onPress={() => selectPhoto('library')}
        >
          <Text style={commonStyles.secondaryButtonText}>Upload photo</Text>
        </InteractivePressable>
      </View>

      {imageAsset?.uri ? (
        <View style={commonStyles.card}>
          <Image source={{ uri: imageAsset.uri }} style={styles.preview} />
        </View>
      ) : (
        <StatePanel
          title="No meal selected"
          description="Choose a photo from the camera or gallery to start a coaching analysis."
        />
      )}

      <InteractivePressable
        style={[commonStyles.secondaryButton, styles.analyzeButton]}
        onPress={analyzeMeal}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={commonStyles.secondaryButtonText}>Analyze meal</Text>}
      </InteractivePressable>

      {error ? (
        <StatePanel title="Meal coach unavailable" description={error} actionLabel="Try again" onAction={analyzeMeal} />
      ) : null}

      {result ? (
        <View style={commonStyles.card}>
          <View style={styles.resultHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mealName}>{result.meal_name}</Text>
              <Text style={styles.mealMeta}>
                {result.meal_type.toUpperCase()} • {result.analysis_mode === 'live' ? 'LIVE AI' : 'DEMO AI'}
              </Text>
            </View>
            <View style={styles.confidencePill}>
              <Text style={styles.confidenceText}>{result.confidence.toUpperCase()} CONFIDENCE</Text>
            </View>
          </View>

          <Text style={styles.description}>{result.description}</Text>
          <Text style={styles.metaCopy}>{result.confidence_reason}</Text>

          <View style={styles.metricGrid}>
            {[
              [`${result.estimated_calories ?? '-'} kcal`, 'Calories'],
              [`${result.protein_g ?? '-'} g`, 'Protein'],
              [`${result.carbs_g ?? '-'} g`, 'Carbs'],
              [`${result.fats_g ?? '-'} g`, 'Fats'],
            ].map(([value, label]) => (
              <View key={label} style={styles.metricCard}>
                <Text style={styles.metricValue}>{value}</Text>
                <Text style={styles.metricLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.blockTitle}>What it likely contains</Text>
            <Text style={styles.blockCopy}>
              {result.detected_foods.length > 0
                ? result.detected_foods.join(', ')
                : 'The meal is partially ambiguous in the image.'}
            </Text>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.blockTitle}>Goal comparison</Text>
            <Text style={styles.blockCopy}>{result.goal_comparison}</Text>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.blockTitle}>Improve this meal</Text>
            {result.improvement_suggestions.map((suggestion) => (
              <Text key={suggestion} style={styles.bulletCopy}>
                • {suggestion}
              </Text>
            ))}
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.blockTitle}>What to eat later</Text>
            <Text style={styles.blockCopy}>{result.later_meal_suggestion}</Text>
          </View>

          <Text style={styles.metaCopy}>{result.notes}</Text>

          <InteractivePressable
            style={[commonStyles.primaryButton, { marginTop: SPACING.lg }]}
            onPress={saveMeal}
            disabled={saving}
          >
            <Text style={commonStyles.primaryButtonText}>{saving ? 'Saving...' : 'Save to history'}</Text>
          </InteractivePressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionButton: {
    width: '100%',
  },
  analyzeButton: {
    marginBottom: SPACING.md,
  },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: RADIUS.lg,
    resizeMode: 'cover',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  mealName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  mealMeta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  confidencePill: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  confidenceText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  description: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: SPACING.sm,
  },
  metaCopy: {
    color: COLORS.subtitle,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  copyBlock: {
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  blockTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
  blockCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 21,
  },
  bulletCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 21,
  },
});
