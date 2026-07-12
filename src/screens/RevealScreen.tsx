import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  BackHandler,
} from 'react-native';
import { Colors, Fonts, scoreColor } from '../theme';
import { Mascot } from '../components/Mascot';
import { COUNTRIES } from '../data/countries';
import { useStore } from '../store/useStore';

// ─── Land detection (shared algorithm, standalone copy) ──────────────────────
const LAND_BOUNDS: [number, number, number, number][] = [
  [-168, -141, 54, 71], [-141, -62, 50, 71], [-128, -104, 40, 54],
  [-124, -104, 33, 49], [-104, -90, 33, 49], [-90, -75, 30, 47],
  [-100, -82, 25, 33], [-106, -93, 16, 25], [-93, -83, 13, 18],
  [-84, -80, 8, 15], [-80, -50, -3, 11],
  [-10, 30, 44, 60], [4, 32, 57, 70], [-10, -5, 50, 59],
  [-9, 3, 36, 44], [6, 19, 37, 47], [19, 31, 35, 48],
  [-17, 10, 15, 35], [10, 33, 17, 33], [-17, 15, 4, 18],
  [15, 42, 2, 18], [9, 33, -12, 4], [43, 50, -26, -12], [34, 60, 13, 38],
  [28, 90, 48, 72], [90, 170, 50, 72], [55, 90, 38, 50],
  [88, 122, 30, 50], [100, 123, 22, 40], [70, 88, 20, 30],
  [92, 105, 9, 30], [105, 110, 10, 23], [124, 132, 33, 43], [129, 143, 31, 45],
  [95, 141, -10, 6], [119, 127, 6, 19], [140, 151, -11, -1],
  [113, 154, -39, -11], [166, 179, -47, -34],
];
const LAND_TRIS: [[number, number], [number, number], [number, number]][] = [
  [[-81, -3], [-34, -3], [-70, -55]],
  [[68, 27], [89, 24], [78, 8]],
  [[11, -12], [33, -12], [20, -35]],
  [[-58, 59], [-18, 62], [-40, 83]],
];
function ptInTri(px: number, py: number, [ax, ay]: [number, number], [bx, by]: [number, number], [cx, cy]: [number, number]): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}
function isOnLand(lon: number, lat: number): boolean {
  for (const [l0, l1, a0, a1] of LAND_BOUNDS) {
    if (lon >= l0 && lon <= l1 && lat >= a0 && lat <= a1) return true;
  }
  for (const [a, b, c] of LAND_TRIS) {
    if (ptInTri(lon, lat, a, b, c)) return true;
  }
  return false;
}
const lonToLeft = (lon: number) => `${((lon + 180) / 360 * 100).toFixed(1)}%`;
const latToTop = (lat: number) => `${((78 - lat) / 136 * 100).toFixed(1)}%`;

type Dot = { k: string; l: string; t: string };
const CONTINENT_DOTS: Dot[] = (() => {
  const dots: Dot[] = [];
  for (let lat = 78; lat >= -56; lat -= 3) {
    for (let lon = -180; lon <= 180; lon += 3) {
      if (isOnLand(lon, lat)) {
        dots.push({ k: `${lat},${lon}`, l: lonToLeft(lon), t: latToTop(lat) });
      }
    }
  }
  return dots;
})();

const ContinentLayer = memo(() => (
  <>
    {CONTINENT_DOTS.map((d) => (
      <View key={d.k} style={[styles.continentDot, { left: d.l as any, top: d.t as any }]} />
    ))}
  </>
));

// ─── Sorted countries for reveal order (best score first) ────────────────────
const REVEAL_ORDER = [...COUNTRIES].sort((a, b) => b.score - a.score);

// Summary counts
const accessible = COUNTRIES.filter((c) => c.score >= 70).length;
const sousConditions = COUNTRIES.filter((c) => c.score >= 45 && c.score < 70).length;
const difficile = COUNTRIES.filter((c) => c.score < 45).length;

// ─── RevealScreen ─────────────────────────────────────────────────────────────
export function RevealScreen() {
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState<'analysing' | 'revealing' | 'done' | 'summary'>('analysing');

  const scaleAnims = useRef(REVEAL_ORDER.map(() => new Animated.Value(1))).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;

  // Disable hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const allRevealedMs = 600 + REVEAL_ORDER.length * 150;

    const t0 = setTimeout(() => setPhase('revealing'), 400);

    const pinTimers = REVEAL_ORDER.map((_, i) =>
      setTimeout(() => {
        setRevealedCount(i + 1);
        Animated.sequence([
          Animated.timing(scaleAnims[i], { toValue: 1.55, duration: 130, useNativeDriver: true }),
          Animated.timing(scaleAnims[i], { toValue: 1.0, duration: 160, useNativeDriver: true }),
        ]).start();
      }, 600 + i * 150)
    );

    const t1 = setTimeout(() => {
      setPhase('done');
      Animated.timing(summaryOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, allRevealedMs + 200);

    const t2 = setTimeout(() => setPhase('summary'), allRevealedMs + 700);

    // Auto-navigate after full display
    const t3 = setTimeout(() => completeOnboarding(), allRevealedMs + 1700);

    return () => {
      [t0, t1, t2, t3, ...pinTimers].forEach(clearTimeout);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Mascot posture="explore" size={52} />
        <View style={styles.headerText}>
          {phase === 'analysing' || phase === 'revealing' ? (
            <Text style={styles.analysing}>Analyse de ton profil…</Text>
          ) : (
            <Text style={styles.doneTitle}>
              {COUNTRIES.length} destinations{'\n'}analysées pour toi
            </Text>
          )}
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <ContinentLayer />
        {REVEAL_ORDER.map((country, i) => {
          const isRevealed = i < revealedCount;
          const color = isRevealed ? scoreColor(country.score) : '#c5bfb2';
          return (
            <Animated.View
              key={country.id}
              style={[
                styles.pinWrap,
                { left: lonToLeft(country.lon) as any, top: latToTop(country.lat) as any },
                { transform: [{ scale: scaleAnims[i] }] },
              ]}
              pointerEvents="none"
            >
              <View style={[styles.pin, { backgroundColor: color, borderColor: isRevealed ? 'rgba(255,255,255,0.7)' : 'transparent' }]} />
            </Animated.View>
          );
        })}
      </View>

      {/* Summary + CTA */}
      <Animated.View style={[styles.footer, { opacity: summaryOpacity }]}>
        {(phase === 'done' || phase === 'summary') && (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <View style={[styles.summaryDot, { backgroundColor: Colors.green }]} />
                <Text style={styles.summaryText}>{accessible} accessible{accessible > 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.summaryChip}>
                <View style={[styles.summaryDot, { backgroundColor: Colors.accent }]} />
                <Text style={styles.summaryText}>{sousConditions} sous conditions</Text>
              </View>
              <View style={styles.summaryChip}>
                <View style={[styles.summaryDot, { backgroundColor: Colors.red }]} />
                <Text style={styles.summaryText}>{difficile} difficile{difficile > 1 ? 's' : ''}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={completeOnboarding}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnText}>Voir mes destinations →</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerText: { flex: 1 },
  analysing: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.muted,
    fontStyle: 'italic',
  },
  doneTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    lineHeight: 26,
    color: Colors.dark,
    letterSpacing: -0.3,
  },
  mapContainer: {
    flex: 1,
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
    backgroundColor: 'rgba(155, 145, 125, 0.5)',
  },
  pinWrap: {
    position: 'absolute',
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  pin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.dark,
  },
  ctaBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8,
  },
  ctaBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    color: Colors.bg,
  },
});
