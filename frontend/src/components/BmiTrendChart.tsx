import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../styles/theme';
import type { BmiMeasurement } from '../types/health';
import { measurementShortLabel } from '../utils/bmi';

const CHART_HEIGHT = 120;

type BmiTrendChartProps = {
  data: BmiMeasurement[];
  accentColor?: string;
};

export default function BmiTrendChart({
  data,
  accentColor = COLORS.accent,
}: BmiTrendChartProps) {
  const [width, setWidth] = useState(0);

  const points = useMemo(() => {
    if (width <= 0 || data.length === 0) {
      return [];
    }

    const values = data.map((entry) => entry.bmi ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(max - min, 0.6);

    return data.map((entry, index) => {
      const x = data.length === 1 ? width / 2 : (width / (data.length - 1)) * index;
      const y = CHART_HEIGHT - (((entry.bmi ?? min) - min) / span) * CHART_HEIGHT;

      return {
        ...entry,
        x,
        y,
      };
    });
  }, [data, width]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>BMI trend</Text>
        <Text style={styles.meta}>{data.length} measurements</Text>
      </View>

      <View style={styles.chartArea} onLayout={handleLayout}>
        {points.slice(1).map((point, index) => {
          const previous = points[index];
          const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
          const angle = Math.atan2(point.y - previous.y, point.x - previous.x);

          return (
            <View
              key={`${point.id}-segment`}
              style={[
                styles.segment,
                {
                  width: distance,
                  left: (point.x + previous.x) / 2 - distance / 2,
                  top: (point.y + previous.y) / 2 - 1,
                  backgroundColor: accentColor,
                  transform: [{ rotateZ: `${angle}rad` }],
                },
              ]}
            />
          );
        })}

        {points.map((point) => (
          <View
            key={point.id}
            style={[
              styles.dot,
              {
                left: point.x - 6,
                top: point.y - 6,
                borderColor: accentColor,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.labelRow}>
        {data.map((entry) => (
          <View key={`${entry.id}-label`} style={styles.labelCell}>
            <Text style={styles.label}>{measurementShortLabel(entry)}</Text>
            <Text style={styles.value}>{entry.bmi?.toFixed(1) ?? '--'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.card,
    marginBottom: SPACING.section,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  chartArea: {
    height: CHART_HEIGHT + 12,
    marginBottom: SPACING.md,
    justifyContent: 'center',
  },
  segment: {
    position: 'absolute',
    height: 2,
    borderRadius: RADIUS.pill,
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    borderWidth: 3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  labelCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  value: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
