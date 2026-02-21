import { PayoutShareData } from '../types';
import { toBase64Url, fromBase64Url } from './encoding';
import { compressString, decompressToString } from './compression';

export async function encodePayoutShareData(
  data: PayoutShareData
): Promise<string> {
  const rows = (data.rows || []).map((row) => [
    row.name || '',
    row.in || '',
    row.out || '',
    row.settled ? 1 : 0,
  ]);
  const compact = { v: 1, b: data.buyIn || '', r: rows };
  const json = JSON.stringify(compact);
  const compressed = await compressString(json);
  if (compressed) return `z${toBase64Url(compressed)}`;
  return `j${toBase64Url(new TextEncoder().encode(json))}`;
}

export async function decodePayoutShareData(
  encoded: string
): Promise<PayoutShareData | null> {
  let mode = encoded[0];
  let payload = encoded;
  if (mode === 'z' || mode === 'j') {
    payload = encoded.slice(1);
  } else {
    mode = 'j';
  }

  try {
    const bytes = fromBase64Url(payload);
    const text =
      mode === 'z'
        ? await decompressToString(bytes)
        : new TextDecoder().decode(bytes);
    if (!text) throw new Error('Decode failed');
    const raw = JSON.parse(text);
    if (raw?.v === 1 && Array.isArray(raw.r)) {
      return {
        rows: raw.r.map((row: (string | number)[]) => ({
          name: row?.[0] ?? '',
          in: row?.[1] ?? '',
          out: row?.[2] ?? '',
          settled: Boolean(row?.[3]),
        })),
        buyIn: raw.b ?? '',
      };
    }
    return raw;
  } catch {
    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(
        Math.ceil(normalized.length / 4) * 4,
        '='
      );
      const raw = JSON.parse(atob(padded));
      return raw;
    } catch {
      return null;
    }
  }
}
