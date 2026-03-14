import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import InteractivePressable from './InteractivePressable';
import { COLORS, FONT, RADIUS, SPACING } from '../styles/theme';

type AppRoute =
  | '/(tabs)/home'
  | '/(tabs)/nutrition'
  | '/(tabs)/water'
  | '/(tabs)/metrics'
  | '/(tabs)/plans'
  | '/(tabs)/leaderboard'
  | '/(tabs)/meal-scan'
  | '/(tabs)/profile';

const tabs: { label: string; path: AppRoute }[] = [
  { label: 'Home', path: '/(tabs)/home' },
  { label: 'Food', path: '/(tabs)/nutrition' },
  { label: 'Water', path: '/(tabs)/water' },
  { label: 'Metrics', path: '/(tabs)/metrics' },
  { label: 'Plans', path: '/(tabs)/plans' },
  { label: 'Top', path: '/(tabs)/leaderboard' },
  { label: 'Scan', path: '/(tabs)/meal-scan' },
  { label: 'Profile', path: '/(tabs)/profile' },
];

export default function TopNav() {
  const pathname = usePathname() as AppRoute;

  return (
    <View style={styles.wrapper}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>FITAPP</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        bounces={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.row}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.path;

          return (
            <InteractivePressable
              key={tab.path}
              onPress={() => router.replace(tab.path as never)}
              style={[styles.tab, active && styles.tabActive]}
              hitSlop={6}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </InteractivePressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.section,
  },
  brandRow: {
    marginBottom: SPACING.md,
  },
  brand: {
    color: COLORS.accent,
    fontSize: FONT.kicker,
    fontWeight: '900',
    letterSpacing: 3,
  },
  row: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
    paddingBottom: 4,
  },
  tab: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    minHeight: 54,
    minWidth: 92,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  tabTextActive: {
    color: COLORS.text,
  },
});
