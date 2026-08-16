'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { GitHubMember, GitHubOrg, GitHubUser } from '@/types/github';
import { GITHUB_USERNAME } from '@/lib/github';
import { useAutoRefresh } from '@/lib/useAutoRefresh';
import LiveBadge from '@/components/LiveBadge';

type OrgData = GitHubOrg | GitHubUser | null;

const GH = 'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z';

/* ─── Member card ─────────────────────────────────────────────────────────── */
function MemberCard({ member, rank }: { member: GitHubMember; rank: number }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      transition: 'border-color 0.18s, transform 0.18s, box-shadow 0.18s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hi)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}>
      {/* Card top — accent strip */}
      <div style={{ height: 3, background: rank === 0 ? 'linear-gradient(90deg, var(--accent), var(--cyan))' : 'var(--bg-raised)' }} />

      <div style={{ padding: '20px 22px' }}>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          <div style={{
            padding: '2px',
            borderRadius: '50%',
            background: rank === 0
              ? 'linear-gradient(135deg, rgba(0,232,122,0.45), rgba(34,211,238,0.2))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent)',
            flexShrink: 0,
          }}>
            <Image
              src={member.avatar_url}
              alt={member.name || member.login}
              width={52}
              height={52}
              style={{ borderRadius: '50%', display: 'block', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {member.name && member.name !== member.login ? (
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {member.name}
              </p>
            ) : null}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: 4 }}>
              @{member.login}
            </p>
            {rank === 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.2)', padding: '2px 7px', borderRadius: 100 }}>
                owner
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', lineHeight: 1.55, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {member.bio}
          </p>
        )}

        {/* Meta stats */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--bg-raised)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 14 }}>
          {[
            { label: 'repos', value: member.public_repos },
            { label: 'followers', value: member.followers },
          ].map((m, i) => m.value !== undefined ? (
            <div key={m.label} style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: 3, letterSpacing: '-0.02em' }}>
                {(m.value as number).toLocaleString()}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-4)' }}>
                {m.label}
              </p>
            </div>
          ) : null)}
        </div>

        {/* Location + company */}
        {(member.location || member.company || member.blog) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
            {member.location && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>📍</span> {member.location}
              </span>
            )}
            {member.company && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>🏢</span> {member.company}
              </span>
            )}
            {member.blog && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span>🔗</span> {member.blog}
              </span>
            )}
          </div>
        )}

        {/* Profile link */}
        <a
          href={member.html_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '9px 0',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-3)',
            textDecoration: 'none',
            transition: 'border-color 0.15s, color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(0,232,122,0.3)';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.background = 'rgba(0,232,122,0.06)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-3)';
            e.currentTarget.style.background = 'var(--bg-raised)';
          }}
        >
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d={GH} /></svg>
          View Profile
        </a>
      </div>
    </div>
  );
}

/* ─── Skeleton card ───────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <div style={{ height: 3, background: 'var(--bg-raised)' }} />
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 14, width: '55%', borderRadius: 4, marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 11, width: '40%', borderRadius: 3 }} />
          </div>
        </div>
        <div className="skeleton" style={{ height: 11, width: '90%', borderRadius: 3, marginBottom: 5 }} />
        <div className="skeleton" style={{ height: 11, width: '70%', borderRadius: 3, marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 48, borderRadius: 'var(--radius)', marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 34, borderRadius: 'var(--radius)' }} />
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function TeamPage() {
  const [org, setOrg] = useState<OrgData>(null);
  const [members, setMembers] = useState<GitHubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFirstLoad = useRef(true);

  const isOrg = org && 'type' in org && (org as GitHubOrg).type === 'Organization';

  const fetchAll = useCallback(async (force = false) => {
    // Only show loading spinner on first load or manual refresh
    if (isFirstLoad.current || force) setLoading(true);
    setError(null);

    const refreshParam = force ? '?refresh=1' : '';

    try {
      const [orgRes, membersRes] = await Promise.allSettled([
        fetch(`/api/github/org${refreshParam}`).then(r => r.json()),
        fetch(`/api/github/org/members${refreshParam}`).then(r => r.json()),
      ]);

      if (orgRes.status === 'fulfilled' && orgRes.value?.data) {
        setOrg(orgRes.value.data);
      }
      if (membersRes.status === 'fulfilled' && membersRes.value?.data) {
        setMembers(membersRes.value.data);
        setLastUpdated(new Date());
      } else if (membersRes.status === 'fulfilled' && membersRes.value?.error) {
        setError(membersRes.value.error);
      }
    } catch {
      setError('GitHub data temporarily unavailable.');
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  // Auto-refresh every 5 minutes
  useAutoRefresh(fetchAll, REFRESH_INTERVAL);

  const handleManualRefresh = () => fetchAll(true);

  const totalStars = 'N/A'; // Would need repos data
  const totalRepos = (org as GitHubUser | null)?.public_repos ?? null;
  const totalFollowers = (org as GitHubUser | null)?.followers ?? null;

  const stats = [
    { label: 'Members', value: loading ? null : members.length > 0 ? members.length : '—' },
    { label: 'Repositories', value: loading ? null : totalRepos !== null ? totalRepos : '—' },
    { label: 'Followers', value: loading ? null : totalFollowers !== null ? totalFollowers : '—' },
    { label: 'Type', value: loading ? null : isOrg ? 'Org' : 'Personal' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64 }}>
      {/* Grid bg */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%,black,transparent)', pointerEvents: 'none', zIndex: 0 }} aria-hidden="true" />

      <div className="section__container" style={{ position: 'relative', zIndex: 1, paddingTop: 48, paddingBottom: 96 }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div className="section__eyebrow">
              <span className="live-dot" aria-hidden="true" />
              <span className="section-label">Organization</span>
            </div>
            <LiveBadge
              lastUpdated={lastUpdated}
              refreshIntervalSec={REFRESH_INTERVAL / 1000}
              loading={loading}
              onRefresh={handleManualRefresh}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
            {/* Avatar */}
            {loading ? (
              <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 18, flexShrink: 0 }} />
            ) : org?.avatar_url ? (
              <div style={{ padding: 3, borderRadius: 20, background: 'linear-gradient(135deg,rgba(0,232,122,0.35),rgba(34,211,238,0.15))', flexShrink: 0 }}>
                <Image
                  src={org.avatar_url}
                  alt={`${GITHUB_USERNAME} avatar`}
                  width={72}
                  height={72}
                  style={{ display: 'block', borderRadius: 17, border: '1px solid rgba(255,255,255,0.06)' }}
                  priority
                />
              </div>
            ) : null}

            <div>
              <h1 style={{ fontSize: 'clamp(1.75rem,5vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 6 }}>
                {GITHUB_USERNAME}
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-3)', marginBottom: 14, maxWidth: 560, lineHeight: 1.6 }}>
                {loading ? (
                  <span className="skeleton" style={{ display: 'block', height: 20, width: 360, borderRadius: 4 }} />
                ) : (
                  (org as GitHubOrg)?.description ||
                  (org as GitHubUser)?.bio ||
                  'Open-source developers, security researchers, and builders.'
                )}
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent)', textDecoration: 'none', padding: '5px 11px', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 6, background: 'rgba(0,232,122,0.06)' }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d={GH} /></svg>
                  github.com/{GITHUB_USERNAME}
                </a>
                {(org as GitHubOrg)?.blog && (
                  <a href={(org as GitHubOrg).blog!} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-3)', textDecoration: 'none', padding: '5px 11px', border: '1px solid var(--border)', borderRadius: 6 }}>
                    🔗 Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', overflow: 'hidden', width: 'fit-content' }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ display: 'flex' }}>
                {i > 0 && <div style={{ width: 1, background: 'var(--border)' }} />}
                <div style={{ padding: '14px 24px', textAlign: 'center', minWidth: 72 }}>
                  {s.value === null ? (
                    <div className="skeleton" style={{ height: 22, width: 32, borderRadius: 4, margin: '0 auto 5px' }} />
                  ) : (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: 5, letterSpacing: '-0.02em' }}>
                      {s.value}
                    </p>
                  )}
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)', fontWeight: 500 }}>
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Members section ────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="section__eyebrow" style={{ marginBottom: 6 }}>
              <span className="section-label">Team Members</span>
            </div>
            <h2 className="section__heading" style={{ marginBottom: 0 }}>
              {loading ? 'Loading…' : members.length > 0 ? `${members.length} developer${members.length !== 1 ? 's' : ''}` : 'Members'}
            </h2>
          </div>
          {lastUpdated && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-4)' }}>
              Live data · auto-refreshes every 5m
            </span>
          )}
        </div>

        {/* Error state */}
        {error && !loading && members.length === 0 && (
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '40px 32px', textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-3)', marginBottom: 20 }}>{error}</p>
            <button onClick={handleManualRefresh}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}>
              ↻ Try Again
            </button>
          </div>
        )}

        {/* Token notice — shown when running without a token */}
        {!loading && !error && members.length > 0 && members.length < 6 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 'var(--radius)', marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem' }}>⚠️</span>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--yellow)', flex: 1, lineHeight: 1.5 }}>
              Only publicly-visible members are shown. Add a <code style={{ background: 'rgba(251,191,36,0.1)', padding: '1px 5px', borderRadius: 3 }}>GITHUB_TOKEN</code> with <code style={{ background: 'rgba(251,191,36,0.1)', padding: '1px 5px', borderRadius: 3 }}>read:org</code> scope to .env.local to see all members.
            </p>
          </div>
        )}

        {/* Members grid */}
        <div className="team-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : members.map((m, i) => <MemberCard key={m.login} member={m} rank={i} />)
          }
        </div>

        {/* CTA */}
        <div style={{ marginTop: 56, padding: 'clamp(32px,5vw,48px)', border: '1px solid var(--border)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%,rgba(0,232,122,0.05) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>Open Source</span>
            <h2 style={{ fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 10 }}>
              {isOrg ? 'Join the organization' : 'Explore the work'}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-3)', marginBottom: 28, maxWidth: 420, marginInline: 'auto', lineHeight: 1.65 }}>
              All repositories are public. Browse code, open issues, or contribute.
            </p>
            <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d={GH} /></svg>
              github.com/{GITHUB_USERNAME}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .team-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 14px;
        }
        @media (min-width: 580px) {
          .team-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .team-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1200px) {
          .team-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  );
}
