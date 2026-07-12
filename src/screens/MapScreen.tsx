import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors, Fonts, scoreColor } from '../theme';
import { PasoLogo } from '../components/PasoLogo';
import { Mascot } from '../components/Mascot';
import { COUNTRIES, Country } from '../data/countries';
import { useStore } from '../store/useStore';
import { VerifiedTag } from '../components/VerifiedTag';
import { getGlobalDateRange } from '../data/verifiedDates';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Land detection ──────────────────────────────────────────────────────────
// Each entry: [lonMin, lonMax, latMin, latMax]
const LAND_BOUNDS: [number, number, number, number][] = [
  [-168, -141, 54, 71], [-141, -62, 50, 71], [-128, -104, 40, 54],
  [-124, -104, 33, 49], [-104, -90, 33, 49], [-90, -75, 30, 47],
  [-100, -82, 25, 33], [-106, -93, 16, 25], [-93, -83, 13, 18],
  [-84, -80, 8, 15], [-80, -50, -3, 11],
  [-10, 30, 44, 60], [4, 32, 57, 70], [-10, -5, 50, 59],
  [-9, 3, 36, 44], [6, 19, 37, 47], [19, 31, 35, 48],
  [-17, 10, 15, 35], [10, 33, 17, 33], [-17, 15, 4, 18],
  [15, 42, 2, 18], [9, 33, -12, 4], [43, 50, -26, -12],
  [34, 60, 13, 38],
  [28, 90, 48, 72], [90, 170, 50, 72], [55, 90, 38, 50],
  [88, 122, 30, 50], [100, 123, 22, 40], [70, 88, 20, 30],
  [92, 105, 9, 30], [105, 110, 10, 23], [124, 132, 33, 43],
  [129, 143, 31, 45],
  [95, 141, -10, 6], [119, 127, 6, 19], [140, 151, -11, -1],
  [113, 154, -39, -11], [166, 179, -47, -34],
];

// Each entry: [[lon1,lat1],[lon2,lat2],[lon3,lat3]]
const LAND_TRIS: [[number, number], [number, number], [number, number]][] = [
  [[-81, -3], [-34, -3], [-70, -55]],
  [[68, 27], [89, 24], [78, 8]],
  [[11, -12], [33, -12], [20, -35]],
  [[-58, 59], [-18, 62], [-40, 83]],
];

function ptInTri(
  px: number, py: number,
  [ax, ay]: [number, number],
  [bx, by]: [number, number],
  [cx, cy]: [number, number],
): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function isOnLand(lon: number, lat: number): boolean {
  for (const [lonMin, lonMax, latMin, latMax] of LAND_BOUNDS) {
    if (lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax) return true;
  }
  for (const [a, b, c] of LAND_TRIS) {
    if (ptInTri(lon, lat, a, b, c)) return true;
  }
  return false;
}

// Position formulas
const lonToLeft = (lon: number) => `${((lon + 180) / 360 * 100).toFixed(1)}%`;
const latToTop = (lat: number) => `${((78 - lat) / 136 * 100).toFixed(1)}%`;

// Pre-compute continent dots at module level (runs once)
const STEP = 3;
type Dot = { k: string; l: string; t: string };
const CONTINENT_DOTS: Dot[] = (() => {
  const dots: Dot[] = [];
  for (let lat = 78; lat >= -56; lat -= STEP) {
    for (let lon = -180; lon <= 180; lon += STEP) {
      if (isOnLand(lon, lat)) {
        dots.push({ k: `${lat},${lon}`, l: lonToLeft(lon), t: latToTop(lat) });
      }
    }
  }
  return dots;
})();

// ─── Memoized continent dots layer ───────────────────────────────────────────
const ContinentLayer = memo(() => (
  <>
    {CONTINENT_DOTS.map((d) => (
      <View
        key={d.k}
        style={[styles.continentDot, { left: d.l as any, top: d.t as any }]}
      />
    ))}
  </>
));

// ─── MapScreen ────────────────────────────────────────────────────────────────
const incomeToString = (v: string) => {
  if (v === '< 1 500 €') return '1 200 €/mois';
  if (v === '1 500 – 2 500 €') return '2 000 €/mois';
  if (v === '2 500 – 4 000 €') return '3 250 €/mois';
  return '4 500 €/mois';
};

const scoreLabel = (score: number) =>
  score >= 70 ? 'Accessible' : score >= 45 ? 'Sous conditions' : 'Difficile';

export function MapScreen() {
  const nav = useNavigation<Nav>();
  const { profile } = useStore();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selected, setSelected] = useState<Country>(COUNTRIES[0]);

  const sorted = [...COUNTRIES].sort((a, b) => b.score - a.score);

  const isNonIncome = profile.incomeAssured.startsWith('Non');
  const profileSub = [
    profile.domain,
    profile.nationality,
    isNonIncome
      ? (profile.savings ? `Épargne ${profile.savings}` : null)
      : (profile.monthlyIncome ? incomeToString(profile.monthlyIncome) : null),
  ].filter(Boolean).join(' · ');

  const SUB_CRITERIA = [
    { label: 'Visa', score: selected.scoreVisa },
    { label: 'Budget', score: selected.scoreBudget },
    { label: 'Langue', score: selected.scoreLangue },
    { label: 'Emploi', score: selected.scoreEmploi },
  ];

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

  if (view === 'map') {
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

        {/* Map with continent dots + country pins */}
        <View style={styles.mapContainer}>
          <ContinentLayer />
          {COUNTRIES.map((c) => {
            const isSelected = selected?.id === c.id;
            const color = scoreColor(c.score);
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.pinWrap,
                  { left: lonToLeft(c.lon) as any, top: latToTop(c.lat) as any },
                ]}
                onPress={() => setSelected(c)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[styles.mapDot, { backgroundColor: color }, isSelected && styles.mapDotSelected]} />
                {isSelected && <Text style={[styles.dotLabel, { color }]}>{c.name}</Text>}
              </TouchableOpacity>
            );
          })}
          {/* Mascot in bottom-left of map */}
          <View style={styles.mapMascot} pointerEvents="none">
            <Mascot posture="explore" size={52} transparent />
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
                <Text style={styles.panelStatus}>{scoreLabel(selected.score)} · {selected.region}</Text>
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
                  <Text style={[styles.criteriaScore, { color: scoreColor(cr.score) }]}>{cr.score}</Text>
                </View>
                <View style={styles.criteriaTrack}>
                  <View style={[styles.criteriaFill, { width: `${cr.score}%` as any, backgroundColor: scoreColor(cr.score) }]} />
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

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
            <Text style={styles.legendText}>Accessible</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendText}>Sous conditions</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.red }]} />
            <Text style={styles.legendText}>Difficile</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Liste view ─────────────────────────────────────────────────────────────
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
                  <Text style={styles.listTagline} numberOfLines={2}>{country.tagline}</Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  pageTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: Colors.dark,
    marginTop: 4,
  },
  pageSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
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
  mapContainer: {
    alignSelf: 'stretch',
    aspectRatio: 360 / 152,
    marginHorizontal: 12,
    backgroundColor: '#ede9e1',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  continentDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(155, 145, 125, 0.55)',
  },
  pinWrap: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  mapDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  mapDotSelected: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  dotLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    marginTop: 2,
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mapMascot: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
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
  panelTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  panelLeft: { flex: 1 },
  panelScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  panelScore: { fontFamily: Fonts.serifMedium, fontSize: 34, lineHeight: 36, color: Colors.dark },
  panelScoreSub: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  panelName: { fontFamily: Fonts.serifMedium, fontSize: 20, lineHeight: 22, color: Colors.dark, marginTop: 2 },
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
  criteriaLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  criteriaLabel: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.dark },
  criteriaScore: { fontFamily: Fonts.sansBold, fontSize: 12 },
  criteriaTrack: { height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  criteriaFill: { height: 3, borderRadius: 2 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },
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
  listTagline: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginTop: 3, lineHeight: 18 },
  listRight: { alignItems: 'flex-end', gap: 3 },
  listScore: { fontFamily: Fonts.sansBold, fontSize: 16 },
  listScoreSub: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  listBudget: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
});
