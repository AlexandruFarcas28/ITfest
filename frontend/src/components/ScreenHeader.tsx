import React from 'react';
import { Text, View } from 'react-native';
import { commonStyles } from '../styles/common';

type ScreenHeaderProps = {
  kicker: string;
  title: string;
  subtitle: string;
  compact?: boolean;
};

export default function ScreenHeader({
  kicker,
  title,
  subtitle,
  compact = false,
}: ScreenHeaderProps) {
  return (
    <View style={compact ? commonStyles.pageHeaderCompact : commonStyles.pageHeader}>
      <Text style={commonStyles.kicker}>{kicker}</Text>
      <Text style={commonStyles.title}>{title}</Text>
      <Text style={commonStyles.subtitle}>{subtitle}</Text>
    </View>
  );
}
