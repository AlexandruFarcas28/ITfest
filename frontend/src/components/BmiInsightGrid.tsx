import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../styles/theme';

export type BmiInsightItem = {
  label: string;
  value: string;
  hint?: string;
};

type BmiInsightGridProps = {
  items: BmiInsightItem[];
};

export default function BmiInsightGrid({ items }: BmiInsightGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
          {item.hint ? <Text style={styles.hint}>{item.hint}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.section,
  },
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: 6,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  value: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  hint: {
    color: COLORS.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
});
