import { SettingsData, UsualSuspect } from '../types';
import { SETTINGS_STORAGE_KEY, KNOWN_CURRENCIES, VALID_SETTLEMENT_MODES } from '../constants';

const SETTINGS_FILENAME = 'poker-calc-settings.json';
const DB_NAME = 'poker-calc-settings-db';
const STORE_NAME = 'file-handles';
const HANDLE_KEY = 'profile-file';

const isMobile = (): boolean =>
  typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const useLocalStorageBackend = (): boolean =>
  typeof window === 'undefined' ||
  isMobile() ||
  !('showSaveFilePicker' in window);

/* ── IndexedDB for file handle storage ── */

const openProfileDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStoredHandle = async (): Promise<any> => {
  if (!('indexedDB' in window)) return null;
  try {
    const db = await openProfileDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storeHandle = async (handle: any): Promise<void> => {
  if (!('indexedDB' in window)) return;
  try {
    const db = await openProfileDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, HANDLE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* ignore storage errors */
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ensureHandlePermission = async (handle: any, mode: string): Promise<boolean> => {
  if (!handle) return false;
  if (!handle.queryPermission) return true;
  const options = { mode };
  let status = await handle.queryPermission(options);
  if (status === 'granted') return true;
  status = await handle.requestPermission(options);
  return status === 'granted';
};

/* ── localStorage backend ── */

const loadSettingsLS = (): SettingsData | null => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSettingsLS = (payload: SettingsData): void => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload, null, 2));
};

/* ── Normalize ── */

export function normalizeSettingsData(
  data: Partial<SettingsData> | null | undefined,
  defaultSuspects: UsualSuspect[] = []
): SettingsData {
  const profile = {
    name: data?.profile?.name ?? '',
    revtag: data?.profile?.revtag ?? '',
  };

  const normalizeSuspect = (item: unknown): UsualSuspect | null => {
    if (!item) return null;
    if (typeof item === 'string') {
      const name = item.trim();
      return name ? { name, revtag: '' } : null;
    }
    const obj = item as Record<string, unknown>;
    const name = String(obj.name ?? '').trim();
    if (!name) return null;
    return { name, revtag: String(obj.revtag ?? '').trim() };
  };

  const list = Array.isArray(data?.usualSuspects)
    ? data.usualSuspects
    : Array.isArray(defaultSuspects)
      ? defaultSuspects
      : [];

  const usualSuspects = (list as unknown[])
    .map(normalizeSuspect)
    .filter((item): item is UsualSuspect => item !== null);

  const rawCurrency = (data?.gameSettings?.currency ?? 'EUR').trim();
  const currency = KNOWN_CURRENCIES.includes(rawCurrency)
    ? rawCurrency
    : rawCurrency || 'EUR';
  const defaultBuyIn = String(data?.gameSettings?.defaultBuyIn ?? '30');
  const rawMode = (data?.gameSettings?.settlementMode ?? 'banker').trim();
  const settlementMode = (VALID_SETTLEMENT_MODES as readonly string[]).includes(rawMode)
    ? (rawMode as 'banker' | 'greedy')
    : 'banker';
  const gameSettings = { currency, defaultBuyIn, settlementMode };

  return { profile, usualSuspects, gameSettings };
}

/* ── Load ── */

export async function loadSettingsData(): Promise<SettingsData | null> {
  if (typeof window === 'undefined') return null;
  if (useLocalStorageBackend()) return loadSettingsLS();

  const handle = await getStoredHandle();
  if (!handle) return loadSettingsLS();
  const ok = await ensureHandlePermission(handle, 'read');
  if (!ok) return loadSettingsLS();
  try {
    const file = await handle.getFile();
    const text = await file.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return loadSettingsLS();
  }
}

/* ── Save ── */

export async function saveSettingsData(payload: SettingsData): Promise<void> {
  if (typeof window === 'undefined') return;

  // Always save to localStorage as backup
  saveSettingsLS(payload);

  if (useLocalStorageBackend()) return;

  let handle = await getStoredHandle();
  if (handle) {
    const ok = await ensureHandlePermission(handle, 'readwrite');
    if (ok) {
      try {
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(payload, null, 2));
        await writable.close();
        return;
      } catch {
        /* fallback to localStorage */
      }
    }
  }

  // Try to get a new handle
  if ('showSaveFilePicker' in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handle = await (window as any).showSaveFilePicker({
        suggestedName: SETTINGS_FILENAME,
        types: [
          { description: 'JSON', accept: { 'application/json': ['.json'] } },
        ],
      });
      const ok = await ensureHandlePermission(handle, 'readwrite');
      if (!ok) return;
      await storeHandle(handle);
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(payload, null, 2));
      await writable.close();
    } catch {
      /* user cancelled or not supported */
    }
  }
}

/* ── Import / Export ── */

export async function openSettingsFileForImport(): Promise<SettingsData | null> {
  if (typeof window === 'undefined') return null;

  if (useLocalStorageBackend()) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.style.display = 'none';
      input.addEventListener('change', async () => {
        try {
          const file = input.files?.[0];
          if (!file) {
            resolve(null);
            return;
          }
          const text = await file.text();
          const data = JSON.parse(text);
          resolve(data);
        } catch {
          reject(new Error('InvalidJSON'));
        } finally {
          document.body.removeChild(input);
        }
      });
      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        resolve(null);
      });
      document.body.appendChild(input);
      input.click();
    });
  }

  if (!('showOpenFilePicker' in window)) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [handle] = await (window as any).showOpenFilePicker({
    types: [
      { description: 'JSON', accept: { 'application/json': ['.json'] } },
    ],
    multiple: false,
  });
  if (!handle) return null;
  await storeHandle(handle);
  const file = await handle.getFile();
  const text = await file.text();
  if (!text) return null;
  return JSON.parse(text);
}

export async function saveSettingsDataAs(payload: SettingsData): Promise<void> {
  if (typeof window === 'undefined') return;

  if (useLocalStorageBackend()) {
    saveSettingsLS(payload);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = SETTINGS_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  if (!('showSaveFilePicker' in window)) {
    throw new Error('FilePickerUnavailable');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handle = await (window as any).showSaveFilePicker({
    suggestedName: SETTINGS_FILENAME,
    types: [
      { description: 'JSON', accept: { 'application/json': ['.json'] } },
    ],
  });
  const ok = await ensureHandlePermission(handle, 'readwrite');
  if (!ok) throw new Error('FilePermissionDenied');
  await storeHandle(handle);
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(payload, null, 2));
  await writable.close();
}
