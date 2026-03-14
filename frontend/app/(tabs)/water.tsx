import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../src/components/ScreenHeader';
import TopNav from '../../src/components/TopNav';
import InteractivePressable from '../../src/components/InteractivePressable';
import TrendChart from '../../src/components/TrendChart';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';
import { waterScreenStyles as styles } from '../../src/styles/screens/tabs';

export default function WaterScreen() {
  const [water, setWater] = useState(1500);
  const goal = 2500;

  const progress = useMemo(() => Math.min((water / goal) * 100, 100), [water]);
  const progressWidth = useRef(new Animated.Value(progress)).current;
  const hydrationTrend = useMemo(
    () => [
      { label: 'Mon', value: 1800 },
      { label: 'Tue', value: 2100 },
      { label: 'Wed', value: 1950 },
      { label: 'Thu', value: 2300 },
      { label: 'Fri', value: 2050 },
      { label: 'Sat', value: 2400 },
      { label: 'Now', value: water },
    ],
    [water]
  );

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressWidth]);

  const animatedProgressWidth = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="HYDRATION"
        title="Keep water intake in rhythm."
        subtitle="Fast actions, a clear progress state and weekly context keep the habit lightweight on mobile."
      />

      <LinearGradient
        colors={['#0D4B50', '#19A7A0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroKicker}>WATER STATUS</Text>
        <Text style={styles.heroValue}>{water} ml</Text>
        <Text style={styles.heroLabel}>Goal: {goal} ml today</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: animatedProgressWidth }]} />
        </View>

        <View style={styles.heroFooter}>
          <Text style={styles.heroFooterText}>{Math.round(progress)}% complete</Text>
          <Text style={styles.heroFooterText}>
            {goal - water > 0 ? `${goal - water} ml left` : 'Goal hit'}
          </Text>
        </View>
      </LinearGradient>

      <View style={commonStyles.sectionRow}>
        <Text style={commonStyles.sectionTitle}>Quick actions</Text>
        <Text style={commonStyles.sectionMeta}>One tap updates</Text>
      </View>

      <View style={styles.actionGrid}>
        <InteractivePressable style={styles.actionCard} onPress={() => setWater((value) => value + 250)}>
          <Text style={styles.actionValue}>+250</Text>
          <Text style={styles.actionLabel}>small bottle</Text>
        </InteractivePressable>

        <InteractivePressable style={styles.actionCard} onPress={() => setWater((value) => value + 500)}>
          <Text style={styles.actionValue}>+500</Text>
          <Text style={styles.actionLabel}>large bottle</Text>
        </InteractivePressable>
      </View>

      <TrendChart
        title="Hydration history"
        subtitle="Ready for database-backed daily hydration entries as soon as you persist water logs."
        data={hydrationTrend}
        accentColor={COLORS.highlight}
        target={goal}
        targetLabel="Daily goal"
        valueFormatter={(value) => `${Math.round(value)} ml`}
      />

      <View style={commonStyles.card}>
        <Text style={styles.tipTitle}>Hydration note</Text>
        <Text style={styles.tipText}>
          Spread your intake across the full day to keep energy and focus more stable.
        </Text>
        <InteractivePressable style={[commonStyles.secondaryButton, styles.resetButton]} onPress={() => setWater(0)}>
          <Text style={commonStyles.secondaryButtonText}>Reset tracker</Text>
        </InteractivePressable>
      </View>
    </ScrollView>
  );
}
