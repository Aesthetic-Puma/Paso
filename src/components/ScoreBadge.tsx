import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts, scoreColor, scoreBg } from '../theme';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: Props) {
  const color = scoreColor(score);
  const bg = scoreBg(score);
  const numSize = size === 'lg' ? 32 : size === 'md' ? 24 : 18;
  const subSize = size === 'lg' ? 11 : size === 'md' ? 9 : 8;
  const pad = size === 'lg' ? { paddingVertical: 10, paddingHorizontal: 14 } : size === 'md' ? { paddingVertical: 7, paddingHorizontal: 10 } : { paddingVertical: 5, paddingHorizontal: 8 };

  return (
    <View style={[styles.badge, pad, { backgroundColor: bg }]}>
      <Text style={[styles.num, { fontSize: numSize, color }]}>{score}</Text>
      <Text style={[styles.sub, { fontSize: subSize, color }]}>/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    fontFamily: Fonts.serifMedium,
    lineHeight: undefined,
  },
  sub: {
    fontFamily: Fonts.sansBold,
    opacity: 0.85,
    letterSpacing: 0.3,
    marginTop: 1,
  },
});
