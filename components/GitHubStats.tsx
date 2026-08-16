'use client';

import { useEffect, useRef, useState } from 'react';
import type { GitHubUser, GitHubRepository } from '@/types/github';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface StatsProps {
  user: GitHubUser | null;
  repos: GitHubRepository[];
  loading?: boolean;
}

function AnimatedNumber({ value, loading }: { value: number; loading?: boolean }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (loading || value === 0) { setDisplay(value); return; }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = ref.current;
    const diff = value - start;
    const duration = 900;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      ref.current = current;
      if (progress < 1) rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, loading]);

  if (loading) return <div className="skeleton" style={{ height: 28, width: 48, borderRadius: 4 }} />;

  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.625rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
      {display.toLocaleString()}
    </span>
  );
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}

export default function GitHubStats({ user, repos, loading }: StatsProps) {
  const sectionRef = useScrollReveal<HTMLElement>();
  const gridRef = useScrollReveal<HTMLDivElement>(0.05);
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
  const totalIssues = repos.reduce((sum, r) => sum + r.open_issues_count, 0);
  const sortedByStars = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
  const mostStarred = sortedByStars[0];

  const stats: StatCard[] = [
    {
      label: 'Repositories',
      value: user?.public_repos ?? repos.length,
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Followers',
      value: user?.followers ?? 0,
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Following',
      value: user?.following ?? 0,
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Stars',
      value: totalStars,
      accent: true,
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      label: 'Total Forks',
      value: totalForks,
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
    },
    {
      label: 'Open Issues',
      value: totalIssues,
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <section ref={sectionRef} id="stats" aria-label="GitHub Statistics" className="section reveal-up">
      <div className="section__container">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, gap: 16 }}>
          <div>
            <div className="section__eyebrow">
              <span className="live-dot" aria-hidden="true" />
              <span className="section-label">01 / Stats</span>
            </div>
            <h2 className="section__heading">Engineering Footprint</h2>
            <p className="section__sub" style={{ marginBottom: 0 }}>
              Live metrics from GitHub
            </p>
          </div>
          {!loading && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }}>
              <span style={{ color: 'var(--accent)' }}>●</span>
              LIVE DATA
            </span>
          )}
        </div>

        {/* Stat cards */}
        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginBottom: 16
        }}
          className="stats-grid stagger"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`stat-card ${stat.accent ? 'stat-card--accent animated-border spotlight-card' : 'spotlight-card'}`}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--card-x', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--card-y', `${e.clientY - r.top}px`);
              }}
            >
              <div style={{ color: stat.accent ? 'var(--accent)' : 'var(--text-3)', marginBottom: 12 }}>
                {stat.icon}
              </div>
              <AnimatedNumber value={stat.value} loading={loading} />
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-3)',
                marginTop: 6,
                fontWeight: 500
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Highlight row */}
        {!loading && repos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {mostStarred && (
              <div className="stat-card">
                <p className="section-label" style={{ marginBottom: 8 }}>Most Starred</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {mostStarred.name}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>
                  ★ {mostStarred.stargazers_count.toLocaleString()}
                </p>
              </div>
            )}
            {(() => {
              const recent = [...repos].sort(
                (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
              )[0];
              return recent ? (
                <div className="stat-card">
                  <p className="section-label" style={{ marginBottom: 8 }}>Recently Active</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {recent.name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>
                    {new Date(recent.pushed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ) : null;
            })()}
            {(() => {
              const languages = new Set(repos.filter((r) => r.language).map((r) => r.language));
              return (
                <div className="stat-card">
                  <p className="section-label" style={{ marginBottom: 8 }}>Languages Used</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.625rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {languages.size}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginTop: 6 }}>
                    distinct
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(6, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
