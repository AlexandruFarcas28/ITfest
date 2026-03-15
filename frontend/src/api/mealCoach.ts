import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import { invalidateSession, isJwtToken } from '../auth/session';
import { API_BASE_URL } from './config';
import type { MealCoachResult } from '../types/health';

function parseErrorPayload(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = String((payload as { error?: string }).error || fallback);
    const details =
      'details' in payload && typeof (payload as { details?: unknown }).details === 'string'
        ? (payload as { details?: string }).details
        : '';
    return details ? `${error}: ${details}` : error;
  }

  return fallback;
}

export async function analyzeMealImage(asset: ImagePickerAsset): Promise<MealCoachResult> {
  const formData = new FormData();

  if (Platform.OS === 'web' && asset.file) {
    formData.append('image', asset.file, asset.file.name || 'meal.jpg');
  } else {
    formData.append('image', {
      uri: asset.uri,
      name: asset.fileName || 'meal.jpg',
      type: asset.mimeType || 'image/jpeg',
    } as never);
  }

  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/ai/estimate-meal`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const rawBody = await response.text();

  let parsedBody: MealCoachResult | { error?: string; details?: string } | null = null;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsedBody = null;
  }

  if (response.status === 401 && isJwtToken(token)) {
    await invalidateSession();
  }

  if (!response.ok) {
    throw new Error(parseErrorPayload(parsedBody, rawBody || 'Meal analysis failed.'));
  }

  if (!parsedBody || !('meal_name' in parsedBody)) {
    throw new Error('Backend-ul nu a intors un raspuns JSON valid.');
  }

  return parsedBody;
}
