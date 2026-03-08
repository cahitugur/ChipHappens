'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useGroups } from '@/hooks/useGroups';
import { useGameHistory } from '@/hooks/useGameHistory';

function formatSessionDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch {
    return iso;
  }
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { groups } = useGroups();
  const { sessions, loading, error, filters, setFilters, reload } = useGameHistory();

  const getGroupName = (groupId: string | null): string => {
    if (!groupId) return 'No group';
    const g = groups.find((x) => x.id === groupId);
    return g?.name ?? groupId;
  };

  if (authLoading) {
    return (
      <div className="app-shell">
        <main className="app-main max-w-md mx-auto text-center py-10 px-4">
          <p className="muted-text">Loading…</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <main className="app-main max-w-md mx-auto text-center py-10 px-4">
          <h1 className="text-xl font-semibold mb-2">History</h1>
          <p className="muted-text mb-4">Sign in to see history.</p>
          <Link href="/" className="btn btn-primary">
            Go to calculator
          </Link>
          <p className="mt-4">
            <Link href="/" className="text-sm muted-text underline">
              Settings
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="app-main max-w-md mx-auto py-10 px-4">
        <h1 className="text-xl font-semibold mb-4">History</h1>

        {/* Filter bar */}
        <div className="space-y-3 mb-6">
          <label className="settings-field block">
            <span className="settings-label">Group</span>
            <select
              className="input-field w-full"
              value={filters.groupId ?? ''}
              onChange={(e) => setFilters({ groupId: e.target.value || null })}
            >
              <option value="">All groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="settings-field block">
              <span className="settings-label">From date</span>
              <input
                className="input-field w-full"
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ fromDate: e.target.value })}
              />
            </label>
            <label className="settings-field block">
              <span className="settings-label">To date</span>
              <input
                className="input-field w-full"
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ toDate: e.target.value })}
              />
            </label>
          </div>
          <button type="button" className="btn btn-secondary" onClick={reload} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {loading && sessions.length === 0 ? (
          <p className="muted-text">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="muted-text">No sessions found.</p>
        ) : (
          <div className="settings-list">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/history/${session.id}`}
                className="settings-item-btn w-full text-left flex flex-col items-stretch no-underline text-inherit"
              >
                <span className="font-medium">{formatSessionDate(session.session_date)}</span>
                <span className="settings-item-meta">
                  {getGroupName(session.group_id)} · {session.currency}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
