/** French-locale number formatting: "203 358" */
export function formatMoney(amount: number, currency: string): string {
  return `${Math.round(amount).toLocaleString('fr-FR')} ${currency}`;
}

/** Round to nearest 1 000 and prefix with ≈ for EUR equivalents */
export function formatEUR(eurAmount: number): string {
  const rounded = Math.round(eurAmount / 1000) * 1000;
  return `≈ ${rounded.toLocaleString('fr-FR')} €`;
}

/** "203 358 USD/an ≈ 187 000 €/an" */
export function formatSalaryWithEUR(
  amount: number,
  currency: string,
  rate: number | null,
  period = 'an',
): string {
  const local = `${formatMoney(amount, currency)}/${period}`;
  if (!rate || currency === 'EUR') return local;
  const eur = formatEUR(amount / rate);
  return `${local} ${eur}/${period}`;
}
