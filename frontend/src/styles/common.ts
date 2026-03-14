import { StyleSheet } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from './theme';

export const commonStyles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl + SPACING.md,
  },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.card,
    marginBottom: SPACING.xl,
  },

  glassCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.card,
  },

  pageHeader: {
    marginBottom: SPACING.xl,
  },

  pageHeaderCompact: {
    marginBottom: SPACING.lg,
  },

  kicker: {
    color: COLORS.accent,
    fontSize: FONT.kicker,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: SPACING.md,
  },

  title: {
    color: COLORS.text,
    fontSize: FONT.title,
    fontWeight: '900',
    lineHeight: 37,
    marginBottom: SPACING.md,
  },

  subtitle: {
    color: COLORS.subtitle,
    fontSize: FONT.body,
    lineHeight: 22,
    maxWidth: 620,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT.section,
    fontWeight: '800',
  },

  sectionMeta: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  sectionCard: {
    marginBottom: SPACING.section,
  },

  input: {
    backgroundColor: COLORS.cardInner,
    borderColor: COLORS.borderSoft,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    minHeight: 58,
    paddingVertical: SPACING.lg,
    fontSize: FONT.body,
    marginBottom: SPACING.md,
  },

  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    minHeight: 56,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  primaryButtonText: {
    color: COLORS.accentDark,
    fontWeight: '900',
    fontSize: FONT.body,
    letterSpacing: 0.2,
  },

  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    minHeight: 56,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: FONT.body,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 104, 0, 0.22)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  badgeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.borderSoft,
  },
});
