import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../styles/theme';
import { clampRatio } from '../utils/health';

type ProgressStatCardProps = {
  label: string;
  valueLabel: string;
  hint: string;
  ratio: number;
  accentColor?: string;
};

export default function ProgressStatCard({
  label,
  valueLabel,
  hint,
  ratio,
  accentColor = COLORS.accent,
}: ProgressStatCardProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.borderSoft,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        gap: SPACING.sm,
      }}
    >
      <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '700' }}>{label}</Text>
      <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '900' }}>{valueLabel}</Text>
      <View
        style={{
          height: 10,
          borderRadius: RADIUS.pill,
          overflow: 'hidden',
          backgroundColor: COLORS.cardInner,
        }}
      >
        <View
          style={{
            width: `${clampRatio(ratio) * 100}%`,
            height: '100%',
            backgroundColor: accentColor,
            borderRadius: RADIUS.pill,
          }}
        />
      </View>
      <Text style={{ color: COLORS.subtitle, fontSize: 13, lineHeight: 18 }}>{hint}</Text>
    </View>
  );
}
