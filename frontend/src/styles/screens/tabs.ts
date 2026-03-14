import { StyleSheet } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../theme';

export const homeScreenStyles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.section,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  heroEyebrow: {
    color: COLORS.white,
    fontSize: FONT.kicker,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    marginBottom: SPACING.sm,
    maxWidth: 320,
  },
  heroSubtitle: {
    color: 'rgba(255, 243, 232, 0.9)',
    fontSize: FONT.body,
    lineHeight: 22,
    marginBottom: SPACING.xl,
    maxWidth: 320,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
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
    marginBottom: SPACING.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: SPACING.sm,
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
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },
  habitTextWrap: {
    flex: 1,
    paddingRight: SPACING.sm,
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
    maxWidth: 230,
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
    gap: SPACING.md,
    backgroundColor: COLORS.highlight,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 243, 232, 0.16)',
    padding: SPACING.lg,
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
    padding: SPACING.xl,
    marginBottom: SPACING.section,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  summaryKicker: {
    color: COLORS.accent,
    fontSize: FONT.kicker,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: SPACING.sm,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 38,
    fontWeight: '900',
    marginBottom: 6,
  },
  summaryCopy: {
    color: COLORS.subtitle,
    fontSize: FONT.bodySm,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  macroChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minWidth: 120,
    padding: SPACING.md,
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
    marginBottom: SPACING.md,
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  foodContent: {
    flex: 1,
    paddingRight: SPACING.sm,
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
    padding: SPACING.xl,
    marginBottom: SPACING.section,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  heroKicker: {
    color: COLORS.white,
    fontSize: FONT.kicker,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroLabel: {
    color: COLORS.subtitle,
    fontSize: FONT.body,
    marginBottom: SPACING.lg,
  },
  progressTrack: {
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  heroFooterText: {
    color: COLORS.subtitle,
    fontSize: 13,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.section,
  },
  actionCard: {
    flexGrow: 1,
    flexBasis: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    minHeight: 112,
    padding: SPACING.lg,
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
    padding: SPACING.xl,
    marginBottom: SPACING.section,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  heroKicker: {
    color: COLORS.highlight,
    fontSize: FONT.kicker,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroLabel: {
    color: COLORS.subtitle,
    fontSize: FONT.body,
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  inputLast: {
    marginBottom: 0,
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.section,
  },
  resultCard: {
    flexGrow: 1,
    flexBasis: '48%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    minHeight: 118,
    padding: SPACING.lg,
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
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.card,
    marginBottom: SPACING.section,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: 'rgba(255, 243, 232, 0.22)',
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
    borderColor: COLORS.borderSoft,
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

export const mealScanScreenStyles = StyleSheet.create({
  space: {
    marginBottom: SPACING.md,
  },
  preview: {
    width: '100%',
    minHeight: 260,
    height: 260,
    borderRadius: RADIUS.lg,
    resizeMode: 'cover',
  },
  resultTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: SPACING.md,
  },
  line: {
    color: COLORS.text,
    fontSize: FONT.body,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  notes: {
    color: COLORS.subtitle,
    fontSize: FONT.bodySm,
    lineHeight: 21,
    marginTop: SPACING.sm,
  },
  resultButton: {
    marginTop: SPACING.lg,
  },
  statusText: {
    color: COLORS.subtitle,
    fontSize: FONT.bodySm,
    lineHeight: 21,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.accent,
    fontSize: FONT.bodySm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
});
