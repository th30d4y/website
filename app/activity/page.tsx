'use client';

import { useEffect, useState, useCallback } from 'react';
import type { NormalizedActivity } from '@/types/github';
import { formatRelativeTime } from '@/lib/github';

const EVENT_COLORS: Record<string, string> = {
  PushEvent: 'var(--accent)',
  PullRequestEvent: '#a78bfa',
  IssuesEvent: '#fb923c',
  CreateEvent: 'var(--cyan)',
  ForkEvent: '#facc15',
  WatchEvent: '#f472b6',
  DeleteEvent: '#f87171',
  ReleaseEvent: '#34d399',
  IssueCommentEvent: '#fb923c',
  PullRequestReviewEvent: '#a78bfa',
};

function getEventColor(type: string): string {
  return EVENT_COLORS[type] ?? 'var(--text-3)';
}

function groupByDate(items: NormalizedActivity[]): Map<string, NormalizedActivity[]> {
  const groups = new Map<string, NormalizedActivity[]>();
  for (const item of items) {
    const date = new Date(item.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const existing = groups.get(date) || [];
    existing.push(item);
    groups.set(date, existing);
  }
  return groups;
}

function EventIcon({ type }: { type: string }) {
  const color = getEventColor(type);
  return (
    <div style={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: `${color}18`,
      border: `1px solid ${color}40`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontSize: '0.6875rem',
      color,
      fontWeight: 700,
    }} aria-hidden="true">
      {type === 'PushEvent' && '↑'}
      {type === 'PullRequestEvent' && '⤷'}
      {type === 'IssuesEvent' && '◎'}
      {type === 'CreateEvent' && '✦'}
      {type === 'ForkEvent' && '⑂'}
      {type === 'WatchEvent' && '★'}
      {type === 'DeleteEvent' && '✕'}
      {type === 'ReleaseEvent' && '◈'}
      {type === 'IssueCommentEvent' && '◇'}
      {!Object.keys(EVENT_COLORS).includes(type) && '◈'}
    </div>
  );
}

export default function ActivityPage() {
  const [items, setItems] = useState<NormalizedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [repoFilter, setRepoFilter] = useState<string>('all');

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/github/events');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
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

  // Build filter options from actual data
  const allTypes = Array.from(
    new Set(items.map((i) => i.type).filter((t): t is string => !!t))
  ).sort();
  const allRepos = Array.from(new Set(items.map((i) => i.repo))).sort();

  const filtered = items.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (repoFilter !== 'all' && item.repo !== repoFilter) return false;
    return true;
  });

  const groups = groupByDate(filtered);

  const eventTypeLabel = (type: string) =>
    type.replace('Event', '').replace(/([A-Z])/g, ' $1').trim();

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64 }}>
      <div className="section__container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="section__eyebrow">
              <span className="live-dot" aria-hidden="true" />
              <span className="section-label">Activity</span>
            </div>
            <h1 className="section__heading" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 4 }}>
              GitHub Activity
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
              {loading ? 'Loading events…' : `${items.length} events from the last 90 days`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-3)', flexShrink: 0 }}>
            {lastUpdated && (
              <span style={{ color: 'var(--text-4)' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchActivity}
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
              aria-label="Refresh activity"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {!loading && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {/* Type filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} role="group" aria-label="Filter by event type">
              {['all', ...allTypes].map((type) => {
                const count = type === 'all' ? items.length : items.filter((i) => i.type === type).length;
                const active = typeFilter === type;
                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type === typeFilter && type !== 'all' ? 'all' : type)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 100,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      letterSpacing: '0.06em',
                      border: `1px solid ${active ? (type !== 'all' ? getEventColor(type) + '60' : 'var(--accent)') : 'var(--border)'}`,
                      background: active ? (type !== 'all' ? getEventColor(type) + '12' : 'rgba(0,232,122,0.08)') : 'transparent',
                      color: active ? (type !== 'all' ? getEventColor(type) : 'var(--accent)') : 'var(--text-3)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    aria-pressed={active}
                  >
                    {type === 'all' ? `All (${count})` : `${eventTypeLabel(type)} (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Repo filter — only show if multiple repos */}
            {allRepos.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} role="group" aria-label="Filter by repository">
                {['all', ...allRepos].map((repo) => {
                  const count = repo === 'all' ? filtered.length : items.filter((i) => i.repo === repo).length;
                  const active = repoFilter === repo;
                  return (
                    <button
                      key={repo}
                      onClick={() => setRepoFilter(repo === repoFilter && repo !== 'all' ? 'all' : repo)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 100,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        border: `1px solid ${active ? 'var(--border-hi)' : 'var(--border)'}`,
                        background: active ? 'var(--bg-raised)' : 'transparent',
                        color: active ? 'var(--text)' : 'var(--text-4)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      aria-pressed={active}
                    >
                      {repo === 'all' ? `All repos (${items.length})` : `${repo} (${count})`}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginBottom: 16 }}>{error}</p>
            <button
              onClick={fetchActivity}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} aria-label="Loading activity">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                  <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  <div style={{ width: 1, flex: 1, background: 'var(--bg-raised)', minHeight: 32, marginTop: 4 }} />
                </div>
                <div style={{ flex: 1, paddingBottom: 12 }}>
                  <div className="skeleton" style={{ height: 13, width: '20%', borderRadius: 3, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 13, width: '70%', borderRadius: 3, marginBottom: 5 }} />
                  <div className="skeleton" style={{ height: 11, width: '40%', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-4)' }}>
            {typeFilter !== 'all' || repoFilter !== 'all' ? (
              <>
                <p style={{ marginBottom: 12 }}>No events match the current filter.</p>
                <button
                  onClick={() => { setTypeFilter('all'); setRepoFilter('all'); }}
                  style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textDecoration: 'underline' }}
                >
                  Clear filters
                </button>
              </>
            ) : (
              <p>No activity found.</p>
            )}
          </div>
        )}

        {/* Timeline */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 1, background: 'var(--bg-raised)' }} aria-hidden="true" />

            {Array.from(groups.entries()).map(([date, dateItems]) => (
              <div key={date} style={{ marginBottom: 28 }}>
                {/* Date header */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ position: 'absolute', left: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-2)', paddingLeft: 44, letterSpacing: '0.04em' }}>
                    {date}
                  </span>
                </div>

                {/* Events for this date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 44 }}>
                  {dateItems.map((item) => (
                    <div key={item.id} className="timeline-entry">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <EventIcon type={item.type} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Row: repo + event type + sha/link */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <a
                              href={item.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', transition: 'opacity 0.15s', flexShrink: 0 }}
                            >
                              {item.repo}
                            </a>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-3)' }}>
                              {item.title}
                            </span>
                          </div>
                          {item.detail && (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.45, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.detail}
                            </p>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-4)' }}>
                            <time dateTime={item.date} title={new Date(item.date).toLocaleString()}>
                              {formatRelativeTime(item.date)}
                            </time>
                            <span>·</span>
                            <span>{item.actor}</span>
                            {item.url && item.url !== item.repoUrl && (
                              <>
                                <span>·</span>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
                                >
                                  view ↗
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)', paddingLeft: 44, marginTop: 8 }}>
              Showing {filtered.length} of {items.length} events
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
