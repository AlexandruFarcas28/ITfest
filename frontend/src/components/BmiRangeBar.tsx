import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../styles/theme';
import type { BmiCategory } from '../types/health';
import { bmiCategoryTheme, formatBmiValue } from '../utils/bmi';

const RANGE_MIN = 14;
const RANGE_MAX = 40;

const SEGMENTS = [
  { label: 'Underweight', start: RANGE_MIN, end: 18.5, color: '#8ED8FF' },
  { label: 'Normal', start: 18.5, end: 25, color: '#38D39F' },
  { label: 'Overweight', start: 25, end: 30, color: '#F6C667' },
  { label: 'Obesity', start: 30, end: RANGE_MAX, color: '#FF8D6B' },
];

type BmiRangeBarProps = {
  value: number | null;
  category: BmiCategory;
};

export default function BmiRangeBar({ value, category }: BmiRangeBarProps) {
  const theme = bmiCategoryTheme(category);
  const markerRatio =
    typeof value === 'number'
      ? Math.max(0, Math.min((value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN), 1))
      : null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.barShell}>
        <View style={styles.segmentRow}>
          {SEGMENTS.map((segment) => (
            <View
              key={segment.label}
              style={[
                styles.segment,
                {
                  flex: segment.end - segment.start,
                  backgroundColor: segment.color,
                },
              ]}
            />
          ))}
        </View>

        {markerRatio !== null ? (
          <View style={[styles.markerWrap, { left: `${markerRatio * 100}%` }]}>
            <View style={[styles.markerPin, { borderColor: theme.accent }]} />
            <Text style={[styles.markerValue, { color: theme.accent }]}>{formatBmiValue(value)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.labelRow}>
        {SEGMENTS.map((segment) => (
          <Text key={segment.label} style={styles.labelText}>
            {segment.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.section,
  },
  barShell: {
    position: 'relative',
    paddingTop: 34,
    marginBottom: SPACING.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    height: 18,
    backgroundColor: COLORS.cardInner,
  },
  segment: {
    height: '100%',
  },
  markerWrap: {
    position: 'absolute',
    top: 0,
    marginLeft: -18,
    alignItems: 'center',
    width: 36,
  },
  markerPin: {
    width: 16,
    height: 16,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    borderWidth: 4,
    marginBottom: 4,
  },
  markerValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  labelText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
});
