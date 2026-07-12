import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, scoreColor } from '../theme';

interface Props {
  pct: number;
  height?: number;
  color?: string;
}

export function ProgressBar({ pct, height = 7, color }: Props) {
  const barColor = color ?? scoreColor(pct);
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(100, Math.max(0, pct))}%`,
            backgroundColor: barColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#e2dccf',
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
