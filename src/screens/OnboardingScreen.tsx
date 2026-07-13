import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors, Fonts } from '../theme';
import { PasoLogo } from '../components/PasoLogo';
import { ProgressBar } from '../components/ProgressBar';
import { Mascot } from '../components/Mascot';
import { useStore, UserProfile } from '../store/useStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

interface Question {
  id: keyof Omit<UserProfile, 'name'>;
  section: string;
  text: string;
  options: { label: string; value: string }[];
}

const Q_STATUS: Question = {
  id: 'status',
  section: 'TON PROFIL',
  text: "Où en es-tu aujourd'hui ?",
  options: [
    { label: 'Étudiant·e', value: 'Étudiant·e' },
    { label: 'Jeune actif·ve', value: 'Jeune actif·ve' },
    { label: 'En transition', value: 'En transition' },
  ],
};

const Q_NATIONALITY: Question = {
  id: 'nationality',
  section: 'TON PROFIL',
  text: 'Quelle est ta nationalité ?',
  options: [
    { label: 'Française', value: 'Française' },
    { label: "Autre pays de l'UE", value: "Autre pays de l'UE" },
    { label: 'Hors UE', value: 'Hors UE' },
  ],
};

const Q_OBJECTIVE: Question = {
  id: 'objective',
  section: 'TON PROJET',
  text: "Qu'est-ce que tu cherches ?",
  options: [
    { label: 'Travailler', value: 'Travailler' },
    { label: 'Explorer', value: 'Explorer' },
    { label: 'Les deux', value: 'Les deux' },
  ],
};

const Q_DURATION: Question = {
  id: 'duration',
  section: 'TON PROJET',
  text: 'Pour combien de temps ?',
  options: [
    { label: '6 mois', value: '6 mois' },
    { label: '1 an', value: '1 an' },
    { label: '2 ans et plus', value: '2 ans et plus' },
    { label: 'Je ne sais pas encore', value: 'Je ne sais pas encore' },
  ],
};

const Q_INCOME_ASSURED: Question = {
  id: 'incomeAssured',
  section: 'TES MOYENS',
  text: 'As-tu déjà un revenu assuré sur place ?',
  options: [
    { label: 'Oui — emploi, mutation ou télétravail', value: 'Oui — emploi, mutation ou télétravail' },
    { label: 'Non — je chercherai sur place', value: 'Non — je chercherai sur place' },
  ],
};

const Q_MONTHLY_INCOME: Question = {
  id: 'monthlyIncome',
  section: 'TES MOYENS',
  text: 'Quel revenu mensuel net estimé sur place ?',
  options: [
    { label: '< 1 500 €', value: '< 1 500 €' },
    { label: '1 500 – 2 500 €', value: '1 500 – 2 500 €' },
    { label: '2 500 – 4 000 €', value: '2 500 – 4 000 €' },
    { label: '+ 4 000 €', value: '+ 4 000 €' },
  ],
};

const Q_SAVINGS: Question = {
  id: 'savings',
  section: 'TES MOYENS',
  text: 'Quelle épargne disponible as-tu pour ce projet ?',
  options: [
    { label: '< 1 000 €', value: '< 1 000 €' },
    { label: '1 000 – 3 000 €', value: '1 000 – 3 000 €' },
    { label: '3 000 – 6 000 €', value: '3 000 – 6 000 €' },
    { label: '+ 6 000 €', value: '+ 6 000 €' },
  ],
};

const Q_DOMAIN: Question = {
  id: 'domain',
  section: 'TES ATOUTS',
  text: 'Ton domaine professionnel ?',
  options: [
    { label: 'Ingénierie', value: 'Ingénierie' },
    { label: 'Tech & Data', value: 'Tech & Data' },
    { label: 'Santé', value: 'Santé' },
    { label: 'Design & Créa', value: 'Design & Créa' },
    { label: 'Commerce', value: 'Commerce' },
    { label: 'Hôtellerie', value: 'Hôtellerie' },
  ],
};

const Q_ENGLISH: Question = {
  id: 'englishLevel',
  section: 'TES ATOUTS',
  text: "Ton niveau d'anglais ?",
  options: [
    { label: 'Courant', value: 'Courant' },
    { label: 'Intermédiaire', value: 'Intermédiaire' },
    { label: 'Débutant', value: 'Débutant' },
  ],
};

type Answers = Partial<Record<keyof Omit<UserProfile, 'name'>, string>>;

function buildQuestions(answers: Answers): Question[] {
  const isNon = (answers.incomeAssured ?? '').startsWith('Non');
  return [Q_STATUS, Q_NATIONALITY, Q_OBJECTIVE, Q_DURATION, Q_INCOME_ASSURED, isNon ? Q_SAVINGS : Q_MONTHLY_INCOME, Q_DOMAIN, Q_ENGLISH];
}

const incomeChipLabel = (v: string): string => {
  if (v === '< 1 500 €') return 'Revenu ≈ 1 200 €/mois';
  if (v === '1 500 – 2 500 €') return 'Revenu ≈ 2 000 €/mois';
  if (v === '2 500 – 4 000 €') return 'Revenu ≈ 3 000 €/mois';
  return 'Revenu > 4 000 €/mois';
};

const savingsChipLabel = (v: string): string => {
  if (v === '< 1 000 €') return 'Épargne ≈ 700 €';
  if (v === '1 000 – 3 000 €') return 'Épargne ≈ 2 000 €';
  if (v === '3 000 – 6 000 €') return 'Épargne ≈ 4 500 €';
  return 'Épargne > 6 000 €';
};

// buildQuestions always returns 8 questions (one branch for Q6)
const TOTAL_QUESTIONS = 8;

export function OnboardingScreen({ navigation }: Props) {
  const setProfile = useStore((s) => s.setProfile);
  const profile = useStore((s) => s.profile);
  const isEditingProfile = useStore((s) => s.isEditingProfile);

  const [answers, setAnswers] = useState<Answers>(() => {
    if (!isEditingProfile) return {};
    return {
      status: profile.status || undefined,
      nationality: profile.nationality || undefined,
      objective: profile.objective || undefined,
      duration: profile.duration || undefined,
      incomeAssured: profile.incomeAssured || undefined,
      monthlyIncome: profile.monthlyIncome || undefined,
      savings: profile.savings || undefined,
      domain: profile.domain || undefined,
      englishLevel: profile.englishLevel || undefined,
    };
  });

  const [step, setStep] = useState(() => (isEditingProfile ? TOTAL_QUESTIONS : 0));
  const [showNameStep, setShowNameStep] = useState(false);
  const [nameInput, setNameInput] = useState(() => (isEditingProfile ? profile.name : ''));

  const questions = useMemo(() => buildQuestions(answers), [answers.incomeAssured]);
  const total = questions.length;
  const isRecap = step === total;
  const current = questions[step];
  const pct = isRecap || showNameStep ? 100 : ((step + 1) / total) * 100;

  const isNonIncome = (answers.incomeAssured ?? '').startsWith('Non');

  const select = (value: string) => {
    let newAnswers: Answers = { ...answers, [current.id]: value };
    // When switching incomeAssured branch, clear the other branch's answer
    if (current.id === 'incomeAssured') {
      const { monthlyIncome, savings, ...rest } = newAnswers;
      newAnswers = rest;
    }
    setAnswers(newAnswers);
    if (step < total - 1) setStep(step + 1);
    else setStep(total);
  };

  const back = () => {
    if (showNameStep) { setShowNameStep(false); return; }
    if (step > 0) setStep(step - 1);
    else navigation.goBack();
  };

  const finish = (name: string) => {
    const newProfile: UserProfile = {
      name: name.trim(),
      status: answers.status ?? 'Étudiant·e',
      nationality: answers.nationality ?? 'Française',
      objective: answers.objective ?? 'Travailler',
      duration: answers.duration ?? '1 an',
      incomeAssured: answers.incomeAssured ?? 'Oui — emploi, mutation ou télétravail',
      monthlyIncome: isNonIncome ? '' : (answers.monthlyIncome ?? '< 1 500 €'),
      savings: isNonIncome ? (answers.savings ?? '< 1 000 €') : '',
      domain: answers.domain ?? 'Ingénierie',
      englishLevel: answers.englishLevel ?? 'Intermédiaire',
    };
    setProfile(newProfile);
    navigation.replace('Reveal');
  };

  const recapChips = [
    answers.domain,
    answers.status,
    answers.nationality,
    answers.objective,
    answers.duration,
    isNonIncome
      ? (answers.savings ? savingsChipLabel(answers.savings) : undefined)
      : (answers.monthlyIncome ? incomeChipLabel(answers.monthlyIncome) : undefined),
    answers.englishLevel ? `Anglais ${answers.englishLevel.toLowerCase()}` : undefined,
  ].filter(Boolean) as string[];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <PasoLogo size="sm" />
        </View>

        <View style={styles.progressRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={back} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
          )}
          <View style={[styles.progressWrap, step === 0 && { marginLeft: 0 }]}>
            <ProgressBar pct={pct} height={5} color={Colors.dark} />
          </View>
          <Text style={styles.stepLabel}>
            {isRecap ? 'Profil complet' : `${step + 1} / ${total}`}
          </Text>
        </View>

        {showNameStep ? (
          <View style={styles.questionWrap}>
            <Text style={styles.section}>PERSONNALISATION</Text>
            <Text style={styles.question}>Comment veux-tu qu'on t'appelle ?</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Ton prénom"
              placeholderTextColor={Colors.mutedLight}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => finish(nameInput)}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 16 }]}
              onPress={() => finish(nameInput)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Continuer →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => finish('')}
              activeOpacity={0.7}
            >
              <Text style={styles.skipBtnText}>Passer</Text>
            </TouchableOpacity>
          </View>
        ) : !isRecap ? (
          <View style={styles.questionWrap}>
            <Text style={styles.section}>{current.section}</Text>
            <Text style={styles.question}>{current.text}</Text>
            <ScrollView
              style={styles.optionsScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsContent}
            >
              {current.options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.optionBtn}
                  onPress={() => select(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                  <Text style={styles.optionArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <ScrollView style={styles.recapScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.recapContent}>
              <View style={styles.recapMascot}>
                <Mascot posture="salut" size={110} />
              </View>
              <Text style={styles.section}>TON PROFIL</Text>
              <Text style={styles.recapTitle}>
                Voilà ce qui est réaliste pour toi, dans cet ordre.
              </Text>
              <View style={styles.chipsWrap}>
                {recapChips.map((chip) => (
                  <View key={chip} style={styles.chip}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {isRecap && !showNameStep && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowNameStep(true)} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Voir mes destinations</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  header: { alignItems: 'center', marginBottom: 18 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 36,
    marginBottom: 0,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  backIcon: { fontSize: 20, color: Colors.dark, lineHeight: 24, marginTop: -2 },
  progressWrap: { flex: 1 },
  stepLabel: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.muted, minWidth: 76, textAlign: 'right' },
  questionWrap: { flex: 1, paddingTop: 36 },
  section: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11.5,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: '#a89a45',
  },
  question: {
    fontFamily: Fonts.serifMedium,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.4,
    marginTop: 10,
    marginBottom: 28,
    color: Colors.dark,
  },
  optionsScroll: { flex: 1 },
  optionsContent: { gap: 11, paddingBottom: 16 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  optionText: { fontFamily: Fonts.sansMedium, fontSize: 16, color: Colors.dark, flex: 1 },
  optionArrow: { fontSize: 18, color: '#c3bcab', marginLeft: 8 },
  recapScroll: { flex: 1 },
  recapContent: { paddingTop: 14, paddingBottom: 24 },
  recapMascot: { alignItems: 'center', marginBottom: 14 },
  recapTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.4,
    marginTop: 10,
    color: Colors.dark,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 22,
  },
  chip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(33,30,24,0.08)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  chipText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.dark },
  footer: { paddingTop: 16 },
  primaryBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8,
  },
  primaryBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 16.5, color: Colors.bg },
  nameInput: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    fontFamily: Fonts.sansMedium,
    fontSize: 18,
    color: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 16 },
  skipBtnText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.muted },
});
