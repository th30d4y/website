'use client';

import { useEffect, useState, useCallback } from 'react';
import type { GitHubUser, GitHubRepository } from '@/types/github';
import type { LanguageStat } from '@/types/github';
import Hero from '@/components/Hero';
import GitHubStats from '@/components/GitHubStats';
import FeaturedProjects from '@/components/FeaturedProjects';
import ActivityFeed from '@/components/ActivityFeed';
import ContributionGraph from '@/components/ContributionGraph';
import LanguageStats from '@/components/LanguageStats';
import WhatIBuild from '@/components/WhatIBuild';
import Terminal from '@/components/Terminal';

export default function HomePage() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [langFilter, setLangFilter] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const res = await fetch('/api/github/user');
      const json = await res.json();
      if (json.data) setUser(json.data);
    } catch {
      // graceful — show partial UI
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const fetchRepos = useCallback(async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch('/api/github/repos');
      const json = await res.json();
      if (json.data) {
        setRepos(json.data.repos || []);
        setLanguages(json.data.languages || []);
      }
    } catch {
      // graceful
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchRepos();
  }, [fetchUser, fetchRepos]);

  // Filter repos by language when langFilter is set
  const filteredRepos = langFilter
    ? repos.filter((r) => r.language === langFilter)
    : repos;

  return (
    <>
      <Hero user={user} loading={loadingUser} />

      <div>
        <GitHubStats user={user} repos={repos} loading={loadingRepos} />

        <hr className="section-divider" />
        <FeaturedProjects repos={filteredRepos} loading={loadingRepos} />

        <hr className="section-divider" />
        <ActivityFeed />

        <hr className="section-divider" />
        <ContributionGraph />

        <hr className="section-divider" />
        <LanguageStats
          languages={languages}
          loading={loadingRepos}
          onFilter={setLangFilter}
          activeFilter={langFilter}
        />

        <hr className="section-divider" />
        <WhatIBuild />

        <hr className="section-divider" />
        <Terminal />

        {/* GitHub CTA */}
        <hr className="section-divider" />
        <section className="section" aria-label="GitHub call to action">
          <div className="section__container">
            <div style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(40px, 6vw, 80px)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 50% 50%, rgba(0,232,122,0.05) 0%, transparent 65%)',
                pointerEvents: 'none',
              }} aria-hidden="true" />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="section-label" style={{ display: 'block', marginBottom: 20 }}>Open Source</span>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.15 }}>
                  Find the code on GitHub
                </h2>
                <p style={{ color: 'var(--text-3)', fontSize: '1rem', marginBottom: 32, maxWidth: 440, marginInline: 'auto', lineHeight: 1.65 }}>
                  All projects are public. Browse repositories, open issues, or contribute.
                </p>
                <a
                  href="https://github.com/th30d4y/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                  style={{ display: 'inline-flex' }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  github.com/th30d4y ↗
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
