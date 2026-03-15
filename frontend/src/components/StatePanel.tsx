import React from 'react';
import { Text, View } from 'react-native';

import InteractivePressable from './InteractivePressable';
import { commonStyles } from '../styles/common';
import { COLORS, RADIUS, SPACING } from '../styles/theme';

type StatePanelProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function StatePanel({
  title,
  description,
  actionLabel,
  onAction,
}: StatePanelProps) {
  return (
    <View
      style={[
        commonStyles.card,
        {
          borderStyle: 'dashed',
          alignItems: 'flex-start',
          gap: SPACING.sm,
        },
      ]}
    >
      <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>
      <Text style={{ color: COLORS.subtitle, fontSize: 14, lineHeight: 21 }}>{description}</Text>

      {actionLabel && onAction ? (
        <InteractivePressable
          style={{
            marginTop: SPACING.sm,
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            borderWidth: 1,
            borderColor: COLORS.borderSoft,
          }}
          onPress={onAction}
        >
          <Text style={{ color: COLORS.text, fontWeight: '800' }}>{actionLabel}</Text>
        </InteractivePressable>
      ) : null}
    </View>
  );
}
