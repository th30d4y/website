'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import type { GitHubUser } from '@/types/github';

interface HeroProps {
  user: GitHubUser | null;
  loading?: boolean;
}

const GithubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function Hero({ user, loading }: HeroProps) {
  const [visible, setVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const greenRef = useRef<HTMLDivElement>(null);
  const cyanRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Mouse parallax on the background elements
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // -1 to 1
      const dy = (e.clientY - cy) / cy;

      if (gridRef.current) {
        gridRef.current.style.transform = `translate(${dx * 8}px, ${dy * 8}px)`;
      }
      if (greenRef.current) {
        greenRef.current.style.transform = `translateX(-50%) translate(${dx * 20}px, ${dy * 14}px)`;
      }
      if (cyanRef.current) {
        cyanRef.current.style.transform = `translate(${dx * -14}px, ${dy * 10}px)`;
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onMouseMove]);

  const stats = user
    ? [
        { value: user.public_repos, label: 'Repos' },
        { value: user.followers, label: 'Followers' },
        { value: user.following, label: 'Following' },
      ]
    : null;

  return (
    <section
      id="hero"
      className="hero-section"
      aria-label="Introduction"
    >
      {/* Subtle grid — moves with mouse */}
      <div ref={gridRef} className="hero-grid" aria-hidden="true"
        style={{ transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)', willChange: 'transform' }} />

      {/* Radial atmosphere glows — parallax */}
      <div ref={greenRef} className="hero-glow-green" aria-hidden="true"
        style={{ transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1)', willChange: 'transform' }} />
      <div ref={cyanRef} className="hero-glow-cyan" aria-hidden="true"
        style={{ transition: 'transform 1s cubic-bezier(0.16,1,0.3,1)', willChange: 'transform' }} />

      {/* Main content — centered column */}
      <div
        className={`hero-content ${visible ? 'hero-content--visible' : 'hero-content--hidden'}`}
      >
        {/* Availability badge */}
        <div className="hero-badge" role="status" aria-label="Availability status: available">
          <span className="hero-badge__dot" aria-hidden="true" />
          <span>AVAILABLE</span>
        </div>

        {/* Avatar */}
        <div className="hero-avatar-ring" aria-hidden={loading ? 'true' : undefined}>
          {loading ? (
            <div
              className="skeleton"
              style={{ width: 96, height: 96, borderRadius: 18 }}
              aria-label="Loading avatar"
            />
          ) : user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={`${user.login} GitHub avatar`}
              width={96}
              height={96}
              className="hero-avatar"
              priority
            />
          ) : (
            <div className="hero-avatar-fallback">
              <span>0d</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="hero-name" aria-label="0d4y">
          0d4y
        </h1>

        {/* Role */}
        <p className="hero-role">
          Developer
          <span className="hero-role__sep" aria-hidden="true">·</span>
          Security Enthusiast
          <span className="hero-role__sep" aria-hidden="true">·</span>
          Open Source Builder
        </p>

        {/* Domain */}
        <p className="hero-domain">0d4y.dev</p>

        {/* Bio */}
        <div className="hero-bio-wrap">
          {loading ? (
            <div aria-label="Loading bio">
              <div className="skeleton" style={{ height: 16, marginBottom: 8, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 16, width: '75%', borderRadius: 4 }} />
            </div>
          ) : (
            <p className="hero-bio">
              {user?.bio ||
                'Building software with focus on security, automation, and open source. Exploring systems, writing tools, and pushing code.'}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="hero-stats" aria-label="GitHub statistics">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="hero-stat">
                  <div className="skeleton" style={{ height: 30, width: 48, borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 10, width: 56, borderRadius: 3 }} />
                </div>
              ))}
            </>
          ) : stats ? (
            stats.map(({ value, label }, i) => (
              <div key={label} className="hero-stat">
                {i > 0 && <div className="hero-stat__divider" aria-hidden="true" />}
                <div className="hero-stat__inner">
                  <span className="hero-stat__value">{value.toLocaleString()}</span>
                  <span className="hero-stat__label">{label}</span>
                </div>
              </div>
            ))
          ) : null}
        </div>

        {/* CTA buttons */}
        <div className="hero-actions">
          <a
            href="https://github.com/th30d4y/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn-magnetic"
          >
            <GithubIcon />
            View GitHub ↗
          </a>
          <a href="/projects" className="btn btn--secondary btn-magnetic">
            Explore Projects
          </a>
          <a href="/activity" className="btn btn--ghost btn-magnetic">
            View Activity
          </a>
        </div>

        {/* Meta identity row */}
        {!loading && user && (
          <div className="hero-meta">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-meta__item"
            >
              <GithubIcon />
              github.com/th30d4y
            </a>
            <span className="hero-meta__sep" aria-hidden="true" />
            <span className="hero-meta__item">
              <span className="text-[#00e87a]" aria-hidden="true">●</span>
              joined {new Date(user.created_at).getFullYear()}
            </span>
            {user.location && (
              <>
                <span className="hero-meta__sep" aria-hidden="true" />
                <span className="hero-meta__item">{user.location}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator" aria-hidden="true">
        <span className="scroll-indicator__label">SCROLL</span>
        <div className="scroll-indicator__line" />
        <div className="scroll-indicator__arrow">↓</div>
      </div>
    </section>
  );
}
