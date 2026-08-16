'use client';

import Link from 'next/link';
import type { GitHubRepository } from '@/types/github';
import { formatRelativeTime, getLanguageColor } from '@/lib/github';

interface ProjectCardProps {
  repo: GitHubRepository;
  featured?: boolean;
}

function tilt(e: React.MouseEvent<HTMLAnchorElement>) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width  - 0.5; // -0.5 to 0.5
  const y = (e.clientY - r.top)  / r.height - 0.5;
  e.currentTarget.style.transform =
    `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-3px)`;
  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.35)';
}

function resetTilt(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
  e.currentTarget.style.boxShadow = 'none';
}

export default function ProjectCard({ repo }: ProjectCardProps) {
  const isActive = !repo.archived;
  const langColor = repo.language ? getLanguageColor(repo.language) : '#52525c';

  return (
    <Link
      href={`/projects/${repo.name}`}
      className="project-card card-tilt"
      aria-label={`View ${repo.name} repository`}
      onMouseMove={tilt}
      onMouseLeave={resetTilt}
    >
      {/* Header */}
      <div className="project-card__header">
        <div className="project-card__title-row">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="project-card__repo-icon" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="project-card__name">{repo.name}</h3>
        </div>
        <span
          className={`project-card__status ${isActive ? 'project-card__status--active' : 'project-card__status--archived'}`}
          aria-label={isActive ? 'Active' : 'Archived'}
        >
          {isActive ? '● Active' : '○ Archived'}
        </span>
      </div>

      {/* Description */}
      <p className="project-card__desc">
        {repo.description || <span style={{ fontStyle: 'italic', color: 'var(--text-4)' }}>No description</span>}
      </p>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="project-card__topics" aria-label="Topics">
          {repo.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="project-card__topic">{topic}</span>
          ))}
          {repo.topics.length > 3 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-4)' }}>
              +{repo.topics.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="project-card__footer">
        <div className="project-card__meta">
          {repo.language && (
            <span className="project-card__lang">
              <span
                className="project-card__lang-dot"
                style={{ backgroundColor: langColor }}
                aria-hidden="true"
              />
              {repo.language}
            </span>
          )}
          {repo.stargazers_count > 0 && (
            <span className="project-card__stat" aria-label={`${repo.stargazers_count} stars`}>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {repo.stargazers_count}
            </span>
          )}
          {repo.forks_count > 0 && (
            <span className="project-card__stat" aria-label={`${repo.forks_count} forks`}>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              {repo.forks_count}
            </span>
          )}
        </div>
        <span className="project-card__time">{formatRelativeTime(repo.pushed_at)}</span>
      </div>

      <style>{`
        .project-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px 20px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease,
                      transform 0.18s ease, box-shadow 0.18s ease;
        }
        .project-card:hover {
          border-color: var(--border-hi);
          background: var(--bg-raised);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.32);
        }
        .project-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .project-card__title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .project-card__repo-icon {
          color: var(--text-4);
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .project-card:hover .project-card__repo-icon {
          color: var(--accent);
        }
        .project-card__name {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.15s;
        }
        .project-card:hover .project-card__name {
          color: var(--accent);
        }
        .project-card__status {
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          flex-shrink: 0;
          font-weight: 500;
        }
        .project-card__status--active { color: var(--accent); }
        .project-card__status--archived { color: var(--text-4); }
        .project-card__desc {
          font-size: 0.8125rem;
          color: var(--text-3);
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.4em;
        }
        .project-card__topics {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          align-items: center;
        }
        .project-card__topic {
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          padding: 3px 8px;
          border-radius: 100px;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          color: var(--text-3);
          letter-spacing: 0.04em;
        }
        .project-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--bg-raised);
          margin-top: 2px;
        }
        .project-card__meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: var(--text-3);
        }
        .project-card__lang {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .project-card__lang-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .project-card__stat {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .project-card__time {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: var(--text-4);
        }
      `}</style>
    </Link>
  );
}
