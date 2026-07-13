import React, { useEffect } from 'react';
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
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { useStore } from '../store/useStore';
import { COUNTRIES } from '../data/countries';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { profile, plans, favorites, activePlanCountryId, hasSeenHome, markHomeSeen } = useStore();

  useEffect(() => {
    if (!hasSeenHome) markHomeSeen();
  }, []);

  const activePlan = plans.find((p) => p.countryId === activePlanCountryId) ?? plans[0];
  const activeCountry = activePlan ? COUNTRIES.find((c) => c.id === activePlan.countryId) : null;

  const totalTasks = activeCountry
    ? activeCountry.phases.flatMap((ph) => ph.tasks).length
    : 0;
  const doneTasks = activePlan
    ? Object.values(activePlan.taskStatuses).filter((s) => s === 'done').length
    : 0;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const nextTasks = activeCountry
    ? activeCountry.phases
        .flatMap((ph) => ph.tasks)
        .filter((t) => (activePlan?.taskStatuses[t.id] ?? 'todo') !== 'done')
        .slice(0, 3)
    : [];

  const favCountries = favorites.map((id) => COUNTRIES.find((c) => c.id === id)).filter(Boolean) as typeof COUNTRIES;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <PasoLogo size="md" />

          <View style={styles.greetRow}>
            <Mascot posture="salut" size={80} />
            <View style={styles.greetText}>
              <Text style={styles.greetSub}>{hasSeenHome ? 'Bon retour' : 'Bienvenue'}{profile.name ? ',' : ' !'}</Text>
              {profile.name ? <Text style={styles.greetName}>{profile.name}</Text> : null}
            </View>
          </View>

          {activeCountry && activePlan ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionLabel}>Plan actif</Text>
                {plans.length > 1 && (
                  <View style={styles.countPill}>
                    <Text style={styles.countPillText}>{plans.length} plans</Text>
                  </View>
                )}
              </View>

              <View style={styles.countryRow}>
                <View style={styles.flagCircle}>
                  <Text style={styles.flagEmoji}>{activeCountry.flag}</Text>
                </View>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{activeCountry.name}</Text>
                  <Text style={styles.countryRegion}>{activeCountry.region}</Text>
                </View>
                <ScoreBadge score={activeCountry.score} size="sm" />
              </View>

              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Progression globale</Text>
                <Text style={styles.progressPct}>{progressPct}%</Text>
              </View>
              <ProgressBar pct={progressPct} />

              {nextTasks.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: 20, marginBottom: 10 }]}>
                    Prochaines étapes
                  </Text>
                  <View style={styles.nextSteps}>
                    {nextTasks.map((t) => {
                      const status = activePlan.taskStatuses[t.id] ?? 'todo';
                      const dotColor =
                        status === 'in_progress' ? Colors.accent : Colors.mutedLight;
                      const statusLabel =
                        status === 'in_progress' ? 'En cours' : 'À faire';
                      const statusColor =
                        status === 'in_progress' ? Colors.accent : Colors.muted;
                      return (
                        <View key={t.id} style={styles.nextStep}>
                          <View style={[styles.stepDot, { backgroundColor: dotColor }]} />
                          <View style={styles.stepBody}>
                            <Text style={styles.stepLabel}>{t.label}</Text>
                            <Text style={styles.stepTime}>{t.time}</Text>
                          </View>
                          <View style={[styles.stepStatus, { backgroundColor: dotColor + '33' }]}>
                            <Text style={[styles.stepStatusText, { color: statusColor }]}>
                              {statusLabel}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.planBtn}
                onPress={() => nav.navigate('Dashboard', { countryId: activeCountry.id })}
                activeOpacity={0.85}
              >
                <Text style={styles.planBtnText}>Voir mon plan d'action complet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.card, styles.emptyCard]}>
              <Mascot posture="explore" size={120} />
              <Text style={styles.emptyTitle}>Tu n'as pas encore choisi de destination</Text>
              <Text style={styles.emptySubtitle}>
                Explore la carte et ouvre une fiche pays pour créer ton premier plan d'action.
              </Text>
              <TouchableOpacity
                style={styles.planBtn}
                onPress={() => nav.navigate('Map' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.planBtnText}>Explorer la carte</Text>
              </TouchableOpacity>
              {/* Decorative feasibility dots */}
              <View style={styles.emptyDots}>
                <View style={[styles.emptyDot, { backgroundColor: Colors.green }]} />
                <View style={[styles.emptyDot, { backgroundColor: Colors.accent }]} />
                <View style={[styles.emptyDot, { backgroundColor: Colors.red }]} />
              </View>
              <Text style={styles.emptyCount}>
                {COUNTRIES.length} destinations déjà analysées selon ton profil
              </Text>
            </View>
          )}

          <Text style={[styles.sectionLabel, { marginTop: 26, marginBottom: 11 }]}>Explorer</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => nav.navigate('Map' as any)}
            activeOpacity={0.85}
          >
            <View style={styles.miniMapGrid}>
              {['#468C5A', '#E08A3C', '#468C5A', '#C0392B', '#E08A3C', '#468C5A'].map((color, i) => (
                <View key={i} style={[styles.miniMapDot, { backgroundColor: color }]} />
              ))}
            </View>
            <View style={styles.exploreText}>
              <Text style={styles.exploreName}>Explorer la carte</Text>
              <Text style={styles.exploreCount}>11 destinations analysées pour toi</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {favCountries.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 22, marginBottom: 11 }]}>
                Tes favoris
              </Text>
              <View style={styles.favRow}>
                {favCountries.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.favChip}
                    onPress={() => nav.navigate('Country', { countryId: c.id })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.favFlag}>{c.flag}</Text>
                    <Text style={styles.favName}>{c.name}</Text>
                    <View style={[styles.favDot, { backgroundColor: scoreColor(c.score) }]} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 0 },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  greetText: {},
  greetSub: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  greetName: { fontFamily: Fonts.serifMedium, fontSize: 30, lineHeight: 34, letterSpacing: -0.5, color: Colors.dark },
  card: {
    marginTop: 22,
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 18,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#9a9384',
  },
  countPill: { backgroundColor: Colors.border, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  countPillText: { fontFamily: Fonts.sansSemiBold, fontSize: 11, color: '#6F6A60' },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 12 },
  flagCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: { fontSize: 26 },
  countryInfo: { flex: 1, minWidth: 0 },
  countryName: { fontFamily: Fonts.serifMedium, fontSize: 23, lineHeight: 24, color: Colors.dark },
  countryRegion: { fontFamily: Fonts.sans, fontSize: 12.5, color: Colors.muted, marginTop: 2 },
  progressLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  progressLabel: { fontFamily: Fonts.sans, fontSize: 12.5, color: Colors.muted },
  progressPct: { fontFamily: Fonts.sansBold, fontSize: 12.5, color: Colors.dark },
  nextSteps: { gap: 8 },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  stepDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  stepBody: { flex: 1, minWidth: 0 },
  stepLabel: { fontFamily: Fonts.sansMedium, fontSize: 14, lineHeight: 18, color: Colors.dark },
  stepTime: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted, marginTop: 1 },
  stepStatus: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  stepStatusText: { fontFamily: Fonts.sansSemiBold, fontSize: 11 },
  planBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  planBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.bg },
  emptyTitle: { fontFamily: Fonts.serifMedium, fontSize: 22, lineHeight: 26, letterSpacing: -0.3, textAlign: 'center', marginTop: 8, color: Colors.dark },
  emptySubtitle: { fontFamily: Fonts.sans, fontSize: 13.5, color: '#6F6A60', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyDots: { flexDirection: 'row', gap: 6, marginTop: 18 },
  emptyDot: { width: 8, height: 8, borderRadius: 4 },
  emptyCount: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 6, textAlign: 'center' },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 15,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  miniMapGrid: {
    width: 58,
    height: 58,
    borderRadius: 13,
    backgroundColor: Colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 10,
  },
  miniMapDot: { width: 10, height: 10, borderRadius: 5 },
  exploreText: { flex: 1 },
  exploreName: { fontFamily: Fonts.sansSemiBold, fontSize: 15.5, color: Colors.dark },
  exploreCount: { fontFamily: Fonts.sans, fontSize: 12.5, color: Colors.muted, marginTop: 1 },
  arrow: { fontSize: 20, color: '#c3bcab' },
  favRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  favChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  favFlag: { fontSize: 18 },
  favName: { fontFamily: Fonts.sansSemiBold, fontSize: 14.5, color: Colors.dark },
  favDot: { width: 7, height: 7, borderRadius: 3.5 },
});
