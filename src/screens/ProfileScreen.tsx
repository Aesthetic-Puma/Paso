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
import { Mascot } from '../components/Mascot';
import { COUNTRIES } from '../data/countries';
import { useStore } from '../store/useStore';
import { useFeedbackStore } from '../store/useFeedbackStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const { profile, favorites, toggleFavorite, resetOnboarding } = useStore();
  const entries = useFeedbackStore((s) => s.entries);

  const favCountries = favorites
    .map((id) => COUNTRIES.find((c) => c.id === id))
    .filter(Boolean) as typeof COUNTRIES;

  const isNonIncome = profile.incomeAssured.startsWith('Non');

  const incomeChip = (v: string) => {
    if (v === '< 1 500 €') return 'Revenu ≈ 1 200 €/mois';
    if (v === '1 500 – 2 500 €') return 'Revenu ≈ 2 000 €/mois';
    if (v === '2 500 – 4 000 €') return 'Revenu ≈ 3 000 €/mois';
    return 'Revenu > 4 000 €/mois';
  };

  const savingsChip = (v: string) => {
    if (v === '< 1 000 €') return 'Épargne ≈ 700 €';
    if (v === '1 000 – 3 000 €') return 'Épargne ≈ 2 000 €';
    if (v === '3 000 – 6 000 €') return 'Épargne ≈ 4 500 €';
    return 'Épargne > 6 000 €';
  };

  const chips = [
    profile.domain,
    profile.status,
    profile.nationality,
    profile.objective,
    profile.duration,
    isNonIncome
      ? (profile.savings ? savingsChip(profile.savings) : null)
      : (profile.monthlyIncome ? incomeChip(profile.monthlyIncome) : null),
    profile.englishLevel ? `Anglais ${profile.englishLevel.toLowerCase()}` : null,
  ].filter(Boolean) as string[];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <PasoLogo size="md" />

          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Mascot posture="salut" size={58} />
            </View>
            <View>
              <Text style={styles.name}>{profile.name || 'Camille'}</Text>
              <Text style={styles.subtitle}>Ingénieure · Française · 26 ans</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, styles.sectionLabelAmber]}>Ton profil</Text>
          <View style={styles.chipsWrap}>
            {chips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={resetOnboarding}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>Modifier mes réponses</Text>
            <Text style={styles.editBtnArrow}>›</Text>
          </TouchableOpacity>

          {favCountries.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, styles.sectionLabelAmber, { marginTop: 26 }]}>Tes favoris</Text>
              <View style={styles.favsCard}>
                {favCountries.map((c, i) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.favRow, i > 0 && styles.favBorder]}
                    onPress={() => nav.navigate('Country', { countryId: c.id })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.favCodeBadge}>
                      <Text style={styles.favCode}>{c.code}</Text>
                    </View>
                    <View style={styles.favInfo}>
                      <Text style={styles.favName}>{c.name}</Text>
                    </View>
                    <View style={[styles.favDot, { backgroundColor: scoreColor(c.score) }]} />
                    <Text style={styles.favArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Mes contributions */}
          <Text style={[styles.sectionLabel, { color: '#9a9384', marginTop: 26 }]}>Mes contributions</Text>
          <View style={styles.contribCard}>
            {entries.length === 0 ? (
              <Text style={styles.contribEmpty}>
                Aucune contribution pour l'instant. Tu peux signaler des erreurs depuis les fiches pays.
              </Text>
            ) : (
              <Text style={styles.contribCount}>
                {entries.length} contribution{entries.length > 1 ? 's' : ''} envoyée{entries.length > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          <View style={{ height: 24 }} />

          {/* Footer */}
          <View style={styles.versionFooter}>
            <Text style={styles.versionText}>Paso v0.2 · Données vérifiées régulièrement</Text>
          </View>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20 },
  avatarCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: { fontFamily: Fonts.serifMedium, fontSize: 28, lineHeight: 30, color: Colors.dark },
  subtitle: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginTop: 2 },
  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: '#9a9384',
    marginTop: 26,
    marginBottom: 11,
  },
  sectionLabelAmber: { color: '#a89a45' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(33,30,24,0.08)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  chipText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.dark },
  editBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(33,30,24,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  editBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 14.5, color: Colors.dark },
  editBtnArrow: { fontSize: 20, color: '#c3bcab' },
  favsCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  favRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  favBorder: { borderTopWidth: 1, borderTopColor: Colors.separator },
  favCodeBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  favCode: { fontFamily: Fonts.sansBold, fontSize: 13, color: Colors.dark },
  favInfo: { flex: 1, minWidth: 0 },
  favName: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.dark },
  favDot: { width: 9, height: 9, borderRadius: 4.5 },
  favArrow: { fontSize: 18, color: Colors.muted, marginLeft: 4 },
  accountCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  accountBorder: { borderTopWidth: 1, borderTopColor: Colors.separator },
  accountLabel: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.dark },
  accountValue: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  proPill: { backgroundColor: Colors.border, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  proPillText: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.muted },
  logoutBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(33,30,24,0.1)',
  },
  logoutText: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.muted },
  contribCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  contribEmpty: { fontFamily: Fonts.sans, fontSize: 13.5, color: Colors.muted, lineHeight: 20 },
  contribCount: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.dark },
  versionFooter: { alignItems: 'center', paddingVertical: 8 },
  versionText: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.mutedLight },
});
