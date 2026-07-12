import React from 'react';
import { Image } from 'react-native';

export type MascotPosture = 'salut' | 'explore' | 'progress' | 'flag' | 'hero';

interface Props {
  posture?: MascotPosture;
  size?: number;
  transparent?: boolean;
}

const SOURCES: Record<MascotPosture, { normal: number; t: number }> = {
  salut:    { normal: require('../../assets/mascotte/salut.png'),    t: require('../../assets/mascotte/salut_t.png') },
  explore:  { normal: require('../../assets/mascotte/explore.png'),  t: require('../../assets/mascotte/explore_t.png') },
  progress: { normal: require('../../assets/mascotte/progress.png'), t: require('../../assets/mascotte/progress_t.png') },
  flag:     { normal: require('../../assets/mascotte/flag.png'),     t: require('../../assets/mascotte/flag_t.png') },
  hero:     { normal: require('../../assets/mascotte/flag.png'),     t: require('../../assets/mascotte/flag_t.png') },
};

export function Mascot({ posture = 'salut', size = 120, transparent = false }: Props) {
  const src = SOURCES[posture];
  return (
    <Image
      source={transparent ? src.t : src.normal}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
