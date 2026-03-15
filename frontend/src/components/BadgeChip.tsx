import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../styles/theme';

type BadgeChipProps = {
  label: string;
  description?: string;
};

export default function BadgeChip({ label, description }: BadgeChipProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS.accentSoft,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 104, 0, 0.28)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: 4,
      }}
    >
      <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '900' }}>{label}</Text>
      {description ? (
        <Text style={{ color: COLORS.subtitle, fontSize: 12, lineHeight: 17 }}>{description}</Text>
      ) : null}
    </View>
  );
}
