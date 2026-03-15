import type { Gamification, GoalProgress } from '../types/health';

export function formatGoalValue(value: number, unit: string) {
  return `${Math.round(value)}${unit}`;
}

export function formatIsoDateTime(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export function clampRatio(ratio: number) {
  return Math.max(0, Math.min(ratio, 1));
}

export function progressLabel(progress: GoalProgress, unit: string) {
  return `${Math.round(progress.value)} / ${Math.round(progress.target)}${unit}`;
}

export function levelProgress(gamification: Gamification) {
  const currentLevelStart = (gamification.level - 1) * gamification.level_step_xp;
  const currentLevelTarget = gamification.next_level_at - currentLevelStart;
  return {
    current: gamification.level_progress_xp,
    target: currentLevelTarget,
    ratio:
      currentLevelTarget > 0
        ? gamification.level_progress_xp / currentLevelTarget
        : 0,
  };
}

export function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
