// TODO: proxy through backend before production — keys must not ship in the client.
import { cachedFetch, bustCache, CacheResult } from './cache';

const TTL_6H = 6 * 60 * 60 * 1000;

// Adzuna only supports a subset of Paso's countries
export const ADZUNA_COUNTRY_CODES: Record<string, string> = {
  au: 'au',
  ca: 'ca',
  de: 'de',
  nz: 'nz',
  sg: 'sg',
  br: 'br',
  us: 'us',
  // jp, kr, ae, pt → NOT supported by Adzuna → keep mock + "estimation" label
};

export const COUNTRY_CURRENCY: Record<string, string> = {
  au: 'AUD',
  ca: 'CAD',
  de: 'EUR',
  nz: 'NZD',
  sg: 'SGD',
  br: 'BRL',
  us: 'USD',
};

const PROFESSION_TERMS: Record<string, string> = {
  tech: 'software engineer',
  hotellerie: 'hospitality hotel restaurant',
  business: 'manager consultant',
  entrepreneur: 'business development',
  etudiant: 'part time junior',
};

export interface LiveJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  url: string;
  created: string;
}

export interface AdzunaResult {
  jobs: LiveJob[];
  totalCount: number;
  currency: string;
  avgSalaryMin: number | null;
  avgSalaryMax: number | null;
}

export function isAdzunaEnabled(): boolean {
  const id = process.env.EXPO_PUBLIC_ADZUNA_APP_ID;
  const key = process.env.EXPO_PUBLIC_ADZUNA_APP_KEY;
  return Boolean(id && key && id !== '' && key !== '');
}

export function isAdzunaSupported(countryId: string): boolean {
  return countryId in ADZUNA_COUNTRY_CODES;
}

function cacheKey(countryId: string, professionKey: string): string {
  return `adzuna_${countryId}_${professionKey}`;
}

export async function fetchJobs(
  countryId: string,
  professionKey: string,
): Promise<CacheResult<AdzunaResult> | null> {
  if (!isAdzunaEnabled() || !isAdzunaSupported(countryId)) return null;

  const appId = process.env.EXPO_PUBLIC_ADZUNA_APP_ID!;
  const appKey = process.env.EXPO_PUBLIC_ADZUNA_APP_KEY!;
  const adzunaCode = ADZUNA_COUNTRY_CODES[countryId];
  const searchTerm = PROFESSION_TERMS[professionKey] ?? 'professional';
  const currency = COUNTRY_CURRENCY[countryId] ?? 'USD';

  return cachedFetch<AdzunaResult>(
    cacheKey(countryId, professionKey),
    TTL_6H,
    async () => {
      const url = `https://api.adzuna.com/v1/api/jobs/${adzunaCode}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(searchTerm)}&results_per_page=5&content-type=application%2Fjson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Adzuna ${res.status}`);
      const json = await res.json();

      const results = (json.results ?? []) as Array<Record<string, unknown>>;
      const jobs: LiveJob[] = results.map((r) => ({
        id: String(r.id ?? ''),
        title: String(r.title ?? ''),
        company: String((r.company as Record<string, unknown>)?.display_name ?? ''),
        location: String((r.location as Record<string, unknown>)?.display_name ?? ''),
        salaryMin: typeof r.salary_min === 'number' ? Math.round(r.salary_min) : null,
        salaryMax: typeof r.salary_max === 'number' ? Math.round(r.salary_max) : null,
        currency,
        url: String(r.redirect_url ?? ''),
        created: String(r.created ?? ''),
      }));

      const salaries = jobs.filter((j) => j.salaryMin !== null);
      const avgMin = salaries.length
        ? Math.round(salaries.reduce((s, j) => s + j.salaryMin!, 0) / salaries.length)
        : null;
      const avgMax = salaries.length
        ? Math.round(salaries.reduce((s, j) => s + (j.salaryMax ?? j.salaryMin!), 0) / salaries.length)
        : null;

      return {
        jobs,
        totalCount: typeof json.count === 'number' ? json.count : jobs.length,
        currency,
        avgSalaryMin: avgMin,
        avgSalaryMax: avgMax,
      };
    },
  );
}

export async function refreshJobs(
  countryId: string,
  professionKey: string,
): Promise<CacheResult<AdzunaResult> | null> {
  await bustCache(cacheKey(countryId, professionKey));
  return fetchJobs(countryId, professionKey);
}
