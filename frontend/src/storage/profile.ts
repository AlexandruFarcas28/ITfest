import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_STORAGE_KEY = 'fitapp_profile';

export type StoredProfile = {
  name?: string;
  email?: string;
  weight?: string;
  height?: string;
  age?: string;
};

function normalizeProfile(profile: StoredProfile): StoredProfile {
  const normalized: StoredProfile = {};

  if (profile.name?.trim()) normalized.name = profile.name.trim();
  if (profile.email?.trim()) normalized.email = profile.email.trim().toLowerCase();
  if (profile.weight?.trim()) normalized.weight = profile.weight.trim();
  if (profile.height?.trim()) normalized.height = profile.height.trim();
  if (profile.age?.trim()) normalized.age = profile.age.trim();

  return normalized;
}

export async function getStoredProfile(): Promise<StoredProfile | null> {
  const rawProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);

  if (!rawProfile) return null;

  try {
    const parsed = JSON.parse(rawProfile) as StoredProfile;
    return normalizeProfile(parsed);
  } catch {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
}

export async function saveStoredProfile(profile: StoredProfile) {
  const normalized = normalizeProfile(profile);

  if (Object.keys(normalized).length === 0) {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    return normalized;
  }

  await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function mergeStoredProfile(profile: StoredProfile) {
  const currentProfile = (await getStoredProfile()) ?? {};
  return saveStoredProfile({ ...currentProfile, ...profile });
}

export async function clearStoredProfile() {
  await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
}
