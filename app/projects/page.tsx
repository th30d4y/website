'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { GitHubRepository } from '@/types/github';
import ProjectCard from '@/components/ProjectCard';
import { getLanguageColor } from '@/lib/github';

type SortOption = 'pushed' | 'created' | 'stars' | 'forks' | 'name';
type FilterOption = 'all' | 'active' | 'archived' | 'forks' | string;

const GH_ICON = (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

function SkeletonCard() {
  return (
    <div
      style={{
        padding: '18px 20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
      aria-hidden="true"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="skeleton" style={{ height: 13, width: 128, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 13, width: 52, borderRadius: 4 }} />
      </div>
      <div className="skeleton" style={{ height: 11, width: '100%', borderRadius: 3, marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 11, width: '68%', borderRadius: 3, marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <div className="skeleton" style={{ height: 18, width: 52, borderRadius: 100 }} />
        <div className="skeleton" style={{ height: 18, width: 68, borderRadius: 100 }} />
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTop: '1px solid var(--bg-raised)',
      }}>
        <div className="skeleton" style={{ height: 10, width: 72, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 10, width: 48, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 100,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        fontWeight: 500,
        border: active
          ? accent
            ? '1px solid var(--accent)'
            : '1px solid var(--border-hi)'
          : '1px solid var(--border)',
        background: active
          ? accent
            ? 'var(--accent)'
            : 'var(--bg-raised)'
          : 'transparent',
        color: active
          ? accent
            ? '#000'
            : 'var(--text)'
          : 'var(--text-3)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--border-hi)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-3)';
        }
      }}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export default function ProjectsPage() {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('pushed');
  const [filter, setFilter] = useState<FilterOption>('all');

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/github/repos');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setRepos(json.data?.repos || []);
    } catch {
      setError('Failed to load repositories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const languageOptions = useMemo(() => {
    const langs = new Map<string, number>();
    repos.forEach((r) => {
      if (r.language) langs.set(r.language, (langs.get(r.language) || 0) + 1);
    });
    return Array.from(langs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lang]) => lang);
  }, [repos]);

  const filtered = useMemo(() => {
    let result = [...repos];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.topics?.some((t) => t.toLowerCase().includes(q)) ||
          r.language?.toLowerCase().includes(q)
      );
    }

    if (filter === 'active') {
      result = result.filter((r) => !r.archived && !r.fork);
    } else if (filter === 'archived') {
      result = result.filter((r) => r.archived);
    } else if (filter === 'forks') {
      result = result.filter((r) => r.fork);
    } else if (filter !== 'all') {
      result = result.filter((r) => r.language === filter);
    }

    switch (sort) {
      case 'pushed':
        result.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());
        break;
      case 'created':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'stars':
        result.sort((a, b) => b.stargazers_count - a.stargazers_count);
        break;
      case 'forks':
        result.sort((a, b) => b.forks_count - a.forks_count);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [repos, search, filter, sort]);

  const activeCount = repos.filter((r) => !r.archived && !r.fork).length;
  const forkCount = repos.filter((r) => r.fork).length;
  const hasArchived = repos.some((r) => r.archived);

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64 }}>
      <div className="section__container" style={{ paddingTop: 48, paddingBottom: 96 }}>

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <div className="section__eyebrow">
            <span className="live-dot" aria-hidden="true" />
            <span className="section-label">Repositories</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: 6,
              }}>
                Projects
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
                {loading
                  ? 'Loading repositories…'
                  : `${repos.length} public repositories`}
              </p>
            </div>
            <a
              href="https://github.com/th30d4y/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-3)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              {GH_ICON}
              View on GitHub ↗
            </a>
          </div>
        </div>

        {/* ── Search + Sort ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }}
              width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              style={{
                width: '100%',
                paddingLeft: 36,
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              aria-label="Search repositories"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              outline: 'none',
              flexShrink: 0,
            }}
            aria-label="Sort repositories"
          >
            <option value="pushed">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>

        {/* ── Filter chips ────────────────────────────────────────────── */}
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 32 }}
          role="group"
          aria-label="Filter repositories"
        >
          <FilterChip active={filter === 'all'} accent onClick={() => setFilter('all')}>
            All ({repos.length})
          </FilterChip>

          <FilterChip active={filter === 'active'} onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}>
            Active ({activeCount})
          </FilterChip>

          {forkCount > 0 && (
            <FilterChip active={filter === 'forks'} onClick={() => setFilter(filter === 'forks' ? 'all' : 'forks')}>
              Forks ({forkCount})
            </FilterChip>
          )}

          {/* Language chips */}
          {languageOptions.map((lang) => {
            const count = repos.filter((r) => r.language === lang).length;
            const color = getLanguageColor(lang);
            return (
              <FilterChip
                key={lang}
                active={filter === lang}
                onClick={() => setFilter(filter === lang ? 'all' : lang)}
              >
                <span
                  style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }}
                  aria-hidden="true"
                />
                {lang} ({count})
              </FilterChip>
            );
          })}

          {hasArchived && (
            <FilterChip active={filter === 'archived'} onClick={() => setFilter(filter === 'archived' ? 'all' : 'archived')}>
              Archived
            </FilterChip>
          )}
        </div>

        {/* Active filter label */}
        {filter !== 'all' && !loading && (
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)' }}>
              Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''} for
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent)', background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.2)', padding: '2px 8px', borderRadius: 100 }}>
              {filter}
            </span>
            <button
              onClick={() => { setSearch(''); setFilter('all'); }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-4)')}
            >
              ✕ clear
            </button>
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────────────── */}
        {error && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            marginBottom: 24,
          }}>
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginBottom: 16 }}>{error}</p>
            <button
              onClick={fetchRepos}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Repository grid ──────────────────────────────────────────── */}
        {!error && (
          <>
            <div className="projects-grid">
              {loading
                ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                : filtered.map((repo) => (
                    <ProjectCard key={repo.id} repo={repo} />
                  ))}
            </div>

            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-4)', marginBottom: 12 }}>
                  {search
                    ? `No repositories match "${search}"`
                    : 'No repositories in this category.'}
                </p>
                {(search || filter !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setFilter('all'); }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <p style={{
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-4)',
                marginTop: 40,
              }}>
                Showing {filtered.length} of {repos.length} repositories
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .projects-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .projects-grid { grid-template-columns: repeat(3, 1fr); }
        }
        /* Style the select dropdown background */
        select option {
          background: #111114;
          color: #e2e2e2;
        }
        /* Override search cancel button color */
        input[type="search"]::-webkit-search-cancel-button {
          filter: invert(0.4);
        }
        input::placeholder {
          color: var(--text-4) !important;
        }
      `}</style>
    </div>
  );
}
