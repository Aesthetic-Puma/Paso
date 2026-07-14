import { cachedFetch } from './cache';

const TTL_24H = 24 * 60 * 60 * 1000;
const CACHE_KEY = 'exchange_rates_eur';

const CURRENCIES = ['AUD', 'CAD', 'JPY', 'NZD', 'SGD', 'BRL', 'USD', 'KRW', 'AED', 'EUR'] as const;
type CurrencyCode = (typeof CURRENCIES)[number];

export type Rates = Record<CurrencyCode, number>;

// Regex matches amounts like "1 200 AUD", "310€", "2 000 SGD"
const AMT_RE = /(\d[\d\s]*(?:[.,]\d+)?)\s*(AUD|CAD|JPY|NZD|SGD|BRL|USD|KRW|AED)/gi;

export async function getExchangeRates(): Promise<Rates | null> {
  const result = await cachedFetch<Rates>(
    CACHE_KEY,
    TTL_24H,
    async () => {
      const res = await fetch(
        'https://api.frankfurter.app/latest?from=EUR&to=AUD,CAD,JPY,NZD,SGD,BRL,USD,KRW,AED',
      );
      if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
      const json = await res.json();
      const rates: Rates = { ...json.rates, EUR: 1 };
      return rates;
    },
  );
  return result ? result.data : null;
}

export function convertToEUR(amount: number, fromCurrency: string, rates: Rates): number {
  const code = fromCurrency.toUpperCase() as CurrencyCode;
  const rate = rates[code];
  if (!rate) return amount;
  return Math.round(amount / rate);
}

export function fmtEUR(amount: number): string {
  return `≈ ${amount.toLocaleString('fr-FR')} €`;
}

/** Append "≈ X €" after currency amounts found in a string. */
export function enrichWithEUR(text: string, rates: Rates | null): string {
  if (!rates) return text;
  return text.replace(AMT_RE, (match, numStr, currency) => {
    const num = parseFloat(numStr.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(num)) return match;
    const eur = convertToEUR(num, currency, rates);
    return `${match} (${fmtEUR(eur)})`;
  });
}
