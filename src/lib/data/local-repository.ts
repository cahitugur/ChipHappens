import { Repository } from './repository';
import { SettingsData } from '../types';
import { DbGameSession, DbGamePlayer } from '../types';
import { getLocalStorage, setLocalStorage } from '../storage/local-storage';
import { SETTINGS_STORAGE_KEY, PAYOUT_STORAGE_KEY, SIDEPOT_STORAGE_KEY } from '../constants';

export const localRepository: Repository = {
  async getSettings() {
    return getLocalStorage<SettingsData>(SETTINGS_STORAGE_KEY);
  },
  async saveSettings(data) {
    setLocalStorage(SETTINGS_STORAGE_KEY, data);
  },
  async getGameSessions() {
    return getLocalStorage<DbGameSession[]>(PAYOUT_STORAGE_KEY) || [];
  },
  async saveGameSession(session) {
    const sessions = getLocalStorage<DbGameSession[]>(PAYOUT_STORAGE_KEY) || [];
    setLocalStorage(PAYOUT_STORAGE_KEY, [...sessions, session]);
  },
  async getGamePlayers(sessionId) {
    const all = getLocalStorage<Record<string, DbGamePlayer[]>>(SIDEPOT_STORAGE_KEY) || {};
    return all[sessionId] || [];
  },
  async saveGamePlayer(player) {
    const all = getLocalStorage<Record<string, DbGamePlayer[]>>(SIDEPOT_STORAGE_KEY) || {};
    const arr = all[player.session_id] || [];
    all[player.session_id] = [...arr, player];
    setLocalStorage(SIDEPOT_STORAGE_KEY, all);
  },
};
