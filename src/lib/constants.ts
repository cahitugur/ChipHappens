export const USUAL_SUSPECTS = [
  'Brian',
  'Cahit',
  'Colm',
  'Cormac',
  'Dillon',
  'Euan',
  'Evangelia',
  'Ferhat',
  'Hannan',
  'James',
  'Kevin',
  'Kunal',
  'Liam',
  'Luke',
  'Marcus',
  'Mic',
  'Muireann',
  'Otto',
  'Patryk',
  'Pawel',
  'Scott',
  'Tuhin',
];

export const DEFAULT_USUAL_SUSPECTS = USUAL_SUSPECTS.map((name) => ({
  name,
  revtag: '',
}));

export const MAX_ROWS = 32;
export const PAYOUT_STORAGE_KEY = 'poker-payout:v1';
export const SIDEPOT_STORAGE_KEY = 'poker-sidepot:v1';
export const SETTINGS_STORAGE_KEY = 'poker-calc-settings';
export const REVOLUT_BASE_URL = 'https://revolut.me';
export const KNOWN_CURRENCIES = ['EUR', 'USD', 'BTC'];
export const VALID_SETTLEMENT_MODES = ['banker', 'greedy'] as const;
export const APP_VERSION = 'Version 2.0';
