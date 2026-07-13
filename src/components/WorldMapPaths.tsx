/**
 * Shared GeoJSON-to-SVG world map layer.
 * Must be used inside a <Svg viewBox="0 0 360 180"> element.
 */
import React from 'react';
import { Path } from 'react-native-svg';
import { COUNTRIES } from '../data/countries';
import { scoreColor } from '../theme';

// ─── GeoJSON ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-require-imports
const worldData = require('../data/world-110m.json') as {
  features: Array<{
    id: string;
    properties: { name?: string };
    geometry:
      | { type: 'Polygon'; coordinates: number[][][] }
      | { type: 'MultiPolygon'; coordinates: number[][][][] };
  }>;
};

// ─── ISO 3166-1 numeric → country id ─────────────────────────────────────────
export const ISO_TO_ID: Record<string, string> = {
  '036': 'au',
  '124': 'ca',
  '620': 'pt',
  '554': 'nz',
  '276': 'de',
  '392': 'jp',
  '410': 'kr',
  '784': 'ae',
  '702': 'sg',
  '076': 'br',
  '840': 'us',
};

// ─── Equirectangular projection ───────────────────────────────────────────────
export const VB_W = 360;
export const VB_H = 180;

export function lonLatToXY(lon: number, lat: number): [number, number] {
  return [lon + 180, 90 - lat];
}

function ringToPath(ring: number[][]): string {
  let d = '';
  let prevLon: number | null = null;
  let open = false;
  for (const [lon, lat] of ring) {
    const [x, y] = lonLatToXY(lon, lat);
    const jump = prevLon !== null && Math.abs(lon - prevLon) > 180;
    if (!open || jump) {
      if (open) d += 'Z';
      d += `M${x.toFixed(2)},${y.toFixed(2)}`;
      open = true;
    } else {
      d += `L${x.toFixed(2)},${y.toFixed(2)}`;
    }
    prevLon = lon;
  }
  return d + 'Z';
}

function geoToPath(geom: typeof worldData.features[0]['geometry']): string {
  if (geom.type === 'Polygon') {
    return (geom.coordinates as number[][][]).map(ringToPath).join('');
  }
  return (geom.coordinates as number[][][][])
    .flatMap((poly) => poly.map(ringToPath))
    .join('');
}

// ─── Pre-computed world features ─────────────────────────────────────────────
export type WorldFeature = { id: string; countryId: string | null; d: string };

export const WORLD_FEATURES: WorldFeature[] = worldData.features
  .filter((f) => f.id !== '010') // skip Antarctica
  .map((f) => ({
    id: f.id,
    countryId: ISO_TO_ID[f.id] ?? null,
    d: geoToPath(f.geometry),
  }));

// ─── WorldMapPaths ────────────────────────────────────────────────────────────
// revealedSet: set of country IDs to render with their score color;
// all others render as neutral fill.
type Props = {
  revealedSet: ReadonlySet<string>;
};

export function WorldMapPaths({ revealedSet }: Props) {
  return (
    <>
      {WORLD_FEATURES.map(({ id, countryId, d }) => {
        const country = countryId ? COUNTRIES.find((c) => c.id === countryId) : null;
        const revealed = !!(countryId && revealedSet.has(countryId) && country);
        return (
          <Path
            key={id}
            d={d}
            fill={revealed ? scoreColor(country!.score) : '#E2D9CC'}
            fillOpacity={revealed ? 0.35 : 1}
            stroke={revealed ? scoreColor(country!.score) : '#C8BEB0'}
            strokeWidth={revealed ? 0.5 : 0.3}
            fillRule="evenodd"
          />
        );
      })}
    </>
  );
}
