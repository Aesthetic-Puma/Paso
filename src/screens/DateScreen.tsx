import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors, Fonts } from '../theme';
import { Mascot } from '../components/Mascot';
import { COUNTRIES } from '../data/countries';
import { useStore } from '../store/useStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'DatePicker'>;

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const NOW = new Date();
const MIN_YEAR = NOW.getFullYear();
const MAX_YEAR = MIN_YEAR + 4;

export function DateScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { countryId } = route.params;
  const createPlan = useStore((s) => s.createPlan);

  const country = COUNTRIES.find((c) => c.id === countryId);
  const [knownDate, setKnownDate] = useState(true);
  const [month, setMonth] = useState(NOW.getMonth());
  const [year, setYear] = useState(MIN_YEAR + 1);

  const monthPrev = () => setMonth((m) => (m === 0 ? 11 : m - 1));
  const monthNext = () => setMonth((m) => (m === 11 ? 0 : m + 1));
  const yearPrev = () => setYear((y) => Math.max(MIN_YEAR, y - 1));
  const yearNext = () => setYear((y) => Math.min(MAX_YEAR, y + 1));

  const summary = knownDate
    ? `Départ prévu : ${MONTHS[month]} ${year}`
    : 'Plan exploratoire sans date fixe';

  const createAndGo = () => {
    createPlan({
      countryId,
      targetMonth: knownDate ? month : null,
      targetYear: knownDate ? year : null,
      isExplorative: !knownDate,
      taskStatuses: {},
    });
    nav.navigate('Dashboard', { countryId });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backText}>‹ {country?.name}</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>Plan d'action · {country?.name}</Text>
        <Text style={styles.title}>Quand envisages-tu de partir ?</Text>
        <Text style={styles.subtitle}>
          On cale ta timeline et tes échéances sur cette date. Tu pourras l'ajuster à tout moment.
        </Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, knownDate && styles.tabActive]}
            onPress={() => setKnownDate(true)}
          >
            <Text style={[styles.tabText, knownDate && styles.tabTextActive]}>J'ai une date</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !knownDate && styles.tabActive]}
            onPress={() => setKnownDate(false)}
          >
            <Text style={[styles.tabText, !knownDate && styles.tabTextActive]}>Pas encore</Text>
          </TouchableOpacity>
        </View>

        {knownDate ? (
          <View style={styles.pickerCard}>
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>MOIS</Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity style={styles.pickerBtn} onPress={monthPrev}>
                  <Text style={styles.pickerBtnText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.pickerValue}>{MONTHS[month]}</Text>
                <TouchableOpacity style={styles.pickerBtn} onPress={monthNext}>
                  <Text style={styles.pickerBtnText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.pickerSection, { marginTop: 12 }]}>
              <Text style={styles.pickerLabel}>ANNÉE</Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity style={styles.pickerBtn} onPress={yearPrev}>
                  <Text style={styles.pickerBtnText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.pickerValue}>{year}</Text>
                <TouchableOpacity style={styles.pickerBtn} onPress={yearNext}>
                  <Text style={styles.pickerBtnText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.explorCard}>
            <Mascot posture="explore" size={64} />
            <View style={styles.explorText}>
              <Text style={styles.explorTitle}>Plan exploratoire</Text>
              <Text style={styles.explorDesc}>
                Ta timeline restera en J-12 / J-6 / J-3 / J-1, sans dates fixes ni alerte
                d'urgence. Tu avances à ton rythme.
              </Text>
            </View>
          </View>
        )}

        <View style={{ flex: 1 }} />
        <Text style={styles.summary}>{summary}</Text>
        <TouchableOpacity style={styles.createBtn} onPress={createAndGo} activeOpacity={0.85}>
          <Text style={styles.createBtnText}>Créer mon plan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  backBtn: { padding: 4, alignSelf: 'flex-start', marginBottom: 8 },
  backText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: '#6F6A60' },
  eyebrow: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#a89a45',
    marginTop: 24,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.4,
    marginTop: 10,
    color: Colors.dark,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#6F6A60',
    marginTop: 10,
    lineHeight: 21,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 14,
    padding: 4,
    marginTop: 26,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.dark },
  tabText: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.muted },
  tabTextActive: { color: Colors.bg },
  pickerCard: {
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 22,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pickerLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#9a9384',
    marginBottom: 8,
  },
  pickerSection: {},
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg,
    borderRadius: 13,
    padding: 8,
  },
  pickerBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerBtnText: { fontSize: 20, color: Colors.dark },
  pickerValue: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.dark,
  },
  explorCard: {
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  explorText: { flex: 1 },
  explorTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.dark },
  explorDesc: { fontFamily: Fonts.sans, fontSize: 13, color: '#6F6A60', marginTop: 4, lineHeight: 20 },
  summary: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, textAlign: 'center', marginBottom: 14 },
  createBtn: {
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
  createBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 16.5, color: Colors.bg },
});
