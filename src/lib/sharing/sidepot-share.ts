import { SidePotShareData } from '../types';
import { toBase64Url, fromBase64Url } from './encoding';
import { compressString, decompressToString } from './compression';

export async function encodeSidePotShareData(
  data: SidePotShareData
): Promise<string> {
  const rows = (data.rows || []).map((row) => [row.name || '', row.bet || '']);
  const compact = {
    v: 1,
    b: data.boards || '1',
    i: data.initialPot || '0',
    r: rows,
  };
  const json = JSON.stringify(compact);
  const compressed = await compressString(json);
  if (compressed) return `z${toBase64Url(compressed)}`;
  return `j${toBase64Url(new TextEncoder().encode(json))}`;
}

export async function decodeSidePotShareData(
  encoded: string
): Promise<SidePotShareData | null> {
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
        rows: raw.r.map((row: string[]) => ({
          name: row?.[0] ?? '',
          bet: row?.[1] ?? '',
        })),
        boards: raw.b ?? '1',
        initialPot: raw.i ?? '0',
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
