import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../src/components/ScreenHeader';
import TopNav from '../../src/components/TopNav';
import TrendChart from '../../src/components/TrendChart';
import { getStoredProfile, mergeStoredProfile } from '../../src/storage/profile';
import { commonStyles } from '../../src/styles/common';
import { COLORS } from '../../src/styles/theme';
import { metricsScreenStyles as styles } from '../../src/styles/screens/tabs';

export default function MetricsScreen() {
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const numericWeight = parseFloat(weight) || 80;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        const storedProfile = await getStoredProfile();

        if (!isActive) return;

        if (storedProfile?.weight) setWeight(storedProfile.weight);
        if (storedProfile?.height) setHeight(storedProfile.height);
        setProfileLoaded(true);
      };

      loadProfile();

      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    if (!profileLoaded || !hasEdited) return;

    mergeStoredProfile({ weight, height });
  }, [hasEdited, height, profileLoaded, weight]);

  const handleWeightChange = (value: string) => {
    setHasEdited(true);
    setWeight(value);
  };

  const handleHeightChange = (value: string) => {
    setHasEdited(true);
    setHeight(value);
  };

  const bmi = useMemo(() => {
    const parsedWeight = parseFloat(weight);
    const parsedHeight = parseFloat(height) / 100;

    if (!parsedWeight || !parsedHeight) return '-';

    return (parsedWeight / (parsedHeight * parsedHeight)).toFixed(1);
  }, [weight, height]);

  const goal = useMemo(() => {
    const parsedBmi = parseFloat(bmi);
    if (!parsedBmi || bmi === '-') return 'Set your metrics';
    if (parsedBmi < 20) return 'Bulk';
    if (parsedBmi <= 25) return 'Recomp';
    return 'Cut';
  }, [bmi]);

  const targetWeight = useMemo(() => {
    if (goal === 'Cut') return 76;
    if (goal === 'Bulk') return 84;
    if (goal === 'Recomp') return 80;
    return undefined;
  }, [goal]);

  const weightTrend = useMemo(
    () => [
      { label: 'W1', value: 83.4 },
      { label: 'W2', value: 82.8 },
      { label: 'W3', value: 82.2 },
      { label: 'W4', value: 81.5 },
      { label: 'W5', value: 81.1 },
      { label: 'W6', value: 80.6 },
      { label: 'Now', value: numericWeight },
    ],
    [numericWeight]
  );

  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <ScreenHeader
        kicker="METRICS"
        title="See progress clearly."
        subtitle="Body stats, BMI and trend context are grouped here so updates stay simple and readable."
      />

      <LinearGradient
        colors={['#6F2107', '#0D4B50']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroKicker}>BODY SNAPSHOT</Text>
        <Text style={styles.heroValue}>{bmi}</Text>
        <Text style={styles.heroLabel}>Current BMI</Text>

        <View style={styles.goalPill}>
          <Text style={styles.goalPillText}>{goal}</Text>
        </View>
      </LinearGradient>

      <View style={commonStyles.sectionRow}>
        <Text style={commonStyles.sectionTitle}>Update measurements</Text>
        <Text style={commonStyles.sectionMeta}>Keep it current</Text>
      </View>

      <View style={commonStyles.card}>
        <TextInput
          style={[commonStyles.input, styles.inputSpacing]}
          placeholder="Weight (kg)"
          placeholderTextColor={COLORS.muted}
          value={weight}
          onChangeText={handleWeightChange}
          keyboardType="numeric"
        />

        <TextInput
          style={[commonStyles.input, styles.inputLast]}
          placeholder="Height (cm)"
          placeholderTextColor={COLORS.muted}
          value={height}
          onChangeText={handleHeightChange}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.resultGrid}>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Suggested goal</Text>
          <Text style={styles.resultValue}>{goal}</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Status</Text>
          <Text style={styles.resultValue}>{bmi === '-' ? 'Waiting' : 'Tracked'}</Text>
        </View>
      </View>

      <TrendChart
        title="Weight evolution"
        subtitle="This chart is ready for historical weigh-ins once the database stores body measurements."
        data={weightTrend}
        accentColor={COLORS.highlight}
        chartHeight={76}
        scaleMode="fit"
        target={targetWeight}
        targetLabel={targetWeight ? 'Goal weight' : undefined}
        valueFormatter={(value) => `${value.toFixed(1)} kg`}
      />
    </ScrollView>
  );
}
