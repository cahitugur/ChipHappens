import { SettingsData } from '../types';
import { DbGameSession, DbGamePlayer } from '../types';

export interface Repository {
  getSettings(): Promise<SettingsData | null>;
  saveSettings(data: SettingsData): Promise<void>;
  getGameSessions(): Promise<DbGameSession[]>;
  saveGameSession(session: DbGameSession): Promise<void>;
  getGamePlayers(sessionId: string): Promise<DbGamePlayer[]>;
  saveGamePlayer(player: DbGamePlayer): Promise<void>;
}
