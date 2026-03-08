import { supabase } from '../supabase/client';
import type { LeaderboardRow, PlayerStats } from '../types';

/**
 * Fetches player stats for a user, optionally filtered by group and date range.
 * Returns one row per (user_id, group_id). Pass groupId undefined/null for all groups.
 * On error returns empty array.
 */
export async function getPlayerStats(
  userId: string,
  groupId?: string | null,
  fromDate?: string,
  toDate?: string
): Promise<PlayerStats[]> {
  const { data, error } = await supabase.rpc('get_player_stats', {
    p_user_id: userId,
    p_group_id: groupId ?? null,
    p_from_date: fromDate ?? null,
    p_to_date: toDate ?? null,
  });
  if (error) return [];
  const rows = (data ?? []) as Array<{
    user_id: string;
    group_id: string | null;
    total_sessions: number | string;
    total_profit: number | string;
    biggest_win: number | string;
    biggest_loss: number | string;
    win_count: number | string;
    loss_count: number | string;
    avg_profit: number | string;
    last_played: string | null;
  }>;
  return rows.map((r) => ({
    user_id: r.user_id,
    group_id: r.group_id ?? null,
    total_sessions: Number(r.total_sessions),
    total_profit: Number(r.total_profit),
    biggest_win: Number(r.biggest_win),
    biggest_loss: Number(r.biggest_loss),
    win_count: Number(r.win_count),
    loss_count: Number(r.loss_count),
    avg_profit: Number(r.avg_profit),
    last_played: r.last_played ?? null,
  }));
}

/**
 * Fetches leaderboard rows for a group, optionally filtered by date range.
 * Requires the current user to be a member of the group (RLS on game_sessions).
 */
export async function getGroupLeaderboard(
  groupId: string,
  fromDate?: string,
  toDate?: string
): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('get_group_leaderboard', {
    p_group_id: groupId,
    p_from_date: fromDate || null,
    p_to_date: toDate || null,
  });
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    user_id: string;
    display_name: string | null;
    total_profit: number;
    total_sessions: number;
    win_count: number;
    loss_count: number;
  }>;
  return rows.map((r) => ({
    user_id: r.user_id,
    display_name: r.display_name ?? '',
    total_profit: Number(r.total_profit),
    total_sessions: Number(r.total_sessions),
    win_count: Number(r.win_count),
    loss_count: Number(r.loss_count),
  }));
}
