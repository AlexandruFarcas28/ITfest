import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import TopNav from '../../src/components/TopNav';
import InteractivePressable from '../../src/components/InteractivePressable';
import { API_BASE_URL } from '../../src/api/config';
import { appendNutritionEntry } from '../../src/storage/nutrition';
import { commonStyles } from '../../src/styles/common';
import { mealScanScreenStyles as styles } from '../../src/styles/screens/tabs';

type MealResult = {
  detected_foods: string[];
  estimated_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  confidence: string;
  notes: string;
};

export default function MealScanScreen() {
  const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<MealResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkBackendHealth = async () => {
    try {
      const healthUrl = API_BASE_URL.replace(/\/api\/?$/, '/health');
      const response = await fetch(healthUrl, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permisiune necesara', 'Aplicatia are nevoie de acces la camera.');
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (response.canceled) return;

    const asset = response.assets?.[0];
    if (!asset?.uri) return;

    setImageAsset(asset);
    setResult(null);
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const analyzeMeal = async () => {
    if (!imageAsset?.uri) {
      Alert.alert('Poza lipsa', 'Fa mai intai o fotografie.');
      return;
    }

    setLoading(true);
    setStatusMessage('Analyzing image...');
    setErrorMessage(null);

    try {
      const formData = new FormData();

      if (Platform.OS === 'web' && imageAsset.file) {
        formData.append('image', imageAsset.file, imageAsset.file.name || 'meal.jpg');
      } else {
        formData.append('image', {
          uri: imageAsset.uri,
          name: imageAsset.fileName || 'meal.jpg',
          type: imageAsset.mimeType || 'image/jpeg',
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/ai/estimate-meal`, {
        method: 'POST',
        body: formData,
      });

      const rawBody = await response.text();
      let parsedBody: MealResult | { error?: string; details?: string } | null = null;

      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        parsedBody = null;
      }

      if (!response.ok) {
        const backendError =
          (parsedBody && 'error' in parsedBody ? parsedBody.error : null) || 'Analiza a esuat.';
        const backendDetails =
          (parsedBody && 'details' in parsedBody ? parsedBody.details : null) || rawBody || null;

        throw new Error(
          backendDetails ? `${backendError}: ${backendDetails}` : backendError,
        );
      }

      if (!parsedBody || !('detected_foods' in parsedBody)) {
        throw new Error('Backend-ul nu a intors un raspuns JSON valid.');
      }

      setResult(parsedBody);
      setStatusMessage('Analysis complete.');
    } catch (error: any) {
      const rawMessage = error?.message || '';
      const isNetworkError =
        rawMessage.includes('Network Error') || rawMessage.includes('Network request failed');
      const backendHealthy = isNetworkError ? await checkBackendHealth() : false;

      const message =
        (isNetworkError && backendHealthy
          ? 'Backend-ul raspunde, dar upload-ul imaginii a esuat inainte sa primeasca un raspuns valid. Verifica logul Flask si conexiunea dintre telefon si server.'
          : null) ||
        (isNetworkError
          ? `Nu ma pot conecta la backend. Verifica serverul si API URL: ${API_BASE_URL}`
          : null) ||
        rawMessage ||
        'Nu s-a putut analiza imaginea.';

      setErrorMessage(message);
      setStatusMessage(null);
      Alert.alert('Eroare', message);
    } finally {
      setLoading(false);
    }
  };

  const addMealToToday = async () => {
    if (!result) {
      Alert.alert('Rezultat lipsa', 'Analizeaza intai masa.');
      return;
    }

    setSaving(true);

    try {
      await appendNutritionEntry({
        name:
          result.detected_foods.length > 0
            ? result.detected_foods.join(', ')
            : 'Scanned meal',
        calories: result.estimated_calories ?? 0,
        protein: result.protein_g ?? 0,
        carbs: result.carbs_g ?? 0,
        fats: result.fats_g ?? 0,
        source: 'scan',
        note: `AI scan | confidence ${result.confidence}`,
      });

      Alert.alert('Adaugata', 'Masa a fost trimisa in Daily Intake.', [
        {
          text: 'Open Nutrition',
          onPress: () => router.replace('/(tabs)/nutrition'),
        },
        {
          text: 'Ramai aici',
          style: 'cancel',
        },
      ]);
    } catch (error: any) {
      Alert.alert('Eroare', error?.message || 'Nu s-a putut salva masa.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <Text style={commonStyles.kicker}>AI MEAL SCAN</Text>
      <Text style={commonStyles.title}>Scan your meal</Text>
      <Text style={commonStyles.subtitle}>
        Take a photo of your food and get an approximate calorie and macro estimate.
      </Text>

      <InteractivePressable style={[commonStyles.primaryButton, styles.space]} onPress={takePhoto}>
        <Text style={commonStyles.primaryButtonText}>Open Camera</Text>
      </InteractivePressable>

      {imageAsset?.uri ? (
        <View style={commonStyles.card}>
          <Image source={{ uri: imageAsset.uri }} style={styles.preview} />
        </View>
      ) : null}

      <InteractivePressable
        style={[commonStyles.secondaryButton, styles.space]}
        onPress={analyzeMeal}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={commonStyles.secondaryButtonText}>Analyze Meal</Text>
        )}
      </InteractivePressable>

      {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {result ? (
        <View style={commonStyles.card}>
          <Text style={styles.resultTitle}>Estimated result</Text>
          <Text style={styles.line}>
            Foods: {result.detected_foods.length > 0 ? result.detected_foods.join(', ') : 'Unknown'}
          </Text>
          <Text style={styles.line}>Calories: {result.estimated_calories ?? '-'} kcal</Text>
          <Text style={styles.line}>Protein: {result.protein_g ?? '-'} g</Text>
          <Text style={styles.line}>Carbs: {result.carbs_g ?? '-'} g</Text>
          <Text style={styles.line}>Fats: {result.fats_g ?? '-'} g</Text>
          <Text style={styles.line}>Confidence: {result.confidence}</Text>
          <Text style={styles.notes}>{result.notes}</Text>

          <InteractivePressable
            style={[commonStyles.primaryButton, styles.resultButton]}
            onPress={addMealToToday}
            disabled={saving}
          >
            <Text style={commonStyles.primaryButtonText}>
              {saving ? 'Adding...' : 'Add meal to today'}
            </Text>
          </InteractivePressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
