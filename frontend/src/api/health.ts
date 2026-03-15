import API from './config';
import type {
  DashboardPayload,
  Gamification,
  MealHistoryResponse,
  MealMutationResponse,
  NutritionDayResponse,
  ProfilePayload,
  WaterSnapshot,
  WeeklyInsights,
} from '../types/health';

export type MealEntryInput = {
  name: string;
  meal_type?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  source?: string;
  favorite?: boolean;
  repeatable?: boolean;
  image_uri?: string | null;
  analysis_mode?: string;
  detected_foods?: string[];
  ai_description?: string;
  ai_confidence?: string;
  confidence_reason?: string;
  goal_comparison?: string;
  improvement_suggestions?: string[];
  later_meal_suggestion?: string;
  notes?: string;
};

export type ProfileUpdateInput = Partial<
  Omit<ProfilePayload, 'id' | 'email' | 'resolved_targets'>
>;

export async function fetchDashboard() {
  const response = await API.get<DashboardPayload>('/dashboard');
  return response.data;
}

export async function fetchNutritionDay(date?: string) {
  const response = await API.get<NutritionDayResponse>('/nutrition', {
    params: date ? { date } : undefined,
  });
  return response.data;
}

export async function fetchMealHistory(days = 14, limit = 30) {
  const response = await API.get<MealHistoryResponse>('/nutrition/history', {
    params: { days, limit },
  });
  return response.data;
}

export async function createMealEntry(payload: MealEntryInput) {
  const response = await API.post<MealMutationResponse>('/nutrition', payload);
  return response.data;
}

export async function updateMealEntry(entryId: string, payload: Partial<MealEntryInput>) {
  const response = await API.put<MealMutationResponse>(`/nutrition/${entryId}`, payload);
  return response.data;
}

export async function repeatMealEntry(entryId: string) {
  const response = await API.post<MealMutationResponse>(`/nutrition/${entryId}/repeat`);
  return response.data;
}

export async function deleteMealEntry(entryId: string) {
  const response = await API.delete<{ message: string; gamification: Gamification }>(
    `/nutrition/${entryId}`,
  );
  return response.data;
}

export async function fetchWaterStatus(date?: string) {
  const response = await API.get<WaterSnapshot>('/water', {
    params: date ? { date } : undefined,
  });
  return response.data;
}

export async function updateWater(payload: {
  amount_ml: number;
  mode?: 'add' | 'set';
  date?: string;
}) {
  const response = await API.post<WaterSnapshot>('/water', payload);
  return response.data;
}

export async function fetchWaterHistory(days = 7) {
  const response = await API.get<{ date: string; amount_ml: number; goal_ml: number }[]>(
    '/water/history',
    {
      params: { days },
    },
  );
  return response.data;
}

export async function fetchWeeklyInsights() {
  const response = await API.get<WeeklyInsights>('/insights/weekly');
  return response.data;
}

export async function fetchGamification() {
  const response = await API.get<Gamification>('/gamification');
  return response.data;
}

export async function fetchProfile() {
  const response = await API.get<ProfilePayload>('/profile');
  return response.data;
}

export async function updateProfile(payload: ProfileUpdateInput) {
  const response = await API.put<ProfilePayload>('/profile', payload);
  return response.data;
}
