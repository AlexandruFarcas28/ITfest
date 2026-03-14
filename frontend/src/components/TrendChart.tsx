import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../styles/theme';

const CHART_HEIGHT = 116;

export type TrendDatum = {
  label: string;
  value: number;
};

type TrendChartProps = {
  title: string;
  subtitle: string;
  data: TrendDatum[];
  accentColor?: string;
  target?: number;
  targetLabel?: string;
  note?: string;
  chartHeight?: number;
  scaleMode?: 'zero' | 'fit';
  valueFormatter?: (value: number) => string;
};

function defaultValueFormatter(value: number) {
  return `${Math.round(value)}`;
}

export default function TrendChart({
  title,
  subtitle,
  data,
  accentColor = COLORS.accent,
  target,
  targetLabel,
  note,
  chartHeight = CHART_HEIGHT,
  scaleMode = 'zero',
  valueFormatter = defaultValueFormatter,
}: TrendChartProps) {
  const safeData = useMemo(
    () => (data.length > 0 ? data : [{ label: '-', value: 0 }]),
    [data]
  );
  const firstValue = safeData[0].value || 0;
  const latestValue = safeData[safeData.length - 1].value || 0;
  const rawMinValue = Math.min(...safeData.map((item) => item.value), target ?? Number.POSITIVE_INFINITY);
  const rawMaxValue = Math.max(...safeData.map((item) => item.value), target ?? 0);
  const displayMin = useMemo(() => {
    if (scaleMode === 'fit') {
      const span = Math.max(rawMaxValue - rawMinValue, 1);
      return Math.max(0, rawMinValue - span * 0.18);
    }

    return 0;
  }, [rawMaxValue, rawMinValue, scaleMode]);
  const displayMax = useMemo(() => {
    if (scaleMode === 'fit') {
      const span = Math.max(rawMaxValue - rawMinValue, 1);
      return rawMaxValue + span * 0.18;
    }

    return Math.max(1, rawMaxValue);
  }, [rawMaxValue, rawMinValue, scaleMode]);
  const visibleRange = Math.max(displayMax - displayMin, 1);

  const percentageDelta =
    firstValue !== 0
      ? Math.round(((latestValue - firstValue) / Math.abs(firstValue)) * 100)
      : 0;

  const targetOffset =
    typeof target === 'number'
      ? Math.max(((target - displayMin) / visibleRange) * chartHeight, 0)
      : null;
  const seriesKey = safeData.map((point) => `${point.label}:${point.value}`).join('|');
  const animatedBars = useRef<Animated.Value[]>([]);

  if (animatedBars.current.length !== safeData.length) {
    animatedBars.current = safeData.map(
      (_, index) => animatedBars.current[index] ?? new Animated.Value(8)
    );
  }

  useEffect(() => {
    animatedBars.current.forEach((bar) => bar.setValue(8));

    Animated.stagger(
      45,
      safeData.map((point, index) =>
        Animated.timing(animatedBars.current[index], {
          toValue: Math.max(((point.value - displayMin) / visibleRange) * chartHeight, 8),
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      )
    ).start();
  }, [chartHeight, displayMin, seriesKey, safeData, visibleRange]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={[styles.deltaBadge, percentageDelta >= 0 ? styles.deltaUp : styles.deltaDown]}>
          <Text style={[styles.deltaText, percentageDelta >= 0 ? styles.deltaTextUp : styles.deltaTextDown]}>
            {percentageDelta >= 0 ? '+' : ''}
            {percentageDelta}%
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Latest</Text>
        <Text style={styles.summaryValue}>{valueFormatter(latestValue)}</Text>
      </View>

      <View style={[styles.chartShell, { height: chartHeight + 26 }]}>
        {targetOffset !== null ? (
          <View style={[styles.targetLine, { bottom: targetOffset }]}>
            <View style={styles.targetDot} />
          </View>
        ) : null}

        <View style={styles.barRow}>
          {safeData.map((point, index) => {
            return (
              <View key={`${point.label}-${point.value}`} style={styles.barColumn}>
                <View style={[styles.barTrack, { height: chartHeight }]}>
                  <Animated.View
                    style={[
                      styles.barFill,
                      {
                        height: animatedBars.current[index],
                        backgroundColor: accentColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{point.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {target ? (
        <Text style={styles.footerText}>
          {targetLabel || 'Target'}: {valueFormatter(target)}
        </Text>
      ) : null}

      {note ? <Text style={styles.note}>{note}</Text> : null}
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
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT.section,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.subtitle,
    fontSize: FONT.bodySm,
    lineHeight: 20,
  },
  deltaBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
  },
  deltaUp: {
    backgroundColor: COLORS.accentSoft,
  },
  deltaDown: {
    backgroundColor: 'rgba(199, 66, 8, 0.16)',
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '800',
  },
  deltaTextUp: {
    color: COLORS.accent,
  },
  deltaTextDown: {
    color: COLORS.danger,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  chartShell: {
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 243, 232, 0.22)',
  },
  targetDot: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 7,
    height: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.text,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.sm + 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    backgroundColor: COLORS.cardInner,
    borderRadius: RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: SPACING.sm,
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
    minHeight: 8,
  },
  barLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  footerText: {
    color: COLORS.subtitle,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  note: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
