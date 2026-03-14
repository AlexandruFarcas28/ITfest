import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, usePathname } from 'expo-router';
import { COLORS } from '../styles/theme';

type AppRoute =
  | '/(tabs)/home'
  | '/(tabs)/nutrition'
  | '/(tabs)/water'
  | '/(tabs)/metrics'
  | '/(tabs)/profile';

const tabs: { label: string; path: AppRoute }[] = [
  { label: 'Home', path: '/(tabs)/home' },
  { label: 'Food', path: '/(tabs)/nutrition' },
  { label: 'Water', path: '/(tabs)/water' },
  { label: 'Metrics', path: '/(tabs)/metrics' },
  { label: 'Profile', path: '/(tabs)/profile' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.brand}>FITAPP</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.path;

          return (
            <TouchableOpacity
              key={tab.path}
              onPress={() => router.replace(tab.path)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
  },
  brand: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  row: {
    gap: 10,
    paddingRight: 8,
  },
  tab: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  tabText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: COLORS.accentDark,
  },
});