import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors, Fonts, scoreColor } from '../theme';
import { PasoLogo } from '../components/PasoLogo';
import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';
import { TaskCard } from '../components/TaskCard';
import { COUNTRIES } from '../data/countries';
import { useStore } from '../store/useStore';
import { VerifiedTag } from '../components/VerifiedTag';
import { VERIFIED_DATES } from '../data/verifiedDates';
import { useFeedbackStore } from '../store/useFeedbackStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Dashboard'>;

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

const addMonths = (year: number, month: number, delta: number) => {
  const d = new Date(year, month + delta);
  return `${MONTHS_SHORT[d.getMonth()]}. ${d.getFullYear()}`;
};

export function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { countryId } = route.params;
  const { plans, advanceTask } = useStore();
  const submitFeedback = useFeedbackStore((s) => s.submitFeedback);
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null);
  const [feedbackShown, setFeedbackShown] = useState<Set<string>>(new Set());
  const [feedbackChosen, setFeedbackChosen] = useState<string | null>(null);

  const country = COUNTRIES.find((c) => c.id === countryId);
  const plan = plans.find((p) => p.countryId === countryId);

  if (!country || !plan) return null;

  const allTasks = country.phases.flatMap((ph) => ph.tasks);
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => (plan.taskStatuses[t.id] ?? 'todo') === 'done').length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const criticalPending = allTasks.filter(
    (t) => t.critical && (plan.taskStatuses[t.id] ?? 'todo') !== 'done',
  );

  const dateLabel =
    plan.targetMonth !== null && plan.targetYear !== null
      ? `Départ visé · ${MONTHS_SHORT[plan.targetMonth!]}. ${plan.targetYear}`
      : 'Plan exploratoire';

  const moodText =
    progressPct === 0
      ? 'Bon départ, une étape après l\'autre.'
      : progressPct < 30
      ? 'Bien démarré ! Continue sur cette lancée.'
      : progressPct < 70
      ? 'Bien avancé, tu es dans le rythme.'
      : 'Presque terminé — tu gères parfaitement !';

  const moodPosture = progressPct < 40 ? 'explore' : progressPct < 80 ? 'progress' : 'flag';

  const handleAdvance = (taskId: string) => {
    const currentStatus = plan.taskStatuses[taskId] ?? 'todo';
    advanceTask(countryId, taskId);
    if (currentStatus === 'in_progress' && !feedbackShown.has(taskId)) {
      setFeedbackShown((prev) => new Set(prev).add(taskId));
      setFeedbackTaskId(taskId);
      setFeedbackChosen(null);
    }
  };

  const closeFeedback = () => setFeedbackTaskId(null);

  const phaseDate = (monthsBefore: number) => {
    if (plan.targetMonth === null || plan.targetYear === null) return null;
    return addMonths(plan.targetYear, plan.targetMonth, -monthsBefore);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.backText}>‹ {country.name}</Text>
          </TouchableOpacity>
          <PasoLogo size="sm" />
        </View>
        <View style={styles.headerMain}>
          <View>
            <Text style={styles.planLabel}>Ton plan d'action</Text>
            <Text style={styles.countryName}>{country.name}</Text>
          </View>
          <Text style={styles.progressNum}>
            {progressPct}<Text style={styles.progressNumSub}>%</Text>
          </Text>
        </View>
        <ProgressBar pct={progressPct} height={7} />
        <View style={styles.progressMeta}>
          <Text style={styles.progressText}>
            {doneTasks} tâche{doneTasks !== 1 ? 's' : ''} sur {totalTasks} réalisée{doneTasks !== 1 ? 's' : ''}
          </Text>
          <View style={[styles.datePill, plan.isExplorative && styles.datePillGray]}>
            <Text style={[styles.datePillText, plan.isExplorative && styles.datePillTextGray]}>
              {dateLabel}
            </Text>
          </View>
        </View>
        {criticalPending.length > 0 && (
          <View style={styles.alert}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>
              {criticalPending.length} délai{criticalPending.length > 1 ? 's' : ''} critique{criticalPending.length > 1 ? 's' : ''} à sécuriser en priorité
            </Text>
          </View>
        )}
        <View style={styles.moodRow}>
          <Mascot posture={moodPosture as any} size={36} />
          <Text style={styles.moodText}>{moodText}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {country.phases.map((phase, phIdx) => {
          const pDate = phaseDate(phase.monthsBefore);
          return (
            <View key={phase.id} style={styles.phase}>
              <View style={styles.phaseNode}>
                <View style={[styles.node, { borderColor: scoreColor(progressPct) }]} />
                {phIdx < country.phases.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.phaseBody}>
                <Text style={styles.phaseDate}>{pDate ?? phase.sub}</Text>
                <Text style={styles.phaseSub}>
                  {phase.title}
                  {pDate ? ` · ${phase.sub}` : ''}
                </Text>
                <View style={styles.tasks}>
                  {phase.tasks.map((task) => (
                    <View key={task.id}>
                      <TaskCard
                        task={{ ...task, status: plan.taskStatuses[task.id] ?? task.status }}
                        onAdvance={() => handleAdvance(task.id)}
                      />
                      {task.link && (
                        <VerifiedTag
                          verifiedAt={VERIFIED_DATES[countryId]?.visa ?? '2026-01-01'}
                          source="source officielle"
                          style={{ paddingLeft: 14, marginTop: -2, marginBottom: 2 }}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Task duration feedback prompt */}
      <Modal
        visible={feedbackTaskId !== null}
        transparent
        animationType="slide"
        onRequestClose={closeFeedback}
      >
        <TouchableOpacity style={styles.fbOverlay} activeOpacity={1} onPress={closeFeedback}>
          <View style={styles.fbSheet}>
            {feedbackChosen === null ? (
              <>
                <Text style={styles.fbTitle}>Cette étape t'a pris combien de temps ?</Text>
                <Text style={styles.fbSub}>Ta réponse aide la communauté à mieux planifier.</Text>
                <View style={styles.fbOptions}>
                  {['Moins que prévu', 'Comme prévu', 'Plus que prévu'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.fbOptionBtn}
                      onPress={() => {
                        setFeedbackChosen(opt);
                        submitFeedback({ countryId, taskId: feedbackTaskId!, type: 'duration', value: opt });
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.fbOptionText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={closeFeedback} style={styles.fbDismiss}>
                  <Text style={styles.fbDismissText}>Ignorer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Mascot posture="flag" size={72} />
                <Text style={styles.fbThanks}>Merci !</Text>
                <Text style={styles.fbThanksBody}>Ton retour est enregistré.</Text>
                <TouchableOpacity style={styles.fbCloseBtn} onPress={closeFeedback} activeOpacity={0.8}>
                  <Text style={styles.fbCloseBtnText}>Continuer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  headerWrap: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  backText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: '#6F6A60' },
  headerMain: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  planLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#a89a45',
  },
  countryName: { fontFamily: Fonts.serifMedium, fontSize: 30, lineHeight: 32, marginTop: 5, color: Colors.dark },
  progressNum: { fontFamily: Fonts.serifMedium, fontSize: 38, lineHeight: 40, color: Colors.dark },
  progressNumSub: { fontSize: 18 },
  progressMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  progressText: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  datePill: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  datePillGray: { backgroundColor: Colors.border },
  datePillText: { fontFamily: Fonts.sansSemiBold, fontSize: 11.5, color: '#fff' },
  datePillTextGray: { color: Colors.muted },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 12,
    backgroundColor: Colors.redLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red, flexShrink: 0 },
  alertText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.redText, flex: 1 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  moodText: { fontFamily: Fonts.sansSemiBold, fontSize: 13.5, color: '#4f4a40', flex: 1 },
  scroll: { flex: 1 },
  phase: { flexDirection: 'row', paddingLeft: 22, paddingBottom: 8 },
  phaseNode: { width: 24, alignItems: 'center', paddingTop: 20 },
  node: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: Colors.bg,
    flexShrink: 0,
  },
  line: { width: 1.5, flex: 1, backgroundColor: Colors.border, marginTop: 4 },
  phaseBody: { flex: 1, paddingTop: 14, paddingRight: 22 },
  phaseDate: { fontFamily: Fonts.sansBold, fontSize: 16, letterSpacing: -0.2, color: Colors.dark },
  phaseSub: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: '#a89a45', marginTop: 2 },
  tasks: { marginTop: 12, gap: 9, marginBottom: 6 },
  fbOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33,30,24,0.4)',
    justifyContent: 'flex-end',
  },
  fbSheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  fbTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 20,
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 6,
  },
  fbSub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  fbOptions: { width: '100%', gap: 10, marginBottom: 14 },
  fbOptionBtn: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fbOptionText: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.dark },
  fbDismiss: { paddingVertical: 8 },
  fbDismissText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.muted },
  fbThanks: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.dark,
    marginTop: 12,
    marginBottom: 6,
  },
  fbThanksBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 20,
    textAlign: 'center',
  },
  fbCloseBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  fbCloseBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.bg },
});
