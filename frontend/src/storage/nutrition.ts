import AsyncStorage from '@react-native-async-storage/async-storage';

const NUTRITION_STORAGE_KEY = 'fitapp_nutrition_entries';

export type NutritionEntry = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  source: 'manual' | 'scan';
  note?: string;
  createdAt: string;
};

const DEFAULT_ENTRIES: NutritionEntry[] = [
  {
    id: 'seed-chicken-breast',
    name: 'Chicken breast',
    calories: 220,
    protein: 42,
    carbs: 0,
    fats: 5,
    source: 'manual',
    createdAt: '2026-03-14T08:00:00.000Z',
  },
  {
    id: 'seed-rice-bowl',
    name: 'Rice bowl',
    calories: 180,
    protein: 4,
    carbs: 38,
    fats: 1,
    source: 'manual',
    createdAt: '2026-03-14T12:00:00.000Z',
  },
  {
    id: 'seed-eggs',
    name: 'Eggs',
    calories: 140,
    protein: 12,
    carbs: 2,
    fats: 10,
    source: 'manual',
    createdAt: '2026-03-14T18:00:00.000Z',
  },
];

function normalizeEntry(entry: Partial<NutritionEntry>): NutritionEntry | null {
  if (!entry.name?.trim()) return null;

  return {
    id: entry.id?.trim() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: entry.name.trim(),
    calories: Number(entry.calories) || 0,
    protein: Number(entry.protein) || 0,
    carbs: Number(entry.carbs) || 0,
    fats: Number(entry.fats) || 0,
    source: entry.source === 'scan' ? 'scan' : 'manual',
    note: entry.note?.trim() || undefined,
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

export function getDefaultNutritionEntries() {
  return DEFAULT_ENTRIES.map((entry) => ({ ...entry }));
}

export async function getStoredNutritionEntries(): Promise<NutritionEntry[]> {
  const rawEntries = await AsyncStorage.getItem(NUTRITION_STORAGE_KEY);

  if (!rawEntries) {
    return getDefaultNutritionEntries();
  }

  try {
    const parsedEntries = JSON.parse(rawEntries);

    if (!Array.isArray(parsedEntries)) {
      return getDefaultNutritionEntries();
    }

    const normalizedEntries = parsedEntries
      .map((entry) => normalizeEntry(entry))
      .filter((entry): entry is NutritionEntry => entry !== null);

    return normalizedEntries.length > 0 ? normalizedEntries : getDefaultNutritionEntries();
  } catch {
    await AsyncStorage.removeItem(NUTRITION_STORAGE_KEY);
    return getDefaultNutritionEntries();
  }
}

export async function saveNutritionEntries(entries: NutritionEntry[]) {
  await AsyncStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export async function appendNutritionEntry(entry: Partial<NutritionEntry>) {
  const normalizedEntry = normalizeEntry(entry);

  if (!normalizedEntry) {
    throw new Error('Nutrition entry must include a valid name.');
  }

  const currentEntries = await getStoredNutritionEntries();
  const nextEntries = [...currentEntries, normalizedEntry];
  await saveNutritionEntries(nextEntries);
  return normalizedEntry;
}
