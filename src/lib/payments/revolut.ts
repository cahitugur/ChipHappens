import { REVOLUT_BASE_URL } from '../constants';

export function normalizeRevtag(value: string | null | undefined): string {
  return String(value || '').trim();
}

export function revtagToSlug(revtag: string): string {
  return normalizeRevtag(revtag).replace(/^@/, '');
}

export function buildRevolutLink(
  revtag: string,
  amount: number,
  currency: string
): string {
  const slug = revtagToSlug(revtag);
  if (!slug) return '';
  const cents = Math.round(amount * 100);
  return `${REVOLUT_BASE_URL}/${encodeURIComponent(slug)}?currency=${currency}&amount=${cents}`;
}
