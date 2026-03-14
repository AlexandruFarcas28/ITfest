import { StyleSheet } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from './theme';

export const commonStyles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: 36,
  },

  kicker: {
    color: COLORS.muted,
    fontSize: FONT.kicker,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },

  title: {
    color: COLORS.text,
    fontSize: FONT.title,
    fontWeight: '900',
    marginBottom: SPACING.sm,
  },

  subtitle: {
    color: COLORS.subtitle,
    fontSize: FONT.body,
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT.section,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: SPACING.md,
  },

  innerCard: {
    backgroundColor: COLORS.cardInner,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 16,
  },

  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONT.body,
    marginBottom: 14,
  },

  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: COLORS.accentDark,
    fontWeight: '900',
    fontSize: FONT.body,
  },

  secondaryButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: FONT.body,
  },
});