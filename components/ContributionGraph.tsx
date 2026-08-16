'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ActivityItem } from '@/app/api/github/activity/route';

interface DayData {
  date: string;
  count: number;
}

function buildHeatmapFromActivity(items: ActivityItem[]): DayData[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    const day = item.date.slice(0, 10); // YYYY-MM-DD
    counts.set(day, (counts.get(day) || 0) + 1);
  }

  // Build last 52 weeks (364 days)
  const days: DayData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: counts.get(key) || 0 });
  }

  return days;
}

function getColor(count: number, max: number): string {
  if (count === 0) return '#141414';
  const intensity = Math.min(count / Math.max(max, 1), 1);
  if (intensity < 0.25) return '#0a3d24';
  if (intensity < 0.5) return '#0d6d3d';
  if (intensity < 0.75) return '#00a854';
  return '#00e87a';
}

interface TooltipState {
  date: string;
  count: number;
  x: number;
  y: number;
}

export default function ContributionGraph() {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/github/activity');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const heatmap = buildHeatmapFromActivity(json.data || []);
      setDays(heatmap);
    } catch {
      // Build empty heatmap on error
      setDays(buildHeatmapFromActivity([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const totalContributions = days.reduce((sum, d) => sum + d.count, 0);

  // Group by weeks
  const weeks: DayData[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthLabels = (() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const date = new Date(week[0].date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        labels.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: wi,
        });
        lastMonth = month;
      }
    });
    return labels;
  })();

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <section id="contributions" aria-label="Contribution Graph" className="section">
      <div className="section__container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <div className="section__eyebrow">
              <span className="live-dot" aria-hidden="true" />
              <span className="section-label">04 / Graph</span>
            </div>
            <h2 className="section__heading">Contribution Graph</h2>
            <p className="section__sub" style={{ marginBottom: 0 }}>Commit activity over the past year</p>
          </div>
          {!loading && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)' }}>
              {totalContributions} commits tracked
            </span>
          )}
        </div>

        <div style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', overflowX: 'auto' }}>
          {loading ? (
            <div className="skeleton" style={{ height: 128, borderRadius: 'var(--radius)' }} aria-label="Loading contribution graph" />
          ) : (
            <div className="relative">
              {/* Month labels */}
              <div className="flex mb-2 ml-8">
                {monthLabels.map(({ month, weekIndex }) => (
                  <div
                    key={`${month}-${weekIndex}`}
                    className="font-mono text-xs text-[#4b5563]"
                    style={{
                      position: 'absolute',
                      left: `${weekIndex * 13 + 32}px`,
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              <div className="flex gap-1 mt-6">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 mr-1">
                  {dayLabels.map((day, i) => (
                    <div
                      key={day}
                      className="font-mono text-xs text-[#4b5563] h-[11px] leading-none"
                      style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="flex gap-0.5">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                      {week.map((day, di) => (
                        <div
                          key={day.date}
                          className="w-[11px] h-[11px] rounded-sm heatmap-cell cursor-default"
                          style={{ backgroundColor: getColor(day.count, maxCount) }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              date: day.date,
                              count: day.count,
                              x: rect.left,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          aria-label={`${day.count} contributions on ${day.date}`}
                          role="gridcell"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="font-mono text-xs text-[#4b5563]">Less</span>
                {['#141414', '#0a3d24', '#0d6d3d', '#00a854', '#00e87a'].map((color) => (
                  <div
                    key={color}
                    className="w-[11px] h-[11px] rounded-sm"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                ))}
                <span className="font-mono text-xs text-[#4b5563]">More</span>
              </div>
            </div>
          )}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: 'fixed',
              zIndex: 50,
              padding: '8px 12px',
              background: 'var(--bg-float)',
              border: '1px solid var(--border-hi)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              pointerEvents: 'none',
              left: tooltip.x + 14,
              top: tooltip.y - 44,
              boxShadow: 'var(--shadow-float)',
            }}
            role="tooltip"
          >
            <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}>
              {tooltip.count} contribution{tooltip.count !== 1 ? 's' : ''}
            </div>
            <div style={{ color: 'var(--text-3)' }}>
              {new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
