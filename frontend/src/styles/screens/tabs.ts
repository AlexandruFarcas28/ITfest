import { StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../theme';

export const homeScreenStyles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 24,
  },
  heroEyebrow: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 10,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
    maxWidth: 290,
  },
  heroSubtitle: {
    color: 'rgba(255, 243, 232, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 290,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  heroDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 243, 232, 0.24)',
  },
  heroMetricValue: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  heroMetricLabel: {
    color: 'rgba(255, 243, 232, 0.84)',
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 14,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '700',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  statHint: {
    color: COLORS.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  habitTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  habitDetail: {
    color: COLORS.subtitle,
    fontSize: 13,
    maxWidth: 220,
  },
  habitPill: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  habitPillText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.highlight,
    borderRadius: RADIUS.lg,
    padding: 18,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(58, 19, 6, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    color: COLORS.accentDark,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },
  tipText: {
    color: '#163536',
    fontSize: 14,
    lineHeight: 20,
  },
});

export const nutritionScreenStyles = StyleSheet.create({
  summaryCard: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryKicker: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 38,
    fontWeight: '900',
    marginBottom: 6,
  },
  summaryCopy: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.md,
    padding: 14,
  },
  macroChipValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  macroChipLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  inputNoMargin: {
    marginBottom: 14,
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 14,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },
  foodHint: {
    color: COLORS.muted,
    fontSize: 13,
  },
  caloriePill: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  calorieText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
});

export const waterScreenStyles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroKicker: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  heroValue: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroLabel: {
    color: COLORS.subtitle,
    fontSize: 15,
    marginBottom: 18,
  },
  progressTrack: {
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroFooterText: {
    color: COLORS.subtitle,
    fontSize: 13,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 20,
  },
  actionValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  actionLabel: {
    color: COLORS.subtitle,
    fontSize: 13,
  },
  tipTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  tipText: {
    color: COLORS.subtitle,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  resetButton: {
    marginTop: 4,
  },
});

export const metricsScreenStyles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroKicker: {
    color: COLORS.highlight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  heroValue: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroLabel: {
    color: COLORS.subtitle,
    fontSize: 15,
    marginBottom: 18,
  },
  goalPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  goalPillText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  inputSpacing: {
    marginBottom: 14,
  },
  inputLast: {
    marginBottom: 0,
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 18,
  },
  resultLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 8,
  },
  resultValue: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: '900',
  },
});

export const profileScreenStyles = StyleSheet.create({
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.accentDark,
    fontSize: 24,
    fontWeight: '900',
  },
  identityContent: {
    flex: 1,
  },
  identityName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  identityEmail: {
    color: COLORS.subtitle,
    fontSize: 14,
  },
  inputLast: {
    marginBottom: 0,
  },
  primarySpacing: {
    marginTop: 2,
    marginBottom: 12,
  },
});

export const plansScreenStyles = StyleSheet.create({
  planTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  planCalories: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  planMacros: {
    color: COLORS.subtitle,
    fontSize: 14,
    marginBottom: 10,
  },
  planDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});

export const leaderboardScreenStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rankText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  userScore: {
    color: COLORS.subtitle,
    fontSize: 14,
  },
});
