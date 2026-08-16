'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Metadata } from 'next';
import type { GitHubRepository } from '@/types/github';
import ProjectCard from '@/components/ProjectCard';
import { getLanguageColor } from '@/lib/github';

type SortOption = 'pushed' | 'created' | 'stars' | 'forks' | 'name';
type FilterOption = 'all' | 'archived' | string; // string = language name

function SkeletonCard() {
  return (
    <div className="p-5 rounded-lg border border-[#1e1e1e] bg-[#0f0f0f]" aria-hidden="true">
      <div className="flex justify-between mb-3">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-3/4 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="flex justify-between pt-3 border-t border-[#141414]">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
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

  // Build language filter options from actual data
  const languageOptions = useMemo(() => {
    const langs = new Map<string, number>();
    repos.forEach((r) => {
      if (r.language) {
        langs.set(r.language, (langs.get(r.language) || 0) + 1);
      }
    });
    return Array.from(langs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lang]) => lang);
  }, [repos]);

  const filtered = useMemo(() => {
    let result = [...repos];

    // Search
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

    // Filter
    if (filter === 'archived') {
      result = result.filter((r) => r.archived);
    } else if (filter !== 'all') {
      result = result.filter((r) => r.language === filter);
    }

    // Sort
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

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" aria-hidden="true" />
            <span className="section-label">Repositories</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Projects</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                {loading ? 'Loading repositories…' : `${repos.length} public repositories`}
              </p>
            </div>
            <a
              href="https://github.com/th30d4y/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-[#6b7280] hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub ↗
            </a>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-4 py-2 bg-[#0f0f0f] border border-[#1e1e1e] rounded text-sm text-white placeholder-[#4b5563] font-mono focus:outline-none focus:border-[#2a2a2a]"
              aria-label="Search repositories"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2 bg-[#0f0f0f] border border-[#1e1e1e] rounded text-sm text-[#9ca3af] font-mono focus:outline-none focus:border-[#2a2a2a] cursor-pointer"
            aria-label="Sort repositories"
          >
            <option value="pushed">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by language">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full font-mono text-xs border transition-colors ${
              filter === 'all'
                ? 'bg-[#00e87a] text-black border-[#00e87a]'
                : 'border-[#1e1e1e] text-[#6b7280] hover:border-[#2a2a2a] hover:text-white'
            }`}
            aria-pressed={filter === 'all'}
          >
            All ({repos.length})
          </button>

          {languageOptions.map((lang) => {
            const count = repos.filter((r) => r.language === lang).length;
            const color = getLanguageColor(lang);
            return (
              <button
                key={lang}
                onClick={() => setFilter(filter === lang ? 'all' : lang)}
                className={`px-3 py-1 rounded-full font-mono text-xs border transition-colors flex items-center gap-1.5 ${
                  filter === lang
                    ? 'bg-[#141414] border-[#2a2a2a] text-white'
                    : 'border-[#1e1e1e] text-[#6b7280] hover:border-[#2a2a2a] hover:text-white'
                }`}
                aria-pressed={filter === lang}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                {lang} ({count})
              </button>
            );
          })}

          {repos.some((r) => r.archived) && (
            <button
              onClick={() => setFilter(filter === 'archived' ? 'all' : 'archived')}
              className={`px-3 py-1 rounded-full font-mono text-xs border transition-colors ${
                filter === 'archived'
                  ? 'bg-[#141414] border-[#2a2a2a] text-white'
                  : 'border-[#1e1e1e] text-[#6b7280] hover:border-[#2a2a2a] hover:text-white'
              }`}
              aria-pressed={filter === 'archived'}
            >
              Archived
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-12 border border-[#1e1e1e] rounded-lg mb-6">
            <p className="text-[#6b7280] text-sm mb-4">{error}</p>
            <button
              onClick={fetchRepos}
              className="font-mono text-xs text-[#00e87a] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        {!error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                : filtered.map((repo) => (
                    <ProjectCard key={repo.id} repo={repo} />
                  ))}
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="font-mono text-sm text-[#4b5563]">
                  {search ? `No repositories match "${search}"` : 'No repositories found.'}
                </p>
                {(search || filter !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setFilter('all'); }}
                    className="mt-3 font-mono text-xs text-[#00e87a] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <p className="text-center font-mono text-xs text-[#4b5563] mt-8">
                Showing {filtered.length} of {repos.length} repositories
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
