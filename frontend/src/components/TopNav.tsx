import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '../styles/theme';

type AppRoute =
  | '/(tabs)/home'
  | '/(tabs)/nutrition'
  | '/(tabs)/water'
  | '/(tabs)/metrics'
  | '/(tabs)/profile';

const tabs: { label: string; path: AppRoute; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { label: 'Home', path: '/(tabs)/home', icon: 'home' },
  { label: 'Food', path: '/(tabs)/nutrition', icon: 'restaurant' },
  { label: 'Water', path: '/(tabs)/water', icon: 'water' },
  { label: 'Metrics', path: '/(tabs)/metrics', icon: 'stats-chart' },
  { label: 'Profile', path: '/(tabs)/profile', icon: 'person' },
];

export default function TopNav() {
  const pathname = usePathname() as AppRoute;

  return (
    <LinearGradient
      colors={['#0D4B50', '#6F2107']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.shell}
    >
      <View style={styles.row}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../gallery/logo_app.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.navRow}>
        {tabs.map((tab) => {
          const active = pathname === tab.path;

          return (
            <TouchableOpacity
              key={tab.path}
              activeOpacity={0.85}
              onPress={() => router.replace(tab.path)}
              style={[styles.navButton, active && styles.navButtonActive]}
            >
              <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                <Ionicons
                  name={tab.icon}
                  size={13}
                  color={active ? COLORS.white : COLORS.subtitle}
                />
              </View>
              <Text
                style={[styles.navButtonText, active && styles.navButtonTextActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logo: {
    width: 26,
    height: 26,
  },
  navRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    gap: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  navIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  navButtonText: {
    color: COLORS.subtitle,
    fontSize: 9,
    fontWeight: '800',
  },
  navButtonTextActive: {
    color: COLORS.white,
  },
});
