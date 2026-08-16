'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ActivityItem } from '@/app/api/github/activity/route';
import { formatRelativeTime, formatDate } from '@/lib/github';

function groupByDate(items: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const date = formatDate(item.date);
    const existing = groups.get(date) || [];
    existing.push(item);
    groups.set(date, existing);
  }
  return groups;
}

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [repoFilter, setRepoFilter] = useState<string>('all');

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/github/activity');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setItems(json.data || []);
      setLastUpdated(new Date());
    } catch {
      setError('GitHub activity is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const repos = Array.from(new Set(items.map((i) => i.repo)));
  const filtered = repoFilter === 'all' ? items : items.filter((i) => i.repo === repoFilter);
  const groups = groupByDate(filtered);

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" aria-hidden="true" />
            <span className="section-label">Activity</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Commit Activity</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                Recent commits across all repositories
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#4b5563]">
              {lastUpdated && (
                <span>{formatRelativeTime(lastUpdated.toISOString())}</span>
              )}
              <button
                onClick={fetchActivity}
                className="flex items-center gap-1 text-[#6b7280] hover:text-white transition-colors"
              >
                <span className={loading ? 'animate-spin' : ''}>↻</span>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Repo filter */}
        {!loading && repos.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setRepoFilter('all')}
              className={`px-3 py-1 rounded-full font-mono text-xs border transition-colors ${
                repoFilter === 'all'
                  ? 'bg-[#00e87a] text-black border-[#00e87a]'
                  : 'border-[#1e1e1e] text-[#6b7280] hover:border-[#2a2a2a] hover:text-white'
              }`}
            >
              All repos
            </button>
            {repos.map((repo) => (
              <button
                key={repo}
                onClick={() => setRepoFilter(repoFilter === repo ? 'all' : repo)}
                className={`px-3 py-1 rounded-full font-mono text-xs border transition-colors ${
                  repoFilter === repo
                    ? 'bg-[#141414] border-[#2a2a2a] text-white'
                    : 'border-[#1e1e1e] text-[#6b7280] hover:border-[#2a2a2a] hover:text-white'
                }`}
              >
                {repo}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 border border-[#1e1e1e] rounded-lg">
            <p className="text-[#6b7280] text-sm mb-4">{error}</p>
            <button
              onClick={fetchActivity}
              className="font-mono text-xs text-[#00e87a] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full skeleton" />
                  <div className="w-px flex-1 bg-[#141414] mt-1" />
                </div>
                <div className="pb-4 flex-1">
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-[#4b5563] font-mono text-sm">
            No activity found.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-[#1a1a1a]" aria-hidden="true" />

            {Array.from(groups.entries()).map(([date, dateItems]) => (
              <div key={date} className="mb-8">
                {/* Date marker */}
                <div className="relative flex items-center mb-4">
                  <div className="absolute left-0 w-6 h-6 rounded-full bg-[#0f0f0f] border border-[#1e1e1e] flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e87a]" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#9ca3af] pl-10">
                    {date}
                  </span>
                </div>

                {/* Commits */}
                <div className="pl-10 space-y-2">
                  {dateItems.map((item) => (
                    <div
                      key={`${item.repo}-${item.sha}`}
                      className="p-4 border border-[#141414] bg-[#0a0a0a] rounded-lg hover:border-[#1e1e1e] transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-sm text-white font-medium leading-snug">
                          {item.message}
                        </p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-[#00e87a] hover:underline flex-shrink-0"
                          aria-label={`View commit ${item.sha}`}
                        >
                          {item.sha}
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#4b5563]">
                        <a
                          href={item.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6b7280] hover:text-white transition-colors"
                        >
                          {item.repo}
                        </a>
                        <span>{item.author}</span>
                        <span>{formatRelativeTime(item.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-center font-mono text-xs text-[#4b5563] pl-10 mt-4">
              Showing {filtered.length} commits
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
