'use client';

import Link from 'next/link';
import type { GitHubRepository } from '@/types/github';
import { getFeaturedRepos } from '@/lib/github';
import ProjectCard from './ProjectCard';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface FeaturedProjectsProps {
  repos: GitHubRepository[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }} aria-hidden="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="skeleton" style={{ height: 14, width: 120, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 4 }} />
      </div>
      <div className="skeleton" style={{ height: 12, width: '100%', borderRadius: 3, marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 3, marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <div className="skeleton" style={{ height: 20, width: 56, borderRadius: 100 }} />
        <div className="skeleton" style={{ height: 20, width: 72, borderRadius: 100 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--bg-raised)' }}>
        <div className="skeleton" style={{ height: 11, width: 72, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 11, width: 52, borderRadius: 3 }} />
      </div>
    </div>
  );
}

export default function FeaturedProjects({ repos, loading }: FeaturedProjectsProps) {
  const featured = getFeaturedRepos(repos, 6);
  const sectionRef = useScrollReveal<HTMLElement>();
  const gridRef = useScrollReveal<HTMLDivElement>(0.05);

  return (
    <section ref={sectionRef} id="featured" aria-label="Featured projects" className="section reveal-up">
      <div className="section__container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <div className="section__eyebrow">
              <span className="live-dot" aria-hidden="true" />
              <span className="section-label">02 / Projects</span>
            </div>
            <h2 className="section__heading">Featured Work</h2>
            <p className="section__sub" style={{ marginBottom: 0 }}>
              Top repositories by activity and engagement
            </p>
          </div>
          <Link
            href="/projects"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-3)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s',
              flexShrink: 0,
              paddingBottom: 4
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            All projects →
          </Link>
        </div>

        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: 12
        }} className="projects-grid stagger">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.length > 0
            ? featured.map((repo) => <ProjectCard key={repo.id} repo={repo} featured />)
            : (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '64px 0',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                color: 'var(--text-3)'
              }}>
                No repositories found.
              </div>
            )}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .projects-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
