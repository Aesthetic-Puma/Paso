import React, { useEffect, useRef, useState } from 'react';
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
import { WorldMap } from '../components/WorldMap';
import { COUNTRIES } from '../data/countries';
import { useStore } from '../store/useStore';

// ─── Reveal order: best score first ──────────────────────────────────────────
const REVEAL_ORDER = [...COUNTRIES].sort((a, b) => b.score - a.score);

// Summary counts
const accessible = COUNTRIES.filter((c) => c.score >= 70).length;
const sousConditions = COUNTRIES.filter((c) => c.score >= 45 && c.score < 70).length;
const difficile = COUNTRIES.filter((c) => c.score < 45).length;

// Pin position helpers — must match the SVG projection (lon+180)/360, (90-lat)/180
const lonToLeft = (lon: number) => `${(((lon + 180) / 360) * 100).toFixed(2)}%`;
const latToTop = (lat: number) => `${(((90 - lat) / 180) * 100).toFixed(2)}%`;

// ─── RevealScreen ─────────────────────────────────────────────────────────────
export function RevealScreen() {
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const setPendingInitialTab = useStore((s) => s.setPendingInitialTab);

  const handleCta = () => {
    setPendingInitialTab('Carte');
    completeOnboarding();
  };

  const [revealedIds, setRevealedIds] = useState<ReadonlySet<string>>(new Set());
  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState<'analysing' | 'revealing' | 'done' | 'summary'>('analysing');

  const scaleAnims = useRef(REVEAL_ORDER.map(() => new Animated.Value(1))).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const allRevealedMs = 600 + REVEAL_ORDER.length * 150;

    const t0 = setTimeout(() => setPhase('revealing'), 400);

    const pinTimers = REVEAL_ORDER.map((country, i) =>
      setTimeout(() => {
        setRevealedCount(i + 1);
        // Add country to revealed set for map fill
        setRevealedIds((prev) => {
          const next = new Set(prev);
          next.add(country.id);
          return next;
        });
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

    return () => {
      [t0, t1, t2, ...pinTimers].forEach(clearTimeout);
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
        {/* Country shape layer — colorizes progressively */}
        <WorldMap revealedSet={revealedIds} style={StyleSheet.absoluteFillObject} />

        {/* Animated country pins — positioned to match SVG projection */}
        {REVEAL_ORDER.map((country, i) => {
          const isRevealed = i < revealedCount;
          const color = isRevealed ? scoreColor(country.score) : '#c5bfb2';
          return (
            <Animated.View
              key={country.id}
              style={[
                styles.pinWrap,
                {
                  left: lonToLeft(country.lon) as unknown as number,
                  top: latToTop(country.lat) as unknown as number,
                  transform: [{ scale: scaleAnims[i] }],
                },
              ]}
              pointerEvents="none"
            >
              <View
                style={[
                  styles.pin,
                  {
                    backgroundColor: color,
                    borderColor: isRevealed ? 'rgba(255,255,255,0.7)' : 'transparent',
                  },
                ]}
              />
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
                <Text style={styles.summaryText}>
                  {accessible} accessible{accessible > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.summaryChip}>
                <View style={[styles.summaryDot, { backgroundColor: Colors.accent }]} />
                <Text style={styles.summaryText}>{sousConditions} sous conditions</Text>
              </View>
              <View style={styles.summaryChip}>
                <View style={[styles.summaryDot, { backgroundColor: Colors.red }]} />
                <Text style={styles.summaryText}>
                  {difficile} difficile{difficile > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.ctaBtn} onPress={handleCta} activeOpacity={0.85}>
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
  pinWrap: {
    position: 'absolute',
    marginLeft: -6,
    marginTop: -6,
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
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryText: { fontFamily: Fonts.sansMedium, fontSize: 12.5, color: Colors.dark },
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
  ctaBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 16, color: Colors.bg },
});
