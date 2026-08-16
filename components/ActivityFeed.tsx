'use client';

import { useState, useCallback } from 'react';
import type { ActivityItem } from '@/app/api/github/activity/route';
import { formatRelativeTime } from '@/lib/github';
import { useAutoRefresh } from '@/lib/useAutoRefresh';
import LiveBadge from '@/components/LiveBadge';

const REFRESH_MS = 3 * 60 * 1000; // 3 minutes

interface ActivityFeedProps {
  initialData?: ActivityItem[];
}

function groupByDate(items: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const date = new Date(item.date).toLocaleDateString('en-US', {
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

export default function ActivityFeed({ initialData }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(initialData ? new Date() : null);

  const fetchActivity = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = force ? '/api/github/activity?refresh=1' : '/api/github/activity';
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setItems(json.data || []);
    } catch {
      // Stay silent — keep last data visible, auto-retry via useAutoRefresh
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  // Auto-refresh every 3 min; interval ticks use ?refresh=1 to bypass cache
  useAutoRefresh(fetchActivity, REFRESH_MS);

  const groups = groupByDate(items);
  const displayItems = items.slice(0, 20);

  return (
    <section id="activity" aria-label="Latest GitHub Activity" className="section">
      <div className="section__container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="section__eyebrow">
              <span className="live-dot" aria-hidden="true" />
              <span className="section-label">03 / Activity</span>
            </div>
            <h2 className="section__heading">Latest Commits</h2>
            <p className="section__sub" style={{ marginBottom: 0 }}>Real-time commit feed across repositories</p>
          </div>
          <LiveBadge
            lastUpdated={lastUpdated}
            refreshIntervalSec={REFRESH_MS / 1000}
            loading={loading}
            onRefresh={() => fetchActivity(true)}
          />
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Loading activity">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                  <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
                  <div style={{ width: 1, flex: 1, background: 'var(--bg-raised)', minHeight: 40, marginTop: 4 }} />
                </div>
                <div style={{ flex: 1, paddingBottom: 16 }}>
                  <div className="skeleton" style={{ height: 13, width: '75%', borderRadius: 3, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 11, width: '45%', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-4)' }}>
            No recent activity found.
          </div>
        )}

        {!loading && displayItems.length > 0 && (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 1, background: 'var(--bg-raised)' }} aria-hidden="true" />
            <div>
              {Array.from(groups.entries()).map(([date, dateItems]) => (
                <div key={date}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 14, marginTop: 8 }}>
                    <div style={{ position: 'absolute', left: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }} aria-hidden="true">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-3)', paddingLeft: 40, fontWeight: 500, letterSpacing: '0.04em' }}>{date}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 40, marginBottom: 20 }}>
                    {dateItems.map((item) => (
                      <div key={`${item.repo}-${item.sha}`} className="timeline-entry">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.message}
                          </p>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent)', textDecoration: 'none', flexShrink: 0, transition: 'opacity 0.15s' }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`View commit ${item.sha}`}
                          >
                            {item.sha}
                          </a>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)' }}>
                          <a href={item.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
                            onClick={(e) => e.stopPropagation()}
                          >{item.repo}</a>
                          <span>{item.author}</span>
                          <span>{formatRelativeTime(item.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && items.length > 20 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <a href="/activity" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              View all activity →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
