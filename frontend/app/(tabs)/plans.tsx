import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import TopNav from '../../src/components/TopNav';
import { commonStyles } from '../../src/styles/common';
import { plansScreenStyles as styles } from '../../src/styles/screens/tabs';

function PlanCard({
  title,
  calories,
  macros,
  description,
}: {
  title: string;
  calories: string;
  macros: string;
  description: string;
}) {
  return (
    <View style={commonStyles.card}>
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planCalories}>{calories}</Text>
      <Text style={styles.planMacros}>{macros}</Text>
      <Text style={styles.planDescription}>{description}</Text>
    </View>
  );
}

export default function PlansScreen() {
  return (
    <ScrollView contentContainerStyle={commonStyles.screen} showsVerticalScrollIndicator={false}>
      <TopNav />

      <Text style={commonStyles.kicker}>PLANS</Text>
      <Text style={commonStyles.title}>Choose your goal</Text>
      <Text style={commonStyles.subtitle}>
        Pick a simple direction based on your current objective and stay consistent.
      </Text>

      <PlanCard
        title="Cut"
        calories="~ 1,900 kcal / day"
        macros="High protein • Moderate carbs • Lower fats"
        description="Best for fat loss while keeping muscle mass and improving definition."
      />

      <PlanCard
        title="Bulk"
        calories="~ 2,800 kcal / day"
        macros="High protein • High carbs • Moderate fats"
        description="Best for muscle gain, strength progress and steady weight increase."
      />

      <PlanCard
        title="Recomp"
        calories="~ 2,300 kcal / day"
        macros="High protein • Balanced carbs • Balanced fats"
        description="Best for beginners or people returning to training who want gradual body improvement."
      />
    </ScrollView>
  );
}
