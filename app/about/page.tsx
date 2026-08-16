'use client';

import { useState, useEffect } from 'react';

const GH = 'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z';

/* ─── What we build cards ─────────────────────────────────────────────────── */
const BUILD_CARDS = [
  {
    label: 'Software',
    icon: '⌨',
    desc: 'Developer tools, applications, utilities, and experiments built to solve practical problems.',
  },
  {
    label: 'Security',
    icon: '🔒',
    desc: 'Security research, defensive tooling, testing, and experiments around how systems work and fail.',
  },
  {
    label: 'Open Source',
    icon: '⑂',
    desc: 'Public projects designed to be explored, modified, learned from, and contributed to.',
  },
  {
    label: 'Automation',
    icon: '⚙',
    desc: 'Scripts, workflows, and tools that remove repetitive work and make systems easier to operate.',
  },
  {
    label: 'Research',
    icon: '◈',
    desc: 'Technical experiments used to understand protocols, systems, infrastructure, and software.',
  },
  {
    label: 'Learning',
    icon: '↗',
    desc: 'Projects are also a way to learn — by building real things instead of only reading about them.',
  },
];

/* ─── Philosophy steps ────────────────────────────────────────────────────── */
const PHILOSOPHY = [
  { num: '01', label: 'BUILD', desc: 'Create something real.' },
  { num: '02', label: 'BREAK', desc: 'Question assumptions and test how it behaves.' },
  { num: '03', label: 'UNDERSTAND', desc: 'Dig into the underlying system.' },
  { num: '04', label: 'IMPROVE', desc: 'Turn what was learned into something better.' },
];

/* ─── Stack tags ──────────────────────────────────────────────────────────── */
const STACK = [
  'Python', 'TypeScript', 'JavaScript', 'HTML', 'CSS',
  'Git', 'GitHub', 'Linux', 'Node.js', 'React', 'Next.js',
  'Bash', 'Docker',
];

/* ─── Current focus items ─────────────────────────────────────────────────── */
const FOCUS = [
  { tag: 'Security', dot: 'var(--accent)' },
  { tag: 'Developer tooling', dot: '#22d3ee' },
  { tag: 'Automation', dot: '#a78bfa' },
  { tag: 'Open source', dot: 'var(--accent)' },
  { tag: 'Systems', dot: '#fb923c' },
  { tag: 'Web development', dot: '#22d3ee' },
];

/* ─── Terminal component ──────────────────────────────────────────────────── */
function TerminalBlock() {
  const [cursor, setCursor] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setCursor(c => !c), 600);
    return () => clearInterval(id);
  }, []);

  const lines: Array<{ type: 'prompt' | 'out' | 'blank'; text: string }> = [
    { type: 'prompt', text: '$ git status' },
    { type: 'blank', text: '' },
    { type: 'out', text: 'On branch main' },
    { type: 'out', text: 'working tree clean' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: '$ echo "keep building"' },
    { type: 'blank', text: '' },
    { type: 'out', text: '0d4y.dev' },
    { type: 'blank', text: '' },
  ];

  return (
    <div className="terminal-window" role="region" aria-label="Terminal status">
      <div className="terminal-titlebar">
        <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
          <div className="terminal-dot terminal-dot--red" />
          <div className="terminal-dot terminal-dot--yellow" />
          <div className="terminal-dot terminal-dot--green" />
        </div>
        <span className="terminal-title">0d4y@0d4y.dev: ~</span>
      </div>
      <div className="terminal-body" style={{ height: 'auto', padding: '20px 20px 16px' }}>
        {lines.map((l, i) => (
          <div key={i}
            className={l.type === 'prompt' ? 'terminal-prompt' : l.type === 'blank' ? '' : 'terminal-output'}
            style={l.type === 'blank' ? { height: 8 } : undefined}>
            {l.text}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
          <span style={{ marginRight: 8 }}>$</span>
          <span style={{ opacity: (mounted && cursor) ? 1 : 0, transition: 'opacity 0.1s', fontSize: '0.875rem' }}>▋</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 64 }}>
      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%,black,transparent)',
        }}
        aria-hidden="true"
      />

      <div className="section__container" style={{ position: 'relative', zIndex: 1, paddingTop: 56, paddingBottom: 96 }}>

        {/* ── 1. Page header ──────────────────────────────────────── */}
        <header style={{ marginBottom: 72 }}>
          <div className="section__eyebrow" style={{ marginBottom: 18 }}>
            <span className="section-label">About</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--text)',
            marginBottom: 20,
            maxWidth: 700,
          }}>
            Built to explore,<br />build, and break things.
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            color: 'var(--text-3)',
            lineHeight: 1.7,
            maxWidth: 580,
          }}>
            0d4y.dev is a developer space focused on software, cybersecurity,
            open source, automation, and technical experimentation.
          </p>
        </header>

        {/* ── 2. Who we are ───────────────────────────────────────── */}
        <section aria-labelledby="who-heading" style={{ marginBottom: 72 }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="live-dot" aria-hidden="true" />
            <span className="section-label">Who We Are</span>
          </div>
          <h2 id="who-heading" className="section__heading" style={{ marginBottom: 20 }}>
            A place for building in public.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680 }}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-2)', lineHeight: 1.75 }}>
              0d4y.dev is a personal developer space and open-source environment
              for experimenting with software, security, automation, and ideas
              that turn into working projects.
            </p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-3)', lineHeight: 1.75 }}>
              Some projects are polished, some are experiments, and some exist
              simply to understand how something works. The goal is to keep
              learning, building, and sharing the work.
            </p>
          </div>
        </section>

        {/* ── 3. What we build ────────────────────────────────────── */}
        <section aria-labelledby="build-heading" style={{ marginBottom: 72 }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="section-label">What We Build</span>
          </div>
          <h2 id="build-heading" className="section__heading" style={{ marginBottom: 28 }}>
            Six areas, one direction.
          </h2>
          <div className="about-build-grid">
            {BUILD_CARDS.map((c) => (
              <div
                key={c.label}
                style={{
                  padding: '22px 22px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'border-color 0.18s, background 0.18s, transform 0.18s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hi)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.125rem', lineHeight: 1 }} aria-hidden="true">{c.icon}</span>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {c.label}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', lineHeight: 1.65 }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Philosophy ───────────────────────────────────────── */}
        <section aria-labelledby="phil-heading" style={{ marginBottom: 72 }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="section-label">Philosophy</span>
          </div>
          <h2 id="phil-heading" className="section__heading" style={{ marginBottom: 28 }}>
            Build. Break. Understand. Improve.
          </h2>
          <div className="about-phil-grid">
            {PHILOSOPHY.map((p, i) => (
              <div
                key={p.num}
                style={{
                  padding: '22px 24px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Accent left border on hover */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                  background: i === 0 ? 'var(--accent)' : i === 1 ? '#f87171' : i === 2 ? 'var(--cyan)' : '#a78bfa',
                  borderRadius: '2px 0 0 2px',
                }} />
                <div style={{ paddingLeft: 4 }}>
                  <span style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-4)',
                    marginBottom: 8,
                  }}>
                    {p.num}
                  </span>
                  <h3 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}>
                    {p.label}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Open Source ──────────────────────────────────────── */}
        <section aria-labelledby="oss-heading" style={{ marginBottom: 72 }}>
          <div
            style={{
              padding: 'clamp(28px,5vw,44px)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle glow */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(0,232,122,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} aria-hidden="true" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="section__eyebrow" style={{ marginBottom: 10 }}>
                <span className="live-dot" aria-hidden="true" />
                <span className="section-label">Open Source</span>
              </div>
              <h2 id="oss-heading" className="section__heading" style={{ marginBottom: 14 }}>
                The code is part of the story.
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-3)', lineHeight: 1.75, maxWidth: 600, marginBottom: 28 }}>
                The projects behind 0d4y.dev are developed openly on GitHub.
                Repositories, commits, issues, pull requests, and contributions
                represent the actual development process — not a curated highlight reel.
              </p>
              <a
                href="https://github.com/th30d4y"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={GH} />
                </svg>
                View GitHub ↗
              </a>
            </div>
          </div>
        </section>

        {/* ── 6. Technology stack ─────────────────────────────────── */}
        <section aria-labelledby="stack-heading" style={{ marginBottom: 72 }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="section-label">Stack</span>
          </div>
          <h2 id="stack-heading" className="section__heading" style={{ marginBottom: 6 }}>
            Tools are means, not the product.
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
            Technologies used across projects and this website.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STACK.map((tech) => (
              <span
                key={tech}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-2)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '6px 13px',
                  transition: 'border-color 0.15s, color 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLSpanElement).style.borderColor = 'var(--border-hi)';
                  (e.currentTarget as HTMLSpanElement).style.color = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLSpanElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLSpanElement).style.color = 'var(--text-2)';
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* ── 7. Current focus ────────────────────────────────────── */}
        <section aria-labelledby="focus-heading" style={{ marginBottom: 72 }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="section-label">Currently</span>
          </div>
          <h2 id="focus-heading" className="section__heading" style={{ marginBottom: 20 }}>
            What I&apos;m exploring
          </h2>

          {/* Status board */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}>
            {/* Board header */}
            <div style={{
              padding: '10px 20px',
              background: 'var(--bg-raised)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span className="live-dot" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-3)', letterSpacing: '0.06em' }}>
                status — active
              </span>
            </div>

            {/* Focus rows */}
            {FOCUS.map((f, i) => (
              <div
                key={f.tag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 20px',
                  borderBottom: i < FOCUS.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.dot, flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-2)', fontWeight: 500 }}>
                  {f.tag}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-4)', letterSpacing: '0.1em', marginLeft: 'auto', textTransform: 'uppercase' }}>
                  active
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. Terminal block ────────────────────────────────────── */}
        <section aria-labelledby="terminal-heading" style={{ marginBottom: 0 }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="section-label">Status</span>
          </div>
          <h2 id="terminal-heading" className="section__heading" style={{ marginBottom: 20 }}>
            Always building.
          </h2>
          <div style={{ maxWidth: 580 }}>
            <TerminalBlock />
          </div>

          {/* Footer note */}
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-4)',
            marginTop: 20,
            letterSpacing: '0.04em',
          }}>
            0d4y.dev · built with code, curiosity, and open source.
          </p>
        </section>

      </div>

      <style>{`
        .about-build-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 540px) {
          .about-build-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 960px) {
          .about-build-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .about-phil-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 540px) {
          .about-phil-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .about-phil-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  );
}
