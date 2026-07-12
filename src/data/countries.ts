export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  label: string;
  time: string;
  deadline?: string;
  link?: string;
  critical?: boolean;
  status: TaskStatus;
}

export interface Phase {
  id: string;
  title: string;       // "Cadrer & financer"
  sub: string;         // "à 12 mois"
  monthsBefore: number;
  tasks: Task[];
}

export interface Country {
  id: string;
  code: string;
  name: string;
  flag: string;
  region: string;
  tagline: string;
  budgetLabel: string; // total monthly budget for list view (≈ 1 600 €)
  score: number;
  // Sub-scores for map panel (Visa / Budget / Langue / Emploi)
  scoreVisa: number;
  scoreBudget: number;
  scoreLangue: number;
  scoreEmploi: number;
  lat: number;
  lon: number;
  criteria: { label: string; score: number; text: string }[];
  visa: { title: string; duree: string; conditions: string; source: string };
  budget: { cost: string; unit: string; compareText: string; source: string };
  salaire: { amount: string; unit: string; role: string; source: string };
  pratique: { key: string; body: string }[];
  consulate: { name: string; address: string; phone: string };
  jobsCount: string;
  jobs: { title: string; company: string; salary: string; ago: string }[];
  sources: string[];
  phases: Phase[];
}

// ─── Generic plan template ───────────────────────────────────────────────────
function genericPlan(countryName: string): Phase[] {
  return [
    {
      id: 'p1', title: 'Cadrer & financer', sub: 'à 12 mois', monthsBefore: 12,
      tasks: [
        { id: 't1', label: `Vérifier les conditions visa pour ${countryName}`, time: '≈ 30 min', critical: true, status: 'todo' },
        { id: 't2', label: 'Constituer une épargne de départ', time: '≈ 3 mois', status: 'todo' },
        { id: 't3', label: 'Estimer le coût de vie et logement', time: '≈ 1 h', status: 'todo' },
      ],
    },
    {
      id: 'p2', title: 'Lancer les démarches', sub: 'à 6 mois', monthsBefore: 6,
      tasks: [
        { id: 't4', label: 'Déposer la demande de visa', time: '≈ 2 h', critical: true, status: 'todo' },
        { id: 't5', label: 'Rechercher un logement temporaire', time: '≈ 3 h', status: 'todo' },
        { id: 't6', label: 'Souscrire une assurance santé expatrié', time: '≈ 1 h', status: 'todo' },
      ],
    },
    {
      id: 'p3', title: 'Arrivée & installation', sub: "à l'arrivée", monthsBefore: 0,
      tasks: [
        { id: 't7', label: "S'enregistrer auprès des autorités locales", time: '≈ 2 h', critical: true, status: 'todo' },
        { id: 't8', label: 'Ouvrir un compte bancaire local', time: '≈ 2 h', status: 'todo' },
        { id: 't9', label: 'Obtenir une carte SIM locale', time: '≈ 1 h', status: 'todo' },
      ],
    },
    {
      id: 'p4', title: 'Premier emploi', sub: 'dans le mois suivant', monthsBefore: -1,
      tasks: [
        { id: 't10', label: 'Créer un profil sur les portails emploi locaux', time: '≈ 2 h', status: 'todo' },
        { id: 't11', label: 'Faire reconnaître ses diplômes si nécessaire', time: '≈ 4 semaines', critical: true, status: 'todo' },
        { id: 't12', label: 'Rejoindre des communautés expatriées', time: '≈ 2 h', status: 'todo' },
      ],
    },
  ];
}

// ─── Australia ───────────────────────────────────────────────────────────────
const australiaPlan: Phase[] = [
  {
    id: 'p1', title: 'Cadrer & financer', sub: 'à 12 mois', monthsBefore: 12,
    tasks: [
      { id: 't1', label: 'Vérifier ton éligibilité au visa', time: '≈ 15 min', link: 'https://immi.homeaffairs.gov.au', critical: true, status: 'todo' },
      { id: 't2', label: 'Ouvrir une épargne dédiée (objectif 3 000 €)', time: '≈ 30 min', status: 'todo' },
      { id: 't3', label: 'Estimer le budget vol + installation', time: '≈ 20 min', status: 'todo' },
    ],
  },
  {
    id: 'p2', title: 'Lancer les démarches', sub: 'à 6 mois', monthsBefore: 6,
    tasks: [
      { id: 't4', label: 'Demander le Working Holiday Visa (subclass 417)', time: '≈ 3 h', link: 'https://immi.homeaffairs.gov.au', critical: true, status: 'todo' },
      { id: 't5', label: "Souscrire une assurance voyage / santé d'expatrié", time: '≈ 2 h', status: 'todo' },
      { id: 't6', label: 'Apostille de naissance + traduction certifiée', time: '≈ 3 semaines', critical: true, status: 'todo' },
    ],
  },
  {
    id: 'p3', title: 'Arrivée & installation', sub: "à l'arrivée", monthsBefore: 0,
    tasks: [
      { id: 't7', label: 'Obtenir son Tax File Number (TFN) en ligne', time: '≈ 30 min', link: 'https://ato.gov.au', status: 'todo' },
      { id: 't8', label: 'Activer la carte SIM locale (Optus / Telstra)', time: '≈ 1 h', status: 'todo' },
      { id: 't9', label: "S'inscrire sur le Medicare (si éligible AVS)", time: '≈ 2 h', status: 'todo' },
    ],
  },
  {
    id: 'p4', title: 'Premier emploi', sub: 'dans le mois suivant', monthsBefore: -1,
    tasks: [
      { id: 't10', label: 'Créer un profil Seek.com.au et LinkedIn australien', time: '≈ 2 h', status: 'todo' },
      { id: 't11', label: 'Faire reconnaître ses diplômes (Engineers Australia)', time: '≈ 4 semaines', critical: true, status: 'todo' },
      { id: 't12', label: 'Participer à 1–2 meetups tech Sydney / Melbourne', time: '≈ 3 h', status: 'todo' },
    ],
  },
];

// ─── Canada ──────────────────────────────────────────────────────────────────
const canadaPlan: Phase[] = [
  {
    id: 'p1', title: 'Cadrer & financer', sub: 'à 12 mois', monthsBefore: 12,
    tasks: [
      { id: 't1', label: "Candidater à Expérience Internationale Canada (EIC)", time: '≈ 4 h', link: 'https://canada.ca/eic', critical: true, status: 'todo' },
      { id: 't2', label: 'Obtenir son casier judiciaire apostillé', time: '≈ 3 semaines', status: 'todo' },
      { id: 't3', label: 'Ouvrir une épargne dédiée (objectif 2 500 CAD)', time: '≈ 30 min', status: 'todo' },
    ],
  },
  {
    id: 'p2', title: 'Lancer les démarches', sub: 'à 6 mois', monthsBefore: 6,
    tasks: [
      { id: 't4', label: 'Bilan médical si demandé par IRCC', time: '≈ 2 h', status: 'todo' },
      { id: 't5', label: 'Faire évaluer ses diplômes par WES Canada', time: '≈ 6 semaines', critical: true, status: 'todo' },
      { id: 't6', label: 'Souscrire une assurance santé privée', time: '≈ 1 h', status: 'todo' },
    ],
  },
  {
    id: 'p3', title: 'Arrivée & installation', sub: "à l'arrivée", monthsBefore: 0,
    tasks: [
      { id: 't7', label: "Obtenir le NAS (Numéro d'assurance sociale)", time: '≈ 1 h', link: 'https://canada.ca/nas', status: 'todo' },
      { id: 't8', label: 'Ouvrir un compte Desjardins / RBC', time: '≈ 2 h', status: 'todo' },
      { id: 't9', label: "S'inscrire à la RAMQ (Québec) ou MSSS", time: '≈ 1 h', status: 'todo' },
    ],
  },
  {
    id: 'p4', title: 'Résidence permanente', sub: 'après 12 mois', monthsBefore: -12,
    tasks: [
      { id: 't10', label: 'Calculer son score Entrée Express (CRS)', time: '≈ 2 h', link: 'https://canada.ca/express-entry', status: 'todo' },
      { id: 't11', label: 'Soumettre la demande de RP si invité', time: '≈ 8 h', critical: true, status: 'todo' },
      { id: 't12', label: 'Rejoindre des communautés françaises au Québec', time: '≈ 2 h', status: 'todo' },
    ],
  },
];

// ─── Portugal ─────────────────────────────────────────────────────────────────
const portugalPlan: Phase[] = [
  {
    id: 'p1', title: 'Cadrer & financer', sub: 'à 6 mois', monthsBefore: 6,
    tasks: [
      { id: 't1', label: 'Obtenir le NIF (numéro fiscal portugais)', time: '≈ 2 h', link: 'https://nif.pt', status: 'todo' },
      { id: 't2', label: 'Ouvrir un compte Revolut Portugal ou Millennium BCP', time: '≈ 3 h', status: 'todo' },
      { id: 't3', label: "Préparer dossier d'hébergement (bail > 1 an)", time: '≈ 2 semaines', critical: true, status: 'todo' },
    ],
  },
  {
    id: 'p2', title: 'Arrivée & inscription', sub: "à l'arrivée", monthsBefore: 0,
    tasks: [
      { id: 't4', label: "S'enregistrer à l'AIMA (Agência para a Integração)", time: '≈ 3 h', link: 'https://aima.gov.pt', critical: true, status: 'todo' },
      { id: 't5', label: 'Obtenir le certificado de residência UE (gratuit)', time: '≈ 30 min', status: 'todo' },
      { id: 't6', label: "Inscription au Serviço Nacional de Saúde (SNS)", time: '≈ 1 h', status: 'todo' },
    ],
  },
  {
    id: 'p3', title: 'Optimisation fiscale', sub: 'avant 6 mois de résidence', monthsBefore: -5,
    tasks: [
      { id: 't7', label: 'Demander le statut RNH au fisc (taux 20 %)', time: '≈ 4 h', link: 'https://portaldasfinancas.gov.pt', critical: true, status: 'todo' },
      { id: 't8', label: 'Déclarer revenus étrangers sous régime RNH', time: '≈ 2 h', status: 'todo' },
      { id: 't9', label: 'Rejoindre les réseaux expats Lisbonne / Porto', time: '≈ 2 h', status: 'todo' },
    ],
  },
  {
    id: 'p4', title: 'Installation durable', sub: 'après 12 mois', monthsBefore: -12,
    tasks: [
      { id: 't10', label: 'Renouveler titre de séjour UE (5 ans)', time: '≈ 2 h', status: 'todo' },
      { id: 't11', label: 'Ouverture compte NIF professionnel (recibos verdes)', time: '≈ 1 h', status: 'todo' },
      { id: 't12', label: 'Explorer les communautés tech Lisbonne', time: '≈ 2 h', status: 'todo' },
    ],
  },
];

// ─── Nouvelle-Zélande ─────────────────────────────────────────────────────────
const nzPlan: Phase[] = [
  {
    id: 'p1', title: 'Cadrer & financer', sub: 'à 12 mois', monthsBefore: 12,
    tasks: [
      { id: 't1', label: 'Vérifier ton éligibilité au Working Holiday Visa', time: '≈ 15 min', link: 'https://immigration.govt.nz', critical: true, status: 'todo' },
      { id: 't2', label: 'Constituer une épargne de 4 200 NZD minimum', time: '≈ 3 mois', status: 'todo' },
      { id: 't3', label: 'Souscrire une assurance voyage / santé', time: '≈ 2 h', status: 'todo' },
    ],
  },
  {
    id: 'p2', title: 'Démarches visa', sub: 'à 6 mois', monthsBefore: 6,
    tasks: [
      { id: 't4', label: 'Déposer la demande de Working Holiday Visa en ligne', time: '≈ 2 h', link: 'https://immigration.govt.nz', critical: true, status: 'todo' },
      { id: 't5', label: 'Réserver un logement temporaire à Auckland', time: '≈ 2 h', status: 'todo' },
      { id: 't6', label: 'Préparer son CV au format néo-zélandais', time: '≈ 2 h', status: 'todo' },
    ],
  },
  {
    id: 'p3', title: 'Arrivée & installation', sub: "à l'arrivée", monthsBefore: 0,
    tasks: [
      { id: 't7', label: 'Obtenir le IRD Number (numéro fiscal)', time: '≈ 30 min', link: 'https://ird.govt.nz', status: 'todo' },
      { id: 't8', label: 'Ouvrir un compte BNZ ou ANZ Nouvelle-Zélande', time: '≈ 2 h', status: 'todo' },
      { id: 't9', label: 'Obtenir le permis de conduire NZ si séjour > 12 mois', time: '≈ 1 h', status: 'todo' },
    ],
  },
  {
    id: 'p4', title: 'Premier emploi', sub: 'dans le mois suivant', monthsBefore: -1,
    tasks: [
      { id: 't10', label: 'Créer un profil Seek.co.nz et LinkedIn NZ', time: '≈ 2 h', status: 'todo' },
      { id: 't11', label: 'Réseau expat Wellington / Auckland', time: '≈ 2 h', status: 'todo' },
      { id: 't12', label: 'Candidater aux startups tech locales', time: '≈ 3 h', status: 'todo' },
    ],
  },
];

// ─── Allemagne ────────────────────────────────────────────────────────────────
const germanyPlan: Phase[] = [
  {
    id: 'p1', title: 'Cadrer & se préparer', sub: 'à 6 mois', monthsBefore: 6,
    tasks: [
      { id: 't1', label: 'Obtenir la reconnaissance de diplôme (anabin)', time: '≈ 8 semaines', critical: true, link: 'https://anabin.kmk.org', status: 'todo' },
      { id: 't2', label: 'Atteindre le niveau B1 en allemand minimum', time: '≈ 4 mois', status: 'todo' },
      { id: 't3', label: 'Rechercher un logement via WG-Gesucht', time: '≈ 4 semaines', status: 'todo' },
    ],
  },
  {
    id: 'p2', title: 'Arrivée & Anmeldung', sub: "à l'arrivée", monthsBefore: 0,
    tasks: [
      { id: 't4', label: "Faire l'Anmeldung (inscription domicile) à la mairie", time: '≈ 2 h', critical: true, status: 'todo' },
      { id: 't5', label: 'Obtenir son Steueridentifikationsnummer (ID fiscal)', time: '≈ 2–4 semaines', status: 'todo' },
      { id: 't6', label: 'Ouvrir un compte N26 ou Deutsche Bank', time: '≈ 2 h', status: 'todo' },
    ],
  },
  {
    id: 'p3', title: 'Premier emploi', sub: 'dans le mois suivant', monthsBefore: -1,
    tasks: [
      { id: 't7', label: "S'inscrire à la Krankenversicherung (TK ou AOK)", time: '≈ 1 h', critical: true, status: 'todo' },
      { id: 't8', label: 'Déposer candidatures sur XING, StepStone, LinkedIn', time: '≈ 3 h', status: 'todo' },
      { id: 't9', label: 'Inscription retraite (Deutsche Rentenversicherung)', time: '≈ 30 min', status: 'todo' },
    ],
  },
  {
    id: 'p4', title: 'Intégration', sub: 'après 3 mois', monthsBefore: -3,
    tasks: [
      { id: 't10', label: 'Rejoindre des meetups tech à Berlin / Munich', time: '≈ 2 h', status: 'todo' },
      { id: 't11', label: 'Suivre un cours intensif Goethe Institut', time: '≈ 3 mois', status: 'todo' },
      { id: 't12', label: 'Explorer les Bürgeramt pour les démarches admin', time: '≈ 1 h', status: 'todo' },
    ],
  },
];

// ─── Japon ────────────────────────────────────────────────────────────────────
const japanPlan: Phase[] = [
  {
    id: 'p1', title: 'Cadrer & se préparer', sub: 'à 12 mois', monthsBefore: 12,
    tasks: [
      { id: 't1', label: 'Atteindre le niveau JLPT N3 minimum', time: '≈ 6 mois', status: 'todo' },
      { id: 't2', label: "Obtenir un certificat d'éligibilité (COE) via employeur", time: '≈ 8 semaines', critical: true, status: 'todo' },
      { id: 't3', label: 'Faire traduire et certifier ses diplômes en japonais', time: '≈ 4 semaines', status: 'todo' },
    ],
  },
  {
    id: 'p2', title: 'Démarches visa', sub: 'à 3 mois', monthsBefore: 3,
    tasks: [
      { id: 't4', label: 'Déposer le dossier visa au consulat du Japon à Paris', time: '≈ 3 h', critical: true, status: 'todo' },
      { id: 't5', label: 'Réserver un logement temporaire à Tokyo', time: '≈ 2 h', status: 'todo' },
      { id: 't6', label: 'Préparer 250 000 ¥ de fonds minimum', time: '≈ 3 mois', status: 'todo' },
    ],
  },
  {
    id: 'p3', title: 'Arrivée & enregistrement', sub: "à l'arrivée", monthsBefore: 0,
    tasks: [
      { id: 't7', label: "S'inscrire à la mairie (jūminhyō) sous 14 jours", time: '≈ 1 h', critical: true, status: 'todo' },
      { id: 't8', label: 'Ouvrir un compte Japan Post Bank ou Sony Bank', time: '≈ 2 h', status: 'todo' },
      { id: 't9', label: "S'inscrire à l'assurance nationale (国民健康保険)", time: '≈ 1 h', status: 'todo' },
    ],
  },
  {
    id: 'p4', title: 'Intégration', sub: 'dans le mois suivant', monthsBefore: -1,
    tasks: [
      { id: 't10', label: "Obtenir le My Number Card (carte d'identité japonaise)", time: '≈ 3 semaines', status: 'todo' },
      { id: 't11', label: 'Rejoindre un cours de japonais professionnel', time: '3 h/sem', status: 'todo' },
      { id: 't12', label: 'Explorer les communautés expats Tokyo', time: '≈ 2 h', status: 'todo' },
    ],
  },
];

// ─── Countries list ───────────────────────────────────────────────────────────
export const COUNTRIES: Country[] = [
  {
    id: 'au', code: 'AU', name: 'Australie', flag: '🇦🇺',
    region: 'Océanie',
    tagline: 'Visa Vacances-Travail accessible, marché ouvert',
    budgetLabel: '≈ 1 600 €',
    score: 82, scoreVisa: 90, scoreBudget: 65, scoreLangue: 80, scoreEmploi: 88,
    lat: -33.8, lon: 151.2,
    criteria: [
      { label: 'Visa', score: 90, text: "Working Holiday Visa accessible jusqu'à 35 ans" },
      { label: 'Budget', score: 65, text: 'Ton budget est suffisant pour démarrer' },
      { label: 'Langue', score: 80, text: 'Anglais B2 recommandé' },
      { label: 'Emploi', score: 88, text: 'Ingénieurs très demandés, salaires élevés' },
      { label: "Frais d'installation", score: 62, text: 'Prévoir environ 5 500 € pour l\'installation initiale' },
    ],
    visa: {
      title: 'Working Holiday Visa (417)',
      duree: '12 mois, renouvelable',
      conditions: "Ouvert aux Français de 18 à 35 ans · demande en ligne · ≈ 510 AUD",
      source: 'Sherpa',
    },
    budget: { cost: '900', unit: ' /mois', compareText: "Il te resterait ~300 €/mois d'épargne", source: 'Numbeo' },
    salaire: { amount: '≈ 4 800 €', unit: 'brut/mois', role: 'ingénieur', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Colocation ~650 €/mois à Sydney. Plateformes : Flatmates, Domain, Gumtree.' },
      { key: 'Santé', body: 'Medicare public via accord AVS (bilatéral). Soins urgents gratuits. Assurance privée recommandée.' },
      { key: "Marché de l'emploi", body: 'Fort en tech. Seek.com.au est le principal portail. Salaires médians élevés, visas de travail sponsorisés disponibles.' },
    ],
    consulate: { name: 'Consulat général de France à Sydney', address: 'Level 26, St Martins Tower, 31 Market St, Sydney NSW 2000', phone: '+61 2 9268 2400' },
    jobsCount: '320 offres · Indeed',
    jobs: [
      { title: 'Graduate Civil Engineer', company: 'Aurecon', salary: '85 000 AUD', ago: '2 h' },
      { title: 'Mechanical Engineer', company: 'WSP', salary: '95 000 AUD', ago: '5 h' },
      { title: 'Project Engineer', company: 'Lendlease', salary: '105 000 AUD', ago: '1 j' },
    ],
    sources: ['Sherpa', 'Numbeo', 'Glassdoor', 'Indeed', 'France Diplomatie'],
    phases: australiaPlan,
  },
  {
    id: 'ca', code: 'CA', name: 'Canada', flag: '🇨🇦',
    region: 'Amériques',
    tagline: 'Permis EIC, anglophone & francophone',
    budgetLabel: '≈ 1 500 €',
    score: 80, scoreVisa: 85, scoreBudget: 70, scoreLangue: 85, scoreEmploi: 78,
    lat: 43.7, lon: -79.4,
    criteria: [
      { label: 'Visa', score: 85, text: 'EIC (Expérience Internationale Canada) pour les 18–35 ans' },
      { label: 'Budget', score: 70, text: 'Toronto cher, Montréal –25 % moins cher' },
      { label: 'Langue', score: 85, text: 'Anglais & français, Montréal idéal pour les francophones' },
      { label: 'Emploi', score: 78, text: 'Marché tech dynamique à Toronto & Montréal' },
      { label: "Frais d'installation", score: 70, text: 'Prévoir environ 3 000 € pour l\'installation' },
    ],
    visa: {
      title: 'Permis Vacances-Travail (EIC)',
      duree: '12 à 24 mois selon accord',
      conditions: 'Pool tirage au sort, ouvert généralement en janvier. Fonds suffisants requis (2 500 CAD minimum).',
      source: 'IRCC Canada',
    },
    budget: { cost: '1200', unit: ' /mois', compareText: 'Budget serré — Montréal est plus abordable', source: 'Numbeo' },
    salaire: { amount: '≈ 3 500 €', unit: 'brut/mois', role: 'développeur', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Studios ~900 CAD/mois à Montréal, ~1 600 CAD à Toronto. Kijiji et Marketplace pour les colocs.' },
      { key: 'Santé', body: 'RAMQ au Québec (après 3 mois), OHIP en Ontario. Assurance privée les premiers mois.' },
      { key: "Marché de l'emploi", body: 'Montréal : IA & jeux vidéo. Toronto : fintech & startups. Indeed.ca et LinkedIn dominants.' },
    ],
    consulate: { name: 'Consulat Général de France à Montréal', address: '1 Place Ville-Marie, Bureau 2601, Montréal QC H3B 4S3', phone: '+1 514 878 4385' },
    jobsCount: '210 offres · Indeed',
    jobs: [
      { title: 'Développeur Full-Stack (React)', company: 'Shopify', salary: '110k CAD', ago: '3 j' },
      { title: 'Ingénieur Backend (Python)', company: 'Coveo', salary: '95k CAD', ago: '1 sem' },
      { title: 'Data Engineer', company: 'Element AI', salary: '100k CAD', ago: '4 j' },
    ],
    sources: ['IRCC', 'Numbeo', 'Glassdoor', 'WES Canada', 'France Diplomatie'],
    phases: canadaPlan,
  },
  {
    id: 'pt', code: 'PT', name: 'Portugal', flag: '🇵🇹',
    region: 'Europe',
    tagline: 'Libre circulation UE, coût de la vie bas',
    budgetLabel: '≈ 1 100 €',
    score: 74, scoreVisa: 80, scoreBudget: 88, scoreLangue: 58, scoreEmploi: 66,
    lat: 38.7, lon: -9.1,
    criteria: [
      { label: 'Visa', score: 80, text: 'Libre circulation UE, certificat de résidence immédiat' },
      { label: 'Budget', score: 88, text: 'Coût de la vie –25 % vs Paris, Lisbonne en hausse' },
      { label: 'Langue', score: 58, text: 'Portugais recommandé, anglais accepté en tech' },
      { label: 'Emploi', score: 66, text: 'Marché tech en croissance, salaires inférieurs à la France' },
      { label: "Frais d'installation", score: 78, text: 'Prévoir environ 2 500 € pour s\'installer' },
    ],
    visa: {
      title: 'Libre circulation UE / Certificat de résidence',
      duree: 'Illimitée (titre renouvelable tous les 5 ans)',
      conditions: "Ressortissant UE : aucun visa. Enregistrement à l'AIMA sous 30 jours. Statut RNH disponible.",
      source: 'AIMA Portugal',
    },
    budget: { cost: '1100', unit: ' /mois', compareText: 'Budget confortable, épargne possible', source: 'Numbeo' },
    salaire: { amount: '≈ 2 400 €', unit: 'net/mois', role: 'développeur', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Colocation ~600 €/mois à Lisbonne. Uniplaces et Idealista pour la recherche de logement.' },
      { key: 'Santé', body: 'SNS (Serviço Nacional de Saúde) public et gratuit après inscription.' },
      { key: "Marché de l'emploi", body: 'Hub tech en croissance (Farfetch, Feedzai, Unbabel). LinkedIn et Glassdoor PT.' },
    ],
    consulate: { name: 'Ambassade de France au Portugal', address: 'Rua Santos-o-Velho, 5, 1249-079 Lisbonne', phone: '+351 21 391 19 00' },
    jobsCount: '180 offres · LinkedIn',
    jobs: [
      { title: 'Software Engineer (Python)', company: 'Farfetch', salary: '2 800–3 800 €', ago: '2 j' },
      { title: 'Backend Developer (Node.js)', company: 'Feedzai', salary: '2 500–3 500 €', ago: '5 j' },
      { title: 'DevOps Engineer', company: 'Unbabel', salary: '3 000–4 000 €', ago: '1 sem' },
    ],
    sources: ['AIMA', 'Numbeo', 'Glassdoor', 'Portal das Finanças', 'France Diplomatie'],
    phases: portugalPlan,
  },
  {
    id: 'nz', code: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳🇿',
    region: 'Océanie',
    tagline: 'Working Holiday simple, qualité de vie',
    budgetLabel: '≈ 1 550 €',
    score: 77, scoreVisa: 86, scoreBudget: 66, scoreLangue: 82, scoreEmploi: 72,
    lat: -36.8, lon: 174.7,
    criteria: [
      { label: 'Visa', score: 86, text: "Working Holiday Visa jusqu'à 35 ans, quota 1 500/an" },
      { label: 'Budget', score: 66, text: 'Auckland très cher, Wellington plus abordable' },
      { label: 'Langue', score: 82, text: 'Anglais, accent très accessible pour les francophones' },
      { label: 'Emploi', score: 72, text: 'Marché tech limité mais bonne qualité de vie pro' },
      { label: "Frais d'installation", score: 60, text: 'Prévoir environ 4 200 NZD de fonds initiaux' },
    ],
    visa: {
      title: 'Working Holiday Visa',
      duree: '12 mois (extensible 23 mois)',
      conditions: 'Âge 18–35 ans. Quota de 1 500 personnes/an. Fonds requis : 4 200 NZD. Tirage au sort en ligne.',
      source: 'Immigration NZ',
    },
    budget: { cost: '1400', unit: ' /mois', compareText: 'Budget serré à Auckland, équilibré à Wellington', source: 'Numbeo' },
    salaire: { amount: '≈ 3 200 €', unit: 'brut/mois', role: 'développeur', source: 'Seek NZ' },
    pratique: [
      { key: 'Logement', body: 'Colocation ~700 NZD/mois à Wellington. TradeMe et Flatmates NZ pour la recherche.' },
      { key: 'Santé', body: 'ACC (accident compensation) public. Soins d\'urgence gratuits. Médecin généraliste ~60–80 NZD.' },
      { key: "Marché de l'emploi", body: 'Petite économie, marché tech concentré à Auckland et Wellington. Seek.co.nz principal portail.' },
    ],
    consulate: { name: 'Ambassade de France en Nouvelle-Zélande', address: '34-42 Manners St, Te Aro, Wellington 6011', phone: '+64 4 384 2555' },
    jobsCount: '95 offres · Seek',
    jobs: [
      { title: 'Full-Stack Developer (Vue.js)', company: 'Xero', salary: '85k NZD', ago: '3 j' },
      { title: 'Backend Engineer (Python)', company: 'Vend', salary: '75k NZD', ago: '2 sem' },
      { title: 'Software Engineer', company: 'MYOB', salary: '80k NZD', ago: '5 j' },
    ],
    sources: ['Immigration NZ', 'Numbeo', 'Seek NZ', 'IRD', 'France Diplomatie'],
    phases: nzPlan,
  },
  {
    id: 'de', code: 'DE', name: 'Allemagne', flag: '🇩🇪',
    region: 'Europe',
    tagline: 'Libre circulation UE, mais langue à travailler',
    budgetLabel: '≈ 1 400 €',
    score: 66, scoreVisa: 74, scoreBudget: 72, scoreLangue: 44, scoreEmploi: 80,
    lat: 52.5, lon: 13.4,
    criteria: [
      { label: 'Visa', score: 74, text: 'Libre circulation UE, Anmeldung obligatoire sous 14 jours' },
      { label: 'Budget', score: 72, text: 'Berlin abordable, Munich & Hambourg plus chers' },
      { label: 'Langue', score: 44, text: 'Allemand quasi-indispensable au quotidien (B1 min.)' },
      { label: 'Emploi', score: 80, text: 'Marché tech très fort, pénurie de développeurs' },
      { label: "Frais d'installation", score: 72, text: 'Prévoir 2 000–3 000 € pour l\'installation à Berlin' },
    ],
    visa: {
      title: 'Libre circulation UE / Niederlassungserlaubnis',
      duree: 'Illimitée (RP automatique UE)',
      conditions: "Ressortissant UE : Anmeldung (enregistrement domicile) sous 14 jours. Steuer-ID reçue automatiquement.",
      source: 'Make it in Germany',
    },
    budget: { cost: '1400', unit: ' /mois', compareText: 'Budget similaire à Paris, logement moins cher à Berlin', source: 'Numbeo' },
    salaire: { amount: '≈ 4 200 €', unit: 'brut/mois', role: 'développeur', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Colocation ~600 €/mois à Berlin. WG-Gesucht et Immobilienscout24 pour la recherche.' },
      { key: 'Santé', body: 'Krankenversicherung (KV) obligatoire : choisir entre public (TK, AOK, DAK) ou privé.' },
      { key: "Marché de l'emploi", body: '"Silicon Allee" à Berlin. XING, StepStone et LinkedIn actifs. Marché en anglais pour les startups.' },
    ],
    consulate: { name: 'Ambassade de France en Allemagne', address: 'Pariser Platz 5, 10117 Berlin', phone: '+49 30 590 03 9000' },
    jobsCount: '290 offres · LinkedIn',
    jobs: [
      { title: 'Backend Engineer (Java/Kotlin)', company: 'Zalando', salary: '75k–95k €', ago: '1 j' },
      { title: 'Senior Software Engineer', company: 'N26', salary: '80k–100k €', ago: '3 j' },
      { title: 'DevOps Engineer', company: 'HelloFresh', salary: '70k–90k €', ago: '2 j' },
    ],
    sources: ['Make it in Germany', 'Numbeo', 'Glassdoor', 'Bundesagentur', 'France Diplomatie'],
    phases: germanyPlan,
  },
  {
    id: 'jp', code: 'JP', name: 'Japon', flag: '🇯🇵',
    region: 'Asie-Pacifique',
    tagline: 'Visa qualifié possible, démarches longues',
    budgetLabel: '≈ 1 700 €',
    score: 55, scoreVisa: 54, scoreBudget: 58, scoreLangue: 34, scoreEmploi: 70,
    lat: 35.7, lon: 139.7,
    criteria: [
      { label: 'Visa', score: 54, text: 'PVT franco-japonais ou visa travail qualifié (COE requis)' },
      { label: 'Budget', score: 58, text: 'Tokyo accessible vs Paris, logement petit mais gérable' },
      { label: 'Langue', score: 34, text: 'Japonais presque indispensable (JLPT N3 min.)' },
      { label: 'Emploi', score: 70, text: 'Forte demande en tech mais marché très local' },
      { label: "Frais d'installation", score: 55, text: 'Shikikin (caution) = 2–3 mois de loyer à prévoir' },
    ],
    visa: {
      title: 'PVT franco-japonais (Programme Vacances-Travail)',
      duree: '12 mois, non renouvelable',
      conditions: 'Âge 18–30 ans. Quota annuel (1 500 personnes). 250 000 JPY de fonds. Tirage au sort en janvier.',
      source: 'Ambassade du Japon',
    },
    budget: { cost: '1600', unit: ' /mois', compareText: 'Budget similaire à Paris, à surveiller', source: 'Numbeo' },
    salaire: { amount: '≈ 2 800 €', unit: 'brut/mois', role: 'développeur', source: 'Glassdoor JP' },
    pratique: [
      { key: 'Logement', body: 'Studio ~700 €/mois à Tokyo (Saitama moins cher). GaijinPot Housing pour les étrangers.' },
      { key: 'Santé', body: 'Assurance nationale obligatoire (~13 000 ¥/mois). Remboursement 70 %. Pharmacies très accessibles.' },
      { key: "Marché de l'emploi", body: 'GaijinPot Jobs et LinkedIn JP. Les startups recrutent en anglais. JLPT N2 fortement conseillé.' },
    ],
    consulate: { name: 'Ambassade de France au Japon', address: '4-11-44 Minami-Azabu, Minato, Tokyo 106-8514', phone: '+81 3 5798 6000' },
    jobsCount: '85 offres · GaijinPot',
    jobs: [
      { title: 'Software Engineer (Go/Kotlin)', company: 'Mercari', salary: '8 M–12 M ¥', ago: '4 j' },
      { title: 'Backend Developer (Java)', company: 'Rakuten', salary: '6 M–9 M ¥', ago: '1 sem' },
      { title: 'Frontend Engineer', company: 'CyberAgent', salary: '7 M–10 M ¥', ago: '3 j' },
    ],
    sources: ['Ambassade du Japon', 'Numbeo', 'Glassdoor', 'GaijinPot', 'France Diplomatie'],
    phases: japanPlan,
  },
  {
    id: 'kr', code: 'KR', name: 'Corée du Sud', flag: '🇰🇷',
    region: 'Asie-Pacifique',
    tagline: 'Working Holiday à quota limité',
    budgetLabel: '≈ 1 500 €',
    score: 57, scoreVisa: 60, scoreBudget: 62, scoreLangue: 40, scoreEmploi: 66,
    lat: 37.5, lon: 127.0,
    criteria: [
      { label: 'Visa', score: 60, text: "Working Holiday franco-coréen à quota limité (500/an)" },
      { label: 'Budget', score: 62, text: 'Séoul abordable, coût de vie similaire à Paris' },
      { label: 'Langue', score: 40, text: 'Coréen indispensable pour la vie quotidienne' },
      { label: 'Emploi', score: 66, text: 'Marché tech avancé mais marché local avant tout' },
      { label: "Frais d'installation", score: 58, text: 'Caution (jeonse/wolse) importante à prévoir' },
    ],
    visa: {
      title: "Working Holiday Visa franco-coréen",
      duree: '12 mois, non renouvelable',
      conditions: 'Âge 18–30 ans. Quota ~500 personnes/an. Tirage au sort, ouverture en janvier.',
      source: 'Ambassade de Corée',
    },
    budget: { cost: '1500', unit: ' /mois', compareText: 'Budget à estimer selon style de vie', source: 'Numbeo' },
    salaire: { amount: 'À estimer', unit: 'brut/mois', role: 'ton domaine', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Studios ~500–800 €/mois à Séoul. Plateformes locales Zigbang et Dabang pour les colocations.' },
      { key: 'Santé', body: 'Système de santé public excellent. Assurance nationale (NHIS) obligatoire après inscription.' },
      { key: "Marché de l'emploi", body: 'Géants tech : Samsung, LG, Kakao, Naver. Marché principalement coréanophone. LinkedIn actif pour les expats.' },
    ],
    consulate: { name: "Ambassade de France en Corée du Sud", address: '30 Hap-dong, Seodaemun-gu, Seoul 03722', phone: '+82 2 3149 4300' },
    jobsCount: '— · Flux en cours',
    jobs: [],
    sources: ['Ambassade de Corée', 'Numbeo', 'Glassdoor', 'France Diplomatie'],
    phases: genericPlan('la Corée du Sud'),
  },
  {
    id: 'ae', code: 'AE', name: 'Émirats', flag: '🇦🇪',
    region: 'Asie-Pacifique',
    tagline: 'Visa via employeur uniquement',
    budgetLabel: '≈ 2 200 €',
    score: 59, scoreVisa: 50, scoreBudget: 46, scoreLangue: 70, scoreEmploi: 74,
    lat: 25.2, lon: 55.3,
    criteria: [
      { label: 'Visa', score: 50, text: 'Visa sponsorisé par l\'employeur uniquement' },
      { label: 'Budget', score: 46, text: 'Coût de vie élevé à Dubaï et Abu Dhabi' },
      { label: 'Langue', score: 70, text: 'Anglais très répandu dans le monde professionnel' },
      { label: 'Emploi', score: 74, text: 'Marché finance, immobilier, tech en forte croissance' },
      { label: "Frais d'installation", score: 50, text: 'Installation coûteuse, logement très cher' },
    ],
    visa: {
      title: 'Visa de travail (Employment Visa)',
      duree: '2 ou 3 ans, renouvelable',
      conditions: "Sponsorisé par l'employeur uniquement. Pas de visa indépendant. Vérifications médicales requises.",
      source: 'Sherpa',
    },
    budget: { cost: '2200', unit: ' /mois', compareText: 'Budget élevé — offres attractives en contrepartie', source: 'Numbeo' },
    salaire: { amount: 'À estimer', unit: 'brut/mois', role: 'ton domaine', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Appartements ~1 500–2 500 €/mois à Dubaï. Bayswater, Dubizzle pour la recherche.' },
      { key: 'Santé', body: 'Assurance santé obligatoire fournie par l\'employeur. Soins privés de haute qualité.' },
      { key: "Marché de l'emploi", body: 'Finance, immobilier, tech et tourisme. LinkedIn et Bayt.com pour la recherche. Pas d\'impôt sur le revenu.' },
    ],
    consulate: { name: "Consulat Général de France à Dubaï", address: 'Floor 6, Boulevard Plaza Tower 2, Downtown Dubai', phone: '+971 4 408 4900' },
    jobsCount: '— · Flux en cours',
    jobs: [],
    sources: ['Sherpa', 'Numbeo', 'Glassdoor', 'France Diplomatie'],
    phases: genericPlan('les Émirats'),
  },
  {
    id: 'sg', code: 'SG', name: 'Singapour', flag: '🇸🇬',
    region: 'Asie-Pacifique',
    tagline: 'Employment Pass exigeant sur le salaire',
    budgetLabel: '≈ 2 000 €',
    score: 60, scoreVisa: 44, scoreBudget: 40, scoreLangue: 86, scoreEmploi: 80,
    lat: 1.3, lon: 103.8,
    criteria: [
      { label: 'Visa', score: 44, text: 'Employment Pass : salaire minimum 5 000 SGD/mois' },
      { label: 'Budget', score: 40, text: 'L\'une des villes les plus chères d\'Asie' },
      { label: 'Langue', score: 86, text: 'Anglais langue officielle, idéal pour les francophones' },
      { label: 'Emploi', score: 80, text: 'Hub financier et tech de l\'Asie du Sud-Est' },
      { label: "Frais d'installation", score: 42, text: 'Installation très coûteuse, prévoir un budget conséquent' },
    ],
    visa: {
      title: 'Employment Pass (EP)',
      duree: '1 à 2 ans, renouvelable',
      conditions: 'Salaire minimum 5 000 SGD/mois. Offre d\'emploi obligatoire. Process : 3–8 semaines via MOM.',
      source: 'MOM Singapore',
    },
    budget: { cost: '2000', unit: ' /mois', compareText: 'Budget serré — salaires élevés compensent', source: 'Numbeo' },
    salaire: { amount: 'À estimer', unit: 'brut/mois', role: 'ton domaine', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Appartements ~2 000–3 500 SGD/mois. PropertyGuru et 99.co pour la recherche.' },
      { key: 'Santé', body: 'Système de santé public et privé de haute qualité. Assurance fournie par l\'employeur.' },
      { key: "Marché de l'emploi", body: 'Finance, tech, biomedical. Google, Grab, Sea Group recrutent activement. LinkedIn dominant.' },
    ],
    consulate: { name: "Ambassade de France à Singapour", address: '101-103 Cluny Park Road, Singapore 259595', phone: '+65 6880 7800' },
    jobsCount: '— · Flux en cours',
    jobs: [],
    sources: ['MOM Singapore', 'Numbeo', 'Glassdoor', 'France Diplomatie'],
    phases: genericPlan('Singapour'),
  },
  {
    id: 'br', code: 'BR', name: 'Brésil', flag: '🇧🇷',
    region: 'Amériques',
    tagline: 'Visa via entreprise, bureaucratie',
    budgetLabel: '≈ 1 200 €',
    score: 54, scoreVisa: 56, scoreBudget: 70, scoreLangue: 40, scoreEmploi: 54,
    lat: -23.5, lon: -46.6,
    criteria: [
      { label: 'Visa', score: 56, text: 'Visa de travail via entreprise locale, démarches longues' },
      { label: 'Budget', score: 70, text: 'Coût de vie abordable à São Paulo et Rio' },
      { label: 'Langue', score: 40, text: 'Portugais brésilien indispensable au quotidien' },
      { label: 'Emploi', score: 54, text: 'Marché tech en croissance mais instabilité économique' },
      { label: "Frais d'installation", score: 62, text: 'Frais d\'installation modérés selon la ville' },
    ],
    visa: {
      title: 'Visa de travail (VITEM V)',
      duree: '1 à 2 ans, renouvelable',
      conditions: 'Offre d\'emploi via entreprise brésilienne obligatoire. Dossier à l\'Ambassade du Brésil.',
      source: 'Ambassade du Brésil',
    },
    budget: { cost: '1200', unit: ' /mois', compareText: 'Budget abordable selon le quartier', source: 'Numbeo' },
    salaire: { amount: 'À estimer', unit: 'brut/mois', role: 'ton domaine', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Colocation ~500–800 €/mois à São Paulo ou Rio. OLX et Viva Real pour la recherche.' },
      { key: 'Santé', body: 'Système public SUS, qualité variable. Assurance privée fortement recommandée.' },
      { key: "Marché de l'emploi", body: 'Fintech, agritech et e-commerce en forte croissance. LinkedIn et Catho pour la recherche.' },
    ],
    consulate: { name: "Consulat Général de France à São Paulo", address: 'Av. Paulista 1842, 14e étage, São Paulo, SP 01310-945', phone: '+55 11 3371 5400' },
    jobsCount: '— · Flux en cours',
    jobs: [],
    sources: ['Ambassade du Brésil', 'Numbeo', 'Glassdoor', 'France Diplomatie'],
    phases: genericPlan('le Brésil'),
  },
  {
    id: 'us', code: 'US', name: 'États-Unis', flag: '🇺🇸',
    region: 'Amériques',
    tagline: 'Visa de travail très contraint (loterie H-1B)',
    budgetLabel: '≈ 2 500 €',
    score: 41, scoreVisa: 18, scoreBudget: 40, scoreLangue: 86, scoreEmploi: 60,
    lat: 40.7, lon: -74.0,
    criteria: [
      { label: 'Visa', score: 18, text: 'H-1B par loterie (22 % de chances), très incertain' },
      { label: 'Budget', score: 40, text: 'New York et SF très chers, autres villes plus abordables' },
      { label: 'Langue', score: 86, text: 'Anglais courant, idéal pour les anglophones confirmés' },
      { label: 'Emploi', score: 60, text: 'Salaires très élevés mais visa complexe à obtenir' },
      { label: "Frais d'installation", score: 38, text: 'Caution + frais légaux + santé très coûteux' },
    ],
    visa: {
      title: 'H-1B (Specialty Occupation)',
      duree: '3 ans, extensible à 6 ans',
      conditions: 'Loterie annuelle, 22 % de chances. Offre d\'emploi obligatoire. Alternative : L-1 via mutation ou O-1 talents.',
      source: 'USCIS',
    },
    budget: { cost: '2500', unit: ' /mois', compareText: 'Budget très élevé à New York et San Francisco', source: 'Numbeo' },
    salaire: { amount: 'À estimer', unit: 'brut/mois', role: 'ton domaine', source: 'Glassdoor' },
    pratique: [
      { key: 'Logement', body: 'Appartements ~2 500–4 000 $/mois à NYC. Zillow et Apartments.com pour la recherche.' },
      { key: 'Santé', body: 'Pas de système public. Assurance santé via employeur obligatoire, coûts très élevés.' },
      { key: "Marché de l'emploi", body: 'GAFAM, startups, fintech. LinkedIn et Glassdoor dominants. Salaires top-marché mais visa bloque l\'accès.' },
    ],
    consulate: { name: "Consulat Général de France à New York", address: '934 5th Ave, New York, NY 10021', phone: '+1 212 606 3600' },
    jobsCount: '— · Flux en cours',
    jobs: [],
    sources: ['USCIS', 'Numbeo', 'Glassdoor', 'France Diplomatie'],
    phases: genericPlan('les États-Unis'),
  },
];
