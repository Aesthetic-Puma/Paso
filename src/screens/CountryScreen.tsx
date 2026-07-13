import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors, Fonts, scoreColor, scoreBg } from '../theme';
import { PasoLogo } from '../components/PasoLogo';
import { ScoreBadge } from '../components/ScoreBadge';
import { Mascot } from '../components/Mascot';
import { COUNTRIES } from '../data/countries';
import { useStore } from '../store/useStore';
import { VerifiedTag } from '../components/VerifiedTag';
import { VERIFIED_DATES } from '../data/verifiedDates';
import { useFeedbackStore } from '../store/useFeedbackStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Country'>;

const incomeToNumber = (v: string): number => {
  if (v === '< 1 500 €') return 1200;
  if (v === '1 500 – 2 500 €') return 2000;
  if (v === '2 500 – 4 000 €') return 3250;
  return 4500;
};

const savingsToNumber = (v: string): number => {
  if (v === '< 1 000 €') return 700;
  if (v === '1 000 – 3 000 €') return 2000;
  if (v === '3 000 – 6 000 €') return 4500;
  return 7000;
};

type ProfessionKey = 'tech' | 'hotellerie' | 'business' | 'entrepreneur' | 'etudiant';

function getProfessionKey(domain: string, status: string): ProfessionKey {
  if (status === 'Étudiant·e') return 'etudiant';
  if (domain === 'Ingénierie' || domain === 'Tech & Data') return 'tech';
  if (domain === 'Hôtellerie') return 'hotellerie';
  if (domain === 'Commerce') return 'entrepreneur';
  return 'business';
}

const POSITIVE_WORDS = /\b(suffisant|abordable|gérable|modéré|raisonnable)\b/i;

export function CountryScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { countryId } = route.params;
  const { favorites, toggleFavorite, profile } = useStore();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [corrModalVisible, setCorrModalVisible] = useState(false);
  const [corrText, setCorrText] = useState('');
  const [corrSubmitted, setCorrSubmitted] = useState(false);
  const submitFeedback = useFeedbackStore((s) => s.submitFeedback);

  const country = COUNTRIES.find((c) => c.id === countryId);
  if (!country) return null;

  const isFav = favorites.includes(countryId);
  const score = country.score;
  const statusLabel = score >= 70 ? 'Recommandé' : score >= 45 ? 'Sous conditions' : 'Difficile';

  const isNonIncome = profile.incomeAssured.startsWith('Non');
  const countryCost = parseInt(country.budget.cost, 10);
  const professionKey = getProfessionKey(profile.domain, profile.status);

  let budgetText: string;
  let budgetTextColor: string;
  if (isNonIncome) {
    const savingsAmt = savingsToNumber(profile.savings);
    const months = Math.round(savingsAmt / countryCost);
    budgetText = `Épargne ${profile.savings} · ≈ ${months} mois d'autonomie (base ${countryCost.toLocaleString('fr-FR')} €/mois)`;
    budgetTextColor = Colors.accent;
  } else {
    const userIncome = incomeToNumber(profile.monthlyIncome);
    const leftover = userIncome - countryCost;
    if (leftover > 0) {
      budgetText = `Revenu ${userIncome.toLocaleString('fr-FR')} €/mois · il te resterait ≈ ${leftover.toLocaleString('fr-FR')} €/mois d'épargne ici.`;
      budgetTextColor = Colors.green;
    } else {
      budgetText = `Revenu ${userIncome.toLocaleString('fr-FR')} €/mois · couvre ${Math.round((userIncome / countryCost) * 100)} % des frais estimés.`;
      budgetTextColor = Colors.muted;
    }
  }

  const profileDesc = [
    profile.domain,
    profile.nationality.toLowerCase(),
    isNonIncome
      ? (profile.savings ? `épargne ${profile.savings}` : null)
      : (profile.monthlyIncome ? `revenu ${incomeToNumber(profile.monthlyIncome).toLocaleString('fr-FR')} €/mois` : null),
  ].filter(Boolean).join(' · ');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backText}>‹ Carte</Text>
        </TouchableOpacity>
        <PasoLogo size="sm" />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{country.code}</Text>
            </View>
            <View>
              <Text style={styles.countryName}>{country.name}</Text>
              <Text style={styles.countryRegion}>{country.region}</Text>
            </View>
          </View>
          <ScoreBadge score={score} size="lg" />
        </View>

        {/* Status banner */}
        <View style={[styles.recommendBanner, { backgroundColor: scoreBg(score) }]}>
          <Mascot posture="progress" size={38} />
          <View style={styles.recommendText}>
            <Text style={[styles.recommendLabel, { color: scoreColor(score) }]}>{statusLabel}</Text>
            <Text style={styles.recommendDesc} numberOfLines={2}>Pour toi · {profileDesc}</Text>
          </View>
        </View>

        {/* Score breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pourquoi ce score ?</Text>
          <View style={styles.criteriaCard}>
            {country.criteria.map((cr, i) => {
              const isGood = cr.score >= 70 || (cr.score >= 60 && POSITIVE_WORDS.test(cr.text));
              const text = cr.label === 'Emploi'
                ? (country.emploiByProfession[professionKey] ?? cr.text)
                : cr.text;
              return (
                <View
                  key={cr.label}
                  style={[styles.criteriaRow, i < country.criteria.length - 1 && styles.criteriaBorder]}
                >
                  <View style={[styles.criteriaIcon, { backgroundColor: isGood ? Colors.greenLight : '#fff3e8' }]}>
                    <Text style={[styles.criteriaIconText, { color: isGood ? Colors.green : Colors.accent }]}>
                      {isGood ? '✓' : '!'}
                    </Text>
                  </View>
                  <Text style={styles.criteriaText}>
                    <Text style={styles.criteriaCat}>{cr.label}</Text>
                    <Text style={styles.criteriaSep}> · </Text>
                    <Text style={styles.criteriaDesc}>{text}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Visa */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.infoLabel}>Visa</Text>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>via {country.visa.source}</Text>
              </View>
            </View>
            <Text style={styles.infoTitle}>{country.visa.title}</Text>
            <Text style={styles.infoMeta}>
              <Text style={styles.infoMetaLabel}>Durée — </Text>
              {country.visa.duree}
            </Text>
            <Text style={styles.infoDesc}>{country.visa.conditions}</Text>
            <VerifiedTag
              verifiedAt={VERIFIED_DATES[countryId]?.visa ?? '2026-01-01'}
              source={country.visa.source}
            />
          </View>
        </View>

        {/* Budget + Salaire */}
        <View style={styles.section}>
          <View style={styles.twoCol}>
            <View style={[styles.infoCard, styles.halfCard]}>
              <Text style={styles.infoLabel}>Budget</Text>
              <Text style={styles.bigNumber}>
                ≈ {country.budget.cost}
                <Text style={styles.bigNumberUnit}> €/mois</Text>
              </Text>
              <Text style={[styles.budgetAdaptive, { color: budgetTextColor }]}>{budgetText}</Text>
              <View style={[styles.sourceBadge, { marginTop: 10, alignSelf: 'flex-start' }]}>
                <Text style={styles.sourceText}>via {country.budget.source}</Text>
              </View>
              <VerifiedTag
                verifiedAt={VERIFIED_DATES[countryId]?.budget ?? '2026-01-01'}
                source={country.budget.source}
              />
            </View>
            <View style={[styles.infoCard, styles.halfCard]}>
              <Text style={styles.infoLabel}>Salaire moyen</Text>
              <Text style={styles.bigNumber}>{country.salaire.amount}</Text>
              <Text style={styles.salaireUnit}>{country.salaire.unit}</Text>
              <View style={[styles.sourceBadge, { marginTop: 10, alignSelf: 'flex-start' }]}>
                <Text style={styles.sourceText}>via {country.salaire.source}</Text>
              </View>
              <VerifiedTag
                verifiedAt={VERIFIED_DATES[countryId]?.salaire ?? '2026-01-01'}
                source={country.salaire.source}
              />
            </View>
          </View>
        </View>

        {/* Infos pratiques */}
        <View style={styles.section}>
          <Text style={styles.pratLabel}>Infos pratiques</Text>
          <View style={styles.pratCard}>
            {country.pratique.map((pr, i) => (
              <View key={pr.key} style={[styles.pratRow, i > 0 && styles.pratBorder]}>
                <TouchableOpacity
                  style={styles.pratHeader}
                  onPress={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pratKey}>{pr.key}</Text>
                  <Text style={styles.pratChev}>{expandedIdx === i ? '∨' : '›'}</Text>
                </TouchableOpacity>
                {expandedIdx === i && (
                  <Text style={styles.pratBody}>{pr.body}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Correction link */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.corrLink}
            onPress={() => { setCorrModalVisible(true); setCorrSubmitted(false); setCorrText(''); }}
            activeOpacity={0.7}
          >
            <Text style={styles.corrLinkText}>Une info à corriger ? Dis-le nous</Text>
          </TouchableOpacity>
        </View>

        {/* Données en direct */}
        <View style={styles.section}>
          <View style={styles.liveHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabel}>Données en direct</Text>
            <Text style={styles.liveSync}>synchronisé à l'instant</Text>
          </View>
          <View style={styles.liveCard}>
            <View style={styles.jobsHeader}>
              <Text style={styles.jobsTitle}>Offres d'emploi · {country.salaire.role}</Text>
              <Text style={styles.jobsCount}>{country.jobsCount}</Text>
            </View>
            {country.jobs.map((job, i) => (
              <View key={i} style={[styles.jobRow, i > 0 && styles.jobBorder]}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company} · {job.salary}</Text>
                </View>
                <Text style={styles.jobAgo}>il y a {job.ago}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.liveCard, { marginTop: 12 }]}>
            <Text style={styles.infoLabel}>Consulat · France Diplomatie</Text>
            <Text style={styles.consulateName}>{country.consulate.name}</Text>
            <Text style={styles.consulate}>{country.consulate.address}</Text>
            <Text style={styles.consulate}>{country.consulate.phone}</Text>
          </View>

          <View style={styles.sourcesRow}>
            {country.sources.map((s) => (
              <View key={s} style={styles.sourceChip}>
                <Text style={styles.sourceChipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Correction modal */}
      <Modal
        visible={corrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { setCorrModalVisible(false); setCorrText(''); setCorrSubmitted(false); }}
      >
        <TouchableOpacity
          style={styles.corrOverlay}
          activeOpacity={1}
          onPress={() => { if (!corrSubmitted) { setCorrModalVisible(false); setCorrText(''); } }}
        >
          <View style={styles.corrSheet}>
            {!corrSubmitted ? (
              <>
                <Text style={styles.corrTitle}>Signaler une erreur</Text>
                <Text style={styles.corrSubtitle}>{country.name} · {country.code}</Text>
                <TextInput
                  style={styles.corrInput}
                  placeholder="Décris ce qui semble incorrect…"
                  placeholderTextColor={Colors.mutedLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={corrText}
                  onChangeText={setCorrText}
                />
                <TouchableOpacity
                  style={[styles.corrSubmit, !corrText.trim() && styles.corrSubmitDisabled]}
                  onPress={() => {
                    if (!corrText.trim()) return;
                    submitFeedback({ countryId, type: 'correction', value: corrText.trim() });
                    setCorrSubmitted(true);
                  }}
                  disabled={!corrText.trim()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.corrSubmitText}>Envoyer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.corrThanksIcon}>
                  <Mascot posture="flag" size={90} />
                </View>
                <Text style={styles.corrThanks}>Merci pour ton aide !</Text>
                <Text style={styles.corrThanksBody}>
                  Ta contribution aide à garder les données à jour pour toute la communauté.
                </Text>
                <TouchableOpacity
                  style={styles.corrSubmit}
                  onPress={() => { setCorrModalVisible(false); setCorrSubmitted(false); setCorrText(''); }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.corrSubmitText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CTA Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.mainCta}
          onPress={() => nav.navigate('DatePicker', { countryId })}
          activeOpacity={0.85}
        >
          <Text style={styles.mainCtaText}>Créer mon plan d'action pour ce pays</Text>
        </TouchableOpacity>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.favBtn, isFav && styles.favBtnActive]}
            onPress={() => toggleFavorite(countryId)}
            activeOpacity={0.8}
          >
            <Text style={[styles.favBtnText, isFav && styles.favBtnTextActive]}>
              {isFav ? '♥  Dans tes favoris' : '♡ Ajouter aux favoris'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.seeMapText}>Voir sur la carte ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: { padding: 4 },
  backText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: '#6F6A60' },
  scroll: { flex: 1 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  codeBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  codeText: { fontFamily: Fonts.sansBold, fontSize: 16, color: Colors.dark, letterSpacing: 0.5 },
  countryName: { fontFamily: Fonts.serifMedium, fontSize: 30, lineHeight: 32, letterSpacing: -0.5, color: Colors.dark },
  countryRegion: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted, marginTop: 3 },
  recommendBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  recommendText: { flex: 1 },
  recommendLabel: { fontFamily: Fonts.sansBold, fontSize: 14 },
  recommendDesc: { fontFamily: Fonts.sans, fontSize: 12.5, color: '#4f4a40', marginTop: 2, lineHeight: 18 },
  section: { paddingHorizontal: 18, marginTop: 18 },
  sectionTitle: { fontFamily: Fonts.serifMedium, fontSize: 21, letterSpacing: -0.3, paddingVertical: 6, color: Colors.dark },
  criteriaCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  criteriaRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  criteriaBorder: { borderBottomWidth: 1, borderBottomColor: Colors.separator },
  criteriaIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  criteriaIconText: { fontSize: 14, fontFamily: Fonts.sansBold },
  criteriaText: { flex: 1, lineHeight: 20 },
  criteriaCat: { fontFamily: Fonts.sansBold, fontSize: 14, color: Colors.dark },
  criteriaSep: { fontFamily: Fonts.sans, fontSize: 14, color: Colors.muted },
  criteriaDesc: { fontFamily: Fonts.sans, fontSize: 14, color: '#4f4a40' },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#9a9384',
  },
  sourceBadge: {
    backgroundColor: Colors.bg,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  sourceText: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted },
  infoTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 16.5, marginTop: 8, color: Colors.dark },
  infoMeta: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted, marginTop: 10 },
  infoMetaLabel: { color: Colors.muted },
  infoDesc: { fontFamily: Fonts.sans, fontSize: 13, color: '#4f4a40', marginTop: 8, lineHeight: 20 },
  twoCol: { flexDirection: 'row', gap: 12 },
  halfCard: { flex: 1 },
  bigNumber: { fontFamily: Fonts.serifMedium, fontSize: 22, marginTop: 8, color: Colors.dark },
  bigNumberUnit: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  budgetAdaptive: { fontFamily: Fonts.sansSemiBold, fontSize: 11.5, marginTop: 6, lineHeight: 16 },
  salaireUnit: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 3 },
  pratLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#9a9384',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  pratCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pratRow: {},
  pratBorder: { borderTopWidth: 1, borderTopColor: Colors.separator },
  pratHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  pratKey: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.dark },
  pratChev: { fontSize: 18, color: Colors.muted },
  pratBody: { paddingHorizontal: 16, paddingBottom: 15, fontFamily: Fonts.sans, fontSize: 13.5, lineHeight: 21, color: '#4f4a40' },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green },
  liveLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#9a9384',
  },
  liveSync: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.mutedLight, marginLeft: 'auto' },
  liveCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  jobsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  jobsTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 13.5, color: Colors.dark },
  jobsCount: { fontFamily: Fonts.sans, fontSize: 11.5, color: Colors.muted },
  jobRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  jobBorder: { borderTopWidth: 1, borderTopColor: Colors.separator },
  jobInfo: { flex: 1, minWidth: 0 },
  jobTitle: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.dark },
  jobCompany: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 1 },
  jobAgo: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.mutedLight, marginLeft: 8 },
  consulateName: { fontFamily: Fonts.sansSemiBold, fontSize: 14.5, marginTop: 8, color: Colors.dark },
  consulate: { fontFamily: Fonts.sans, fontSize: 13, color: '#4f4a40', marginTop: 4, lineHeight: 20 },
  sourcesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13 },
  sourceChip: { backgroundColor: '#ece7dc', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  sourceChipText: { fontFamily: Fonts.sans, fontSize: 11, color: Colors.muted },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  mainCta: {
    backgroundColor: Colors.green,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  mainCtaText: { fontFamily: Fonts.sansBold, fontSize: 16, color: '#fff' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
  },
  favBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(33,30,24,0.15)',
  },
  favBtnActive: { backgroundColor: '#e6f0e8', borderColor: '#3c8a52' },
  favBtnText: { fontFamily: Fonts.sansSemiBold, fontSize: 13.5, color: '#6F6A60' },
  favBtnTextActive: { color: '#3c8a52' },
  seeMapText: { fontFamily: Fonts.sansSemiBold, fontSize: 13.5, color: '#6F6A60' },
  corrLink: { alignSelf: 'flex-start', paddingVertical: 4 },
  corrLinkText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.accent, textDecorationLine: 'underline' },
  corrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33,30,24,0.45)',
    justifyContent: 'flex-end',
  },
  corrSheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  corrTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.dark,
    marginBottom: 4,
  },
  corrSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 16,
  },
  corrInput: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.dark,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  corrSubmit: {
    backgroundColor: Colors.dark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  corrSubmitDisabled: { backgroundColor: Colors.border },
  corrSubmitText: { fontFamily: Fonts.sansSemiBold, fontSize: 15.5, color: Colors.bg },
  corrThanksIcon: { alignItems: 'center', marginBottom: 12 },
  corrThanks: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  corrThanksBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#4f4a40',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
});
