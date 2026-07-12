import React from 'react';
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
import { ScoreBadge } from '../components/ScoreBadge';
import { ProgressBar } from '../components/ProgressBar';
import { Mascot } from '../components/Mascot';
import { COUNTRIES } from '../data/countries';
import { useStore } from '../store/useStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

export function PlansScreen() {
  const nav = useNavigation<Nav>();
  const { plans } = useStore();

  type PlanEntry = {
    plan: (typeof plans)[0];
    country: (typeof COUNTRIES)[0];
    pct: number;
    done: number;
    total: number;
    critPending: ReturnType<(typeof COUNTRIES)[0]['phases'][0]['tasks']['find']>[];
    nextTask: ReturnType<(typeof COUNTRIES)[0]['phases'][0]['tasks']['find']>;
    dateLabel: string;
  };

  const plansWithData: PlanEntry[] = plans.reduce<PlanEntry[]>((acc, plan) => {
    const country = COUNTRIES.find((c) => c.id === plan.countryId);
    if (!country) return acc;
    const allTasks = country.phases.flatMap((ph) => ph.tasks);
    const total = allTasks.length;
    const done = allTasks.filter((t) => (plan.taskStatuses[t.id] ?? 'todo') === 'done').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const critPending = allTasks.filter(
      (t) => t.critical && (plan.taskStatuses[t.id] ?? 'todo') !== 'done',
    );
    const nextTask = allTasks.find((t) => (plan.taskStatuses[t.id] ?? 'todo') !== 'done');
    const dateLabel =
      plan.targetMonth !== null && plan.targetYear !== null
        ? `Départ prévu : ${MONTHS_SHORT[plan.targetMonth!]}. ${plan.targetYear}`
        : 'Plan exploratoire';
    acc.push({ plan, country, pct, done, total, critPending, nextTask, dateLabel });
    return acc;
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <PasoLogo size="md" />
          <View style={styles.titleRow}>
            <Text style={styles.title}>Mes plans</Text>
            <Text style={styles.count}>
              {plans.length} plan{plans.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {plansWithData.length === 0 ? (
            <View style={styles.emptyCard}>
              <Mascot posture="explore" size={96} />
              <Text style={styles.emptyTitle}>Aucun plan pour l'instant</Text>
              <Text style={styles.emptyDesc}>
                Ouvre une fiche pays sur la carte pour créer ton premier plan d'action.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => nav.navigate('Main' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Explorer la carte</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.plansList}>
              {plansWithData.map(({ plan, country, pct, done, total, critPending, nextTask, dateLabel }) => (
                <TouchableOpacity
                  key={plan.countryId}
                  style={styles.planCard}
                  onPress={() => nav.navigate('Dashboard', { countryId: country.id })}
                  activeOpacity={0.85}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.flagCircle}>
                      <Text style={styles.flagEmoji}>{country.flag}</Text>
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>{country.name}</Text>
                      <Text style={styles.planRegion}>{country.region}</Text>
                    </View>
                    <ScoreBadge score={country.score} size="sm" />
                  </View>

                  <View style={[styles.datePill, plan.isExplorative && styles.datePillGray]}>
                    <Text style={[styles.datePillText, plan.isExplorative && styles.datePillTextGray]}>
                      {dateLabel}
                    </Text>
                  </View>

                  {critPending.length > 0 && (
                    <View style={styles.alert}>
                      <View style={styles.alertDot} />
                      <Text style={styles.alertText}>
                        {critPending.length} tâche{critPending.length > 1 ? 's' : ''} critique{critPending.length > 1 ? 's' : ''} en attente
                      </Text>
                    </View>
                  )}

                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Progression</Text>
                    <Text style={styles.progressValue}>{pct}%</Text>
                  </View>
                  <ProgressBar pct={pct} height={6} />

                  {nextTask && (
                    <>
                      <Text style={styles.nextLabel}>Prochaine étape</Text>
                      <Text style={styles.nextTask}>{nextTask.label}</Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => nav.navigate('Main' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>+ Ajouter une destination</Text>
              </TouchableOpacity>
            </View>
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
  container: { paddingHorizontal: 20, paddingTop: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 },
  title: { fontFamily: Fonts.serifMedium, fontSize: 30, lineHeight: 32, letterSpacing: -0.5, color: Colors.dark },
  count: { fontFamily: Fonts.sans, fontSize: 12.5, color: Colors.muted },
  emptyCard: {
    marginTop: 28,
    backgroundColor: Colors.card,
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  emptyTitle: { fontFamily: Fonts.serifMedium, fontSize: 22, lineHeight: 26, letterSpacing: -0.3, textAlign: 'center', marginTop: 16, color: Colors.dark },
  emptyDesc: { fontFamily: Fonts.sans, fontSize: 13.5, color: '#6F6A60', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  exploreBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 28,
    marginTop: 18,
  },
  exploreBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.bg },
  plansList: { marginTop: 20, gap: 12 },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  flagCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: { fontSize: 26 },
  planInfo: { flex: 1, minWidth: 0 },
  planName: { fontFamily: Fonts.serifMedium, fontSize: 21, lineHeight: 23, color: Colors.dark },
  planRegion: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 2 },
  datePill: {
    alignSelf: 'flex-start',
    marginTop: 13,
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  datePillGray: { backgroundColor: Colors.border },
  datePillText: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: '#fff' },
  datePillTextGray: { color: Colors.muted },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 9,
    backgroundColor: Colors.redLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  alertDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.red, flexShrink: 0 },
  alertText: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.redText },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  progressLabel: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  progressValue: { fontFamily: Fonts.sansBold, fontSize: 12, color: Colors.dark },
  nextLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#9a9384',
    marginTop: 12,
  },
  nextTask: { fontFamily: Fonts.sansMedium, fontSize: 13.5, color: '#3a352c', marginTop: 3 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(33,30,24,0.2)',
    borderRadius: 18,
    paddingVertical: 16,
  },
  addBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 14.5, color: '#6F6A60' },
});
