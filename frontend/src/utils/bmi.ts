import type { BmiCategory, BmiMeasurement } from '../types/health';

export function formatBmiValue(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--';
  }

  return value.toFixed(1);
}

export function formatWeightKg(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--';
  }

  return `${value.toFixed(1)} kg`;
}

export function goalTypeLabel(goalType: string | null | undefined) {
  switch ((goalType || '').trim().toLowerCase()) {
    case 'cut':
      return 'Weight loss';
    case 'bulk':
      return 'Muscle gain';
    case 'recomp':
      return 'Maintenance';
    default:
      return 'Maintenance';
  }
}

export function bmiCategoryTheme(category: BmiCategory) {
  switch (category) {
    case 'underweight':
      return {
        accent: '#8ED8FF',
        accentSoft: 'rgba(142, 216, 255, 0.18)',
        gradient: ['#0D4B50', '#2B84A0'] as const,
      };
    case 'normal':
      return {
        accent: '#38D39F',
        accentSoft: 'rgba(56, 211, 159, 0.18)',
        gradient: ['#0E4B3F', '#1BAA7E'] as const,
      };
    case 'overweight':
      return {
        accent: '#F6C667',
        accentSoft: 'rgba(246, 198, 103, 0.18)',
        gradient: ['#5B3C0E', '#C78314'] as const,
      };
    case 'obesity':
      return {
        accent: '#FF8D6B',
        accentSoft: 'rgba(255, 141, 107, 0.18)',
        gradient: ['#612215', '#B84A2A'] as const,
      };
    default:
      return {
        accent: '#19A7A0',
        accentSoft: 'rgba(25, 167, 160, 0.18)',
        gradient: ['#0D4B50', '#19A7A0'] as const,
      };
  }
}

export function trendDirectionLabel(direction: 'up' | 'down' | 'stable', delta: number | null) {
  if (direction === 'stable' || delta === null) {
    return 'Stable';
  }

  return `${direction === 'up' ? '+' : ''}${delta.toFixed(1)} BMI`;
}

export function measurementShortLabel(entry: BmiMeasurement) {
  try {
    return new Date(entry.recorded_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return entry.recorded_at;
  }
}
