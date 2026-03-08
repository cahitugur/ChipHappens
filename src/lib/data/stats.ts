import { supabase } from '../supabase/client';
import type { LeaderboardRow } from '../types';

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
