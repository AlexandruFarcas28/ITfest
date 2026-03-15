import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { invalidateSession, isJwtToken } from '../auth/session';

function extractHost(candidate) {
  if (!candidate || typeof candidate !== 'string') {
    return null;
  }

  const sanitizedValue = candidate
    .trim()
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');

  return sanitizedValue || null;
}

function resolveDefaultApiUrl() {
  const explicitApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (explicitApiUrl) {
    return explicitApiUrl;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }

  const expoHost = extractHost(Constants.expoConfig?.hostUri);
  const expoGoHost = extractHost(Constants.expoGoConfig?.debuggerHost);
  const linkingHost = extractHost(Constants.linkingUri);

  if (expoHost) {
    return `http://${expoHost}:5000/api`;
  }

  if (expoGoHost) {
    return `http://${expoGoHost}:5000/api`;
  }

  if (linkingHost) {
    return `http://${linkingHost}:5000/api`;
  }

  return 'http://127.0.0.1:5000/api';
}

export const API_BASE_URL = resolveDefaultApiUrl();

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const authHeader = error?.config?.headers?.Authorization;

    if (status === 401 && typeof authHeader === 'string') {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      if (isJwtToken(token)) {
        await invalidateSession();
      }
    }

    return Promise.reject(error);
  },
);

export default API;
