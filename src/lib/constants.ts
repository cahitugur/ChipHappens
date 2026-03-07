export const MAX_ROWS = 32;
export const PAYOUT_STORAGE_KEY = 'poker-payout:v1';
export const SIDEPOT_STORAGE_KEY = 'poker-sidepot:v1';
export const SETTINGS_STORAGE_KEY = 'poker-calc-settings';
export const SESSIONS_STORAGE_KEY = 'poker-sessions:v1';
export const SESSION_PLAYERS_STORAGE_KEY = 'poker-session-players:v1';
export const REVOLUT_BASE_URL = 'https://revolut.me';
export const KNOWN_CURRENCIES = ['EUR', 'USD', 'BTC'];
export const VALID_SETTLEMENT_MODES = ['banker', 'greedy'] as const;
export const APP_VERSION = 'Version 2.0';
export const MIGRATION_FLAG_KEY = 'poker-migrated:v1';
/** Base path for the app (must match next.config basePath). Used for invite links. */
export const BASE_PATH = '/ChipHappens';

/**
 * Origin (protocol + host) for invite and other share links. Set NEXT_PUBLIC_SITE_URL in env
 * (e.g. https://cahitugur.github.io) so invite links never use localhost. If unset, falls back to
 * current origin in the browser.
 */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}
