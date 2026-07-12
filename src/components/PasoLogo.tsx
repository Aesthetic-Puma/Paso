import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

export function PasoLogo({ size = 'md' }: Props) {
  const barH = size === 'lg' ? 20 : size === 'md' ? 15 : 11;
  const barW = size === 'lg' ? 4.5 : size === 'md' ? 3.5 : 2.5;
  const fontSize = size === 'lg' ? 26 : size === 'md' ? 19 : 14;
  const gap = size === 'lg' ? 9 : size === 'md' ? 7 : 5;

  return (
    <View style={[styles.row, { gap }]}>
      <View style={[styles.bars, { gap: size === 'lg' ? 3 : 2 }]}>
        <View style={[styles.bar, { width: barW, height: barH, backgroundColor: Colors.dark }]} />
        <View style={[styles.bar, { width: barW, height: barH, backgroundColor: Colors.accent }]} />
        <View style={[styles.bar, { width: barW, height: barH, backgroundColor: Colors.dark }]} />
      </View>
      <Text style={[styles.text, { fontSize }]}>Paso</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    borderRadius: 1.5,
  },
  text: {
    fontFamily: Fonts.serifMedium,
    color: Colors.dark,
    letterSpacing: -0.3,
  },
});
