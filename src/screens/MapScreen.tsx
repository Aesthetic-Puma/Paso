import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  LayoutChangeEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { RootStackParamList } from '../navigation/types';
import { Colors, Fonts, scoreColor } from '../theme';
import { PasoLogo } from '../components/PasoLogo';
import { VerifiedTag } from '../components/VerifiedTag';
import { getGlobalDateRange } from '../data/verifiedDates';
import { COUNTRIES, Country } from '../data/countries';
import { useStore } from '../store/useStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── GeoJSON world data ───────────────────────────────────────────────────────
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

// ─── ISO 3166-1 numeric → our country id ─────────────────────────────────────
const ISO_TO_ID: Record<string, string> = {
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
// ViewBox "0 0 360 180": lon+180 = x,  90-lat = y
const VB_W = 360;
const VB_H = 180;

function lonLatToXY(lon: number, lat: number): [number, number] {
  return [lon + 180, 90 - lat];
}

function ringToPath(ring: number[][]): string {
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = lonLatToXY(ring[i][0], ring[i][1]);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
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

// ─── Pre-compute at module load ───────────────────────────────────────────────
type ComputedFeature = { id: string; countryId: string | null; d: string };
const WORLD_FEATURES: ComputedFeature[] = worldData.features
  .filter((f) => f.id !== '010') // skip Antarctica
  .map((f) => ({
    id: f.id,
    countryId: ISO_TO_ID[f.id] ?? null,
    d: geoToPath(f.geometry),
  }));

// ─── Label helpers ────────────────────────────────────────────────────────────
const incomeToString = (v: string) => {
  if (v === '< 1 500 €') return '1 200 €/mois';
  if (v === '1 500 – 2 500 €') return '2 000 €/mois';
  if (v === '2 500 – 4 000 €') return '3 250 €/mois';
  return '4 500 €/mois';
};
const scoreLabel = (score: number) =>
  score >= 70 ? 'Accessible' : score >= 45 ? 'Sous conditions' : 'Difficile';

// ─── MapScreen ────────────────────────────────────────────────────────────────
export function MapScreen() {
  const nav = useNavigation<Nav>();
  const { profile } = useStore();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selected, setSelected] = useState<Country>(COUNTRIES[0]);

  // Container layout (needed for tap→SVG coordinate conversion)
  const containerLayout = useRef({ width: 0, height: 0 });
  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    containerLayout.current = { width, height };
  }, []);

  // ─── Pan / zoom shared values ───────────────────────────────────────────────
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  // ─── Gestures ───────────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(4, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .minDistance(8)
    .averageTouches(true)
    .onUpdate((e) => {
      offsetX.value = savedOffsetX.value + e.translationX;
      offsetY.value = savedOffsetY.value + e.translationY;
    })
    .onEnd(() => {
      // Clamp pan so map can't leave viewport
      const { width: cw, height: ch } = containerLayout.current;
      const maxX = (cw * (scale.value - 1)) / 2;
      const maxY = (ch * (scale.value - 1)) / 2;
      offsetX.value = withSpring(
        Math.max(-maxX, Math.min(maxX, offsetX.value)),
        { damping: 20 }
      );
      offsetY.value = withSpring(
        Math.max(-maxY, Math.min(maxY, offsetY.value)),
        { damping: 20 }
      );
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  // Double-tap resets zoom/pan
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDeltaX(10)
    .maxDeltaY(10)
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 15 });
      savedScale.value = 1;
      offsetX.value = withSpring(0, { damping: 15 });
      offsetY.value = withSpring(0, { damping: 15 });
      savedOffsetX.value = 0;
      savedOffsetY.value = 0;
    });

  // Single tap → find closest country in SVG space
  const setSelectedOnJS = useCallback((c: Country) => setSelected(c), []);

  const tapGesture = Gesture.Tap()
    .maxDeltaX(8)
    .maxDeltaY(8)
    .runOnJS(true)
    .onEnd((e) => {
      const { width: cw, height: ch } = containerLayout.current;
      if (!cw || !ch) return;
      // Undo pan and scale to get local SVG pixel position
      const localX = (e.x - offsetX.value) / scale.value;
      const localY = (e.y - offsetY.value) / scale.value;
      // SVG fills container exactly (container aspectRatio = VB_W/VB_H)
      const svgX = (localX / cw) * VB_W;
      const svgY = (localY / ch) * VB_H;
      const lon = svgX - 180;
      const lat = 90 - svgY;
      // Find closest analyzed country
      let minDist = Infinity;
      let closest: Country | null = null;
      for (const c of COUNTRIES) {
        const dx = c.lon - lon;
        const dy = c.lat - lat;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closest = c;
        }
      }
      if (closest && minDist < 20) setSelectedOnJS(closest);
    });

  const composed = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTapGesture, Gesture.Race(tapGesture, panGesture))
  );

  // ─── Bottom panel sub-criteria ───────────────────────────────────────────────
  const SUB_CRITERIA = [
    { label: 'Visa', score: selected.scoreVisa },
    { label: 'Budget', score: selected.scoreBudget },
    { label: 'Langue', score: selected.scoreLangue },
    { label: 'Emploi', score: selected.scoreEmploi },
  ];

  const isNonIncome = profile.incomeAssured.startsWith('Non');
  const profileSub = [
    profile.domain,
    profile.nationality,
    isNonIncome
      ? (profile.savings ? `Épargne ${profile.savings}` : null)
      : (profile.monthlyIncome ? incomeToString(profile.monthlyIncome) : null),
  ]
    .filter(Boolean)
    .join(' · ');

  const sorted = [...COUNTRIES].sort((a, b) => b.score - a.score);

  const SegControl = () => (
    <View style={styles.segControl}>
      <TouchableOpacity
        style={[styles.seg, view === 'map' && styles.segActive]}
        onPress={() => setView('map')}
      >
        <Text style={[styles.segText, view === 'map' && styles.segTextActive]}>Carte</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.seg, view === 'list' && styles.segActive]}
        onPress={() => setView('list')}
      >
        <Text style={[styles.segText, view === 'list' && styles.segTextActive]}>Liste</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── List view ───────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <PasoLogo size="sm" />
            <Text style={styles.pageTitle}>Pour toi</Text>
            <Text style={styles.pageSub} numberOfLines={2}>
              Classées par faisabilité · {profileSub}
            </Text>
          </View>
          <SegControl />
        </View>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.listContainer}>
            {sorted.map((country) => {
              const color = scoreColor(country.score);
              return (
                <TouchableOpacity
                  key={country.id}
                  style={styles.listRow}
                  onPress={() => nav.navigate('Country', { countryId: country.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.listDot, { backgroundColor: color }]} />
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{country.name}</Text>
                    <Text style={styles.listTagline} numberOfLines={2}>
                      {country.tagline}
                    </Text>
                  </View>
                  <View style={styles.listRight}>
                    <Text style={[styles.listScore, { color }]}>
                      {country.score}
                      <Text style={styles.listScoreSub}>/100</Text>
                    </Text>
                    <Text style={styles.listBudget}>{country.budgetLabel}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Map view ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <View>
          <PasoLogo size="sm" />
          <Text style={styles.pageTitle}>Tes destinations</Text>
          <Text style={styles.pageSub}>{profileSub}</Text>
        </View>
        <SegControl />
      </View>

      {/* Map container — aspect ratio 2:1 matches VB_W/VB_H = 360/180 */}
      <View style={styles.mapWrapper}>
        <GestureDetector gesture={composed}>
          <Animated.View
            style={[styles.mapContainer, animatedStyle]}
            onLayout={onContainerLayout}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="none"
            >
              {/* Country shapes */}
              {WORLD_FEATURES.map(({ id, countryId, d }) => {
                const country = countryId
                  ? COUNTRIES.find((c) => c.id === countryId)
                  : null;
                const fill = country ? scoreColor(country.score) : '#E2D9CC';
                const stroke = country ? scoreColor(country.score) : '#C8BEB0';
                return (
                  <Path
                    key={id}
                    d={d}
                    fill={fill}
                    fillOpacity={country ? 0.35 : 1}
                    stroke={stroke}
                    strokeWidth={country ? 0.5 : 0.3}
                  />
                );
              })}

              {/* Country markers */}
              {COUNTRIES.map((country) => {
                const [cx, cy] = lonLatToXY(country.lon, country.lat);
                const isSelected = selected?.id === country.id;
                const color = scoreColor(country.score);
                return (
                  <G key={country.id}>
                    {/* Transparent hit area (≈ 20 SVG units ≈ 20px visual at 1×) */}
                    <Circle cx={cx} cy={cy} r={10} fill="transparent" />
                    {/* Visual marker */}
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5 : 3.5}
                      fill={color}
                      stroke="#fff"
                      strokeWidth={isSelected ? 1.2 : 0.8}
                    />
                    {/* Label under marker (always visible for selected, always visible in smaller text) */}
                    <SvgText
                      x={cx}
                      y={cy + (isSelected ? 9 : 7)}
                      textAnchor="middle"
                      fontSize={isSelected ? 5.5 : 4}
                      fontFamily={Fonts.sansSemiBold}
                      fill={Colors.dark}
                      fillOpacity={isSelected ? 1 : 0.7}
                    >
                      {country.name}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          </Animated.View>
        </GestureDetector>

        {/* Legend — bottom-left overlay */}
        <View style={styles.legend} pointerEvents="none">
          {[
            { label: 'Accessible', color: Colors.green },
            { label: 'Sous conditions', color: Colors.accent },
            { label: 'Difficile', color: Colors.red },
          ].map(({ label, color }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Double-tap hint */}
        <View style={styles.zoomHintWrap} pointerEvents="none">
          <Text style={styles.zoomHint}>Pince pour zoomer · Double-tap pour réinitialiser</Text>
        </View>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.panelTop}>
          <View style={styles.panelLeft}>
            <View style={styles.panelScoreRow}>
              <Text style={styles.panelScore}>{selected.score}</Text>
              <Text style={styles.panelScoreSub}>/100</Text>
            </View>
            <Text style={styles.panelName}>{selected.name}</Text>
            <View style={styles.panelStatusRow}>
              <View style={[styles.panelDot, { backgroundColor: scoreColor(selected.score) }]} />
              <Text style={styles.panelStatus}>
                {scoreLabel(selected.score)} · {selected.region}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.ficheBtn}
            onPress={() => nav.navigate('Country', { countryId: selected.id })}
            activeOpacity={0.85}
          >
            <Text style={styles.ficheBtnText}>Fiche ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.criteriaGrid}>
          {SUB_CRITERIA.map((cr) => (
            <View key={cr.label} style={styles.criteriaCell}>
              <View style={styles.criteriaLabelRow}>
                <Text style={styles.criteriaLabel}>{cr.label}</Text>
                <Text style={[styles.criteriaScore, { color: scoreColor(cr.score) }]}>
                  {cr.score}
                </Text>
              </View>
              <View style={styles.criteriaTrack}>
                <View
                  style={[
                    styles.criteriaFill,
                    {
                      width: `${cr.score}%` as unknown as number,
                      backgroundColor: scoreColor(cr.score),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <VerifiedTag
          verifiedAt={getGlobalDateRange().oldest}
          source="Paso · 11 destinations"
          style={{ marginTop: 6 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  pageTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: Colors.dark,
    marginTop: 4,
  },
  pageSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.muted,
    marginTop: 3,
    maxWidth: 220,
    lineHeight: 17,
  },
  segControl: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 999,
    padding: 3,
    marginTop: 4,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  seg: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 },
  segActive: { backgroundColor: Colors.dark },
  segText: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.muted },
  segTextActive: { color: Colors.bg },

  // Map area
  mapWrapper: {
    marginHorizontal: 12,
    aspectRatio: VB_W / VB_H,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: Colors.bg,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Legend overlaid bottom-left inside mapWrapper
  legend: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(243,239,231,0.88)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontFamily: Fonts.sans, fontSize: 9.5, color: Colors.muted },

  zoomHintWrap: {
    position: 'absolute',
    bottom: 8,
    right: 10,
  },
  zoomHint: {
    fontFamily: Fonts.sans,
    fontSize: 8.5,
    color: Colors.mutedLight,
  },

  // Bottom panel
  bottomPanel: {
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 14,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  panelTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  panelLeft: { flex: 1 },
  panelScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  panelScore: {
    fontFamily: Fonts.serifMedium,
    fontSize: 34,
    lineHeight: 36,
    color: Colors.dark,
  },
  panelScoreSub: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  panelName: {
    fontFamily: Fonts.serifMedium,
    fontSize: 20,
    lineHeight: 22,
    color: Colors.dark,
    marginTop: 2,
  },
  panelStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  panelDot: { width: 7, height: 7, borderRadius: 3.5 },
  panelStatus: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  ficheBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  ficheBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 13.5, color: Colors.bg },
  criteriaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  criteriaCell: { width: '47%' },
  criteriaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  criteriaLabel: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.dark },
  criteriaScore: { fontFamily: Fonts.sansBold, fontSize: 12 },
  criteriaTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  criteriaFill: { height: 3, borderRadius: 2 },

  // List view
  scroll: { flex: 1 },
  listContainer: { paddingHorizontal: 16, paddingTop: 4, gap: 2 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  listDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, flexShrink: 0 },
  listInfo: { flex: 1, minWidth: 0 },
  listName: { fontFamily: Fonts.sansBold, fontSize: 16, color: Colors.dark, lineHeight: 20 },
  listTagline: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    marginTop: 3,
    lineHeight: 18,
  },
  listRight: { alignItems: 'flex-end', gap: 3 },
  listScore: { fontFamily: Fonts.sansBold, fontSize: 16 },
  listScoreSub: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted },
  listBudget: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
});
