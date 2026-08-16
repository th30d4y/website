'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/activity', label: 'Activity' },
  { href: '/team', label: 'Team' },
  { href: '/about', label: 'About' },
];

const GithubIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <nav
        className="navbar__inner"
        aria-label="Primary navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="navbar__logo"
          aria-label="0d4y.dev — home"
        >
          <span className="navbar__logo-accent">0d4y</span>
          <span className="navbar__logo-dim">.dev</span>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar__links" role="list">
          {links.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href.replace('/#', '/'));
            return (
              <Link
                key={href}
                href={href}
                role="listitem"
                className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: GitHub link + mobile toggle */}
        <div className="navbar__right">
          <a
            href="https://github.com/th30d4y/"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__github"
            aria-label="View GitHub profile (opens in new tab)"
          >
            <GithubIcon />
            <span>GitHub</span>
            <span className="navbar__github-arrow">↗</span>
          </a>

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className={`hamburger-line ${menuOpen ? 'hamburger-line--top-open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'hamburger-line--mid-open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'hamburger-line--bot-open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu__inner">
          {links.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href.replace('/#', '/'));
            return (
              <Link
                key={href}
                href={href}
                className={`mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`}
              >
                {label}
              </Link>
            );
          })}
          <a
            href="https://github.com/th30d4y/"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-menu__github"
          >
            <GithubIcon />
            GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
}
