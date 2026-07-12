// Verification dates for country data blocks
// Used by VerifiedTag to show data freshness

export interface CountryVerifiedDates {
  visa: string;
  budget: string;
  salaire: string;
  pratique?: Record<string, string>;
}

// Dates intentionally varied to demonstrate all three staleness states:
//   < 30 days  → green  (fresh)
//   30–90 days → orange (aging)
//   > 90 days  → grey   (stale)
// Current date context: 2026-07-12
export const VERIFIED_DATES: Record<string, CountryVerifiedDates> = {
  au: {
    visa:    '2026-07-05', // 7 jours — vert
    budget:  '2026-06-28', // 14 jours — vert
    salaire: '2026-07-10', // 2 jours — vert
    pratique: {
      'Logement':            '2026-06-20',
      'Santé':               '2026-07-01',
      "Marché de l'emploi":  '2026-06-28',
    },
  },
  ca: {
    visa:    '2026-06-15', // 27 jours — vert
    budget:  '2026-05-20', // 53 jours — orange
    salaire: '2026-06-01', // 41 jours — orange
    pratique: {
      'Logement':            '2026-06-10',
      'Santé':               '2026-05-28',
      "Marché de l'emploi":  '2026-06-15',
    },
  },
  pt: {
    visa:    '2026-07-08', // 4 jours — vert
    budget:  '2026-04-01', // 102 jours — gris
    salaire: '2026-05-15', // 58 jours — orange
    pratique: {
      'Logement':            '2026-06-25',
      'Santé':               '2026-04-15',
      "Marché de l'emploi":  '2026-05-10',
    },
  },
  nz: {
    visa:    '2026-06-20', // 22 jours — vert
    budget:  '2026-06-10', // 32 jours — orange
    salaire: '2026-07-01', // 11 jours — vert
    pratique: {
      'Logement':            '2026-06-18',
      'Santé':               '2026-07-02',
      "Marché de l'emploi":  '2026-06-10',
    },
  },
  de: {
    visa:    '2026-07-06', // 6 jours — vert
    budget:  '2026-05-10', // 63 jours — orange
    salaire: '2026-03-15', // 119 jours — gris
    pratique: {
      'Logement':            '2026-06-30',
      'Santé':               '2026-05-20',
      "Marché de l'emploi":  '2026-03-10',
    },
  },
  jp: {
    visa:    '2026-07-02', // 10 jours — vert
    budget:  '2026-04-20', // 83 jours — orange
    salaire: '2026-02-28', // 134 jours — gris
    pratique: {
      'Logement':            '2026-05-01',
      'Santé':               '2026-04-22',
      "Marché de l'emploi":  '2026-02-15',
    },
  },
  kr: {
    visa:    '2026-06-25', // 17 jours — vert
    budget:  '2026-06-01', // 41 jours — orange
    salaire: '2026-07-05', // 7 jours — vert
  },
  ae: {
    visa:    '2026-05-30', // 43 jours — orange
    budget:  '2026-07-08', // 4 jours — vert
    salaire: '2026-06-15', // 27 jours — vert
  },
  sg: {
    visa:    '2026-07-09', // 3 jours — vert
    budget:  '2026-04-25', // 78 jours — orange
    salaire: '2026-07-03', // 9 jours — vert
  },
  br: {
    visa:    '2026-04-05', // 98 jours — gris
    budget:  '2026-06-20', // 22 jours — vert
    salaire: '2026-05-01', // 72 jours — orange
  },
  us: {
    visa:    '2026-06-01', // 41 jours — orange
    budget:  '2026-03-10', // 124 jours — gris
    salaire: '2026-07-07', // 5 jours — vert
  },
};

// Compute oldest and newest verifiedAt across all countries (for MapScreen global tag)
export function getGlobalDateRange(): { oldest: string; newest: string } {
  const all: string[] = [];
  for (const d of Object.values(VERIFIED_DATES)) {
    all.push(d.visa, d.budget, d.salaire);
  }
  all.sort();
  return { oldest: all[0], newest: all[all.length - 1] };
}
