/* ── Data Models ── */

export interface PayoutRowData {
  id: string;
  name: string;
  buyIn: string;
  cashOut: string;
  settled: boolean;
}

export interface SidePotPlayerData {
  id: string;
  name: string;
  bet: string;
}

export interface CalculatedPot {
  name: string;
  size: number;
  players: string[];
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

/* ── Settings Models ── */

export interface Profile {
  name: string;
  revtag: string;
}

export interface UsualSuspect {
  name: string;
  revtag: string;
}

export interface GameSettings {
  currency: string;
  defaultBuyIn: string;
  settlementMode: 'banker' | 'greedy';
}

export interface SettingsData {
  profile: Profile;
  usualSuspects: UsualSuspect[];
  gameSettings: GameSettings;
}

/* ── Share Data Models ── */

export interface PayoutShareRow {
  name: string;
  in: string;
  out: string;
  settled: boolean;
}

export interface PayoutShareData {
  rows: PayoutShareRow[];
  buyIn: string;
}

export interface SidePotShareRow {
  name: string;
  bet: string;
}

export interface SidePotShareData {
  rows: SidePotShareRow[];
  boards: string;
  initialPot: string;
}

/* ── Payment Link ── */

export interface PaymentLink {
  label: string;
  amount: number;
  link: string;
}
