import { Repository } from './repository';
import { supabase } from '../supabase/client';
import { SettingsData, DbGameSession, DbGamePlayer } from '../types';

export const cloudRepository: Repository = {
  async getSettings() {
    // TODO: fetch from Supabase 'profiles' table for current user
    return null;
  },
  async saveSettings(data: SettingsData) {
    // TODO: upsert to Supabase 'profiles' table for current user
  },
  async getGameSessions() {
    // TODO: fetch from Supabase 'game_sessions' table for current user
    return [];
  },
  async saveGameSession(session: DbGameSession) {
    // TODO: insert into Supabase 'game_sessions' table
  },
  async getGamePlayers(sessionId: string) {
    // TODO: fetch from Supabase 'game_players' table by session_id
    return [];
  },
  async saveGamePlayer(player: DbGamePlayer) {
    // TODO: insert into Supabase 'game_players' table
  },
};
