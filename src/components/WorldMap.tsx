/**
 * Full SVG world map (country shapes only).
 * Used by RevealScreen; MapScreen composes WorldMapPaths directly.
 */
import React from 'react';
import Svg from 'react-native-svg';
import { WorldMapPaths, VB_W, VB_H } from './WorldMapPaths';

type Props = {
  revealedSet: ReadonlySet<string>;
};

export function WorldMap({ revealedSet }: Props) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
    >
      <WorldMapPaths revealedSet={revealedSet} />
    </Svg>
  );
}
