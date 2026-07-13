import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme';

interface Props {
  verifiedAt: string;    // 'YYYY-MM-DD' — oldest date (or single date)
  verifiedUntil?: string; // 'YYYY-MM-DD' — newest date; when present, shows range
  source?: string;
  style?: object;
}

const MONTHS_FR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

function daysSince(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const then = new Date(y, m - 1, d).getTime();
  return Math.floor((Date.now() - then) / 86_400_000);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_FR[m - 1]} ${y}`;
}

type Staleness = 'fresh' | 'aging' | 'stale';

function staleness(days: number): Staleness {
  if (days < 30) return 'fresh';
  if (days <= 90) return 'aging';
  return 'stale';
}

export function VerifiedTag({ verifiedAt, verifiedUntil, source, style }: Props) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Staleness is based on the newest date (verifiedUntil if range, else verifiedAt)
  const newestDate = verifiedUntil ?? verifiedAt;
  const days = daysSince(newestDate);
  const state = staleness(days);
  const months = Math.round(days / 30);

  let dot: string;
  let dotColor: string;
  let label: string;

  if (verifiedUntil) {
    // Range mode: "entre le [oldest] et le [newest]"
    if (state === 'fresh') {
      dot = '✓';
      dotColor = Colors.green;
      label = `Données vérifiées entre le ${formatDate(verifiedAt)} et le ${formatDate(verifiedUntil)}${source ? ` · ${source}` : ''}`;
    } else if (state === 'aging') {
      dot = '●';
      dotColor = Colors.accent;
      label = `Données vérifiées entre le ${formatDate(verifiedAt)} et le ${formatDate(verifiedUntil)} — mise à jour partielle${source ? ` · ${source}` : ''}`;
    } else {
      dot = '●';
      dotColor = Colors.mutedLight;
      label = `Données vérifiées entre le ${formatDate(verifiedAt)} et le ${formatDate(verifiedUntil)} — à revérifier`;
    }
  } else if (state === 'fresh') {
    dot = '✓';
    dotColor = Colors.green;
    label = `Vérifié le ${formatDate(verifiedAt)}${source ? ` · ${source}` : ''}`;
  } else if (state === 'aging') {
    dot = '●';
    dotColor = Colors.accent;
    label = `Vérifié il y a ${months} mois${source ? ` · ${source}` : ''}`;
  } else {
    dot = '●';
    dotColor = Colors.mutedLight;
    label = 'Donnée ancienne — à revérifier';
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.row, style]}
        onPress={() => setTooltipVisible(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={[styles.dot, { color: dotColor }]}>{dot}</Text>
        <Text style={[styles.label, state === 'stale' && styles.staleLabel]}>{label}</Text>
      </TouchableOpacity>

      <Modal
        visible={tooltipVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTooltipVisible(false)}
        >
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>À propos de cette donnée</Text>
            <Text style={styles.tooltipBody}>
              Paso vérifie régulièrement ses données auprès des sources officielles.
              {verifiedUntil
                ? ` Dernière vérification le ${formatDate(verifiedUntil)}.`
                : source ? ` Cette information provient de ${source}.` : ''}
            </Text>
            {state === 'stale' && (
              <Text style={styles.tooltipWarning}>
                {verifiedUntil
                  ? `La donnée la plus récente date de plus de 3 mois. Vérifiez sur les sources officielles avant toute démarche.`
                  : 'Cette donnée date de plus de 3 mois. Vérifiez sur la source officielle avant toute démarche.'}
              </Text>
            )}
            <TouchableOpacity style={styles.tooltipClose} onPress={() => setTooltipVisible(false)}>
              <Text style={styles.tooltipCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  dot: {
    fontSize: 10,
    lineHeight: 14,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.muted,
    lineHeight: 14,
    flexShrink: 1,
  },
  staleLabel: {
    color: Colors.mutedLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33,30,24,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  tooltip: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 22,
    width: '100%',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  tooltipTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.dark,
    marginBottom: 10,
  },
  tooltipBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#4f4a40',
    lineHeight: 21,
  },
  tooltipWarning: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.accent,
    lineHeight: 19,
    marginTop: 10,
    backgroundColor: '#fff3e8',
    borderRadius: 10,
    padding: 10,
  },
  tooltipClose: {
    marginTop: 18,
    alignItems: 'center',
    backgroundColor: Colors.dark,
    borderRadius: 12,
    paddingVertical: 12,
  },
  tooltipCloseText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14.5,
    color: Colors.bg,
  },
});
