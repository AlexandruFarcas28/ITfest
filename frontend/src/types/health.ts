export type TrendDatum = {
  label: string;
  value: number;
};

export type GoalProgress = {
  value: number;
  target: number;
  remaining: number;
  ratio: number;
  percent: number;
};

export type UserTargets = {
  goal_type: string;
  activity_level: string;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fats_goal: number;
  water_goal_ml: number;
};

export type GamificationBadge = {
  id: string;
  label: string;
  description: string;
  earned_at: string;
};

export type Gamification = {
  user_id: string;
  meal_logging_streak: number;
  hydration_streak: number;
  consistency_streak: number;
  meal_logs_count: number;
  meal_days_count: number;
  hydration_days_count: number;
  consistency_days_count: number;
  favorite_count: number;
  ai_scans: number;
  xp: number;
  level: number;
  level_step_xp: number;
  level_progress_xp: number;
  next_level_at: number;
  badges: GamificationBadge[];
  updated_at: string;
};

export type MealEntry = {
  id: string;
  name: string;
  date: string;
  meal_type: string;
  meal_type_label: string;
  source: string;
  favorite: boolean;
  repeatable: boolean;
  created_at: string;
  updated_at: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image_uri?: string | null;
  image_url?: string | null;
  image_file_id?: string | null;
  image_storage?: string | null;
  image_filename?: string | null;
  image_content_type?: string | null;
  analysis_mode: string;
  detected_foods: string[];
  ai_description?: string | null;
  ai_confidence?: string | null;
  confidence_reason?: string | null;
  goal_comparison?: string | null;
  improvement_suggestions: string[];
  later_meal_suggestion?: string | null;
  notes?: string | null;
  user_corrections?: Record<string, unknown> | null;
};

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals_logged: number;
};

export type DashboardPayload = {
  date: string;
  goals: UserTargets;
  totals: MacroTotals & {
    water_ml: number;
  };
  progress: {
    calories: GoalProgress;
    protein: GoalProgress;
    carbs: GoalProgress;
    fats: GoalProgress;
    water: GoalProgress;
  };
  quick_summary: string;
  today_focus: {
    title: string;
    description: string;
    cta: string;
  };
  recent_meals: MealEntry[];
  gamification: Gamification;
};

export type MealCoachResult = {
  analysis_mode: string;
  meal_name: string;
  meal_type: string;
  image_url?: string | null;
  image_file_id?: string | null;
  image_storage?: string | null;
  image_filename?: string | null;
  image_content_type?: string | null;
  detected_foods: string[];
  estimated_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  description: string;
  confidence: string;
  confidence_reason: string;
  goal_comparison: string;
  improvement_suggestions: string[];
  later_meal_suggestion: string;
  notes: string;
};

export type NutritionDayResponse = {
  date: string;
  entries: MealEntry[];
  totals: MacroTotals;
  goals: UserTargets;
  progress: {
    calories: GoalProgress;
    protein: GoalProgress;
    carbs: GoalProgress;
    fats: GoalProgress;
  };
};

export type MealHistoryResponse = {
  items: MealEntry[];
  daily_totals: {
    date: string;
    label: string;
    total_calories: number;
    protein: number;
    carbs: number;
    fats: number;
    water_ml: number;
  }[];
  stats: {
    favorite_count: number;
    ai_meal_count: number;
    logged_meal_count: number;
  };
};

export type WaterSnapshot = {
  date: string;
  amount_ml: number;
  goal_ml: number;
  progress: GoalProgress;
  gamification?: Gamification;
};

export type WeeklyInsights = {
  period_start: string;
  period_end: string;
  goals: UserTargets;
  calorie_trend: TrendDatum[];
  hydration_trend: TrendDatum[];
  macro_balance_trend: TrendDatum[];
  macro_average: {
    protein: number;
    carbs: number;
    fats: number;
  };
  most_common_meal_type: string;
  strongest_habit: string;
  weakest_habit: string;
  weekly_summary: string;
};

export type ProfilePayload = {
  id: string;
  nume: string;
  email: string;
  weight: number | null;
  height: number | null;
  age: number | null;
  goal_type: string;
  activity_level: string;
  daily_calorie_goal: number | null;
  daily_protein_goal: number | null;
  daily_carbs_goal: number | null;
  daily_fats_goal: number | null;
  water_goal_ml: number | null;
  resolved_targets: UserTargets;
};

export type MealMutationResponse = {
  entry: MealEntry;
  gamification: Gamification;
};
