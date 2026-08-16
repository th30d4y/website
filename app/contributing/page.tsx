'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/lib/useScrollReveal';

const GH = 'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z';

const steps = [
  {
    num: '01',
    title: 'Fork the repository',
    body: 'Start by forking the repository to your own GitHub account. This gives you a personal copy to work on without affecting the original.',
    code: 'gh repo fork th30d4y/<repo-name>',
  },
  {
    num: '02',
    title: 'Clone your fork',
    body: 'Clone your forked repository locally so you can make changes on your machine.',
    code: 'git clone https://github.com/<your-username>/<repo-name>.git\ncd <repo-name>',
  },
  {
    num: '03',
    title: 'Create a branch',
    body: 'Create a new branch for your feature or fix. Use a short, descriptive name.',
    code: 'git checkout -b feat/your-feature-name\n# or\ngit checkout -b fix/short-description',
  },
  {
    num: '04',
    title: 'Make your changes',
    body: 'Write clean, focused code. Keep changes scoped — one feature or fix per pull request makes review faster.',
    code: null,
  },
  {
    num: '05',
    title: 'Commit with a clear message',
    body: 'Write a concise commit message describing what changed and why.',
    code: 'git add .\ngit commit -m "feat: add rate-limit retry logic"\n\n# Types: feat | fix | docs | refactor | test | chore',
  },
  {
    num: '06',
    title: 'Push and open a pull request',
    body: 'Push your branch and open a pull request against the main branch. Describe what your PR does and reference any related issues.',
    code: 'git push origin feat/your-feature-name',
  },
];

const guidelines = [
  { icon: '◈', title: 'Keep PRs small', desc: 'One logical change per PR. Smaller PRs are reviewed faster and are easier to merge.' },
  { icon: '◇', title: 'Write meaningful commits', desc: 'Use conventional commit prefixes: feat, fix, docs, refactor, test, chore.' },
  { icon: '●', title: 'Test your changes', desc: 'Make sure your changes work before submitting. If the project has tests, run them.' },
  { icon: '✦', title: 'Document what matters', desc: 'If your change adds new behaviour, update any relevant docs or comments.' },
  { icon: '⑂', title: 'Be respectful', desc: 'Keep discussions technical and constructive. Everyone is here to learn and build.' },
  { icon: '↑', title: 'Follow existing style', desc: 'Match the code style, naming conventions, and patterns already in the project.' },
];

function CodeBlock({ code }: { code: string }) {
  return (
    <pre style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '12px 16px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8125rem',
      color: 'var(--text-2)',
      overflowX: 'auto',
      marginTop: 12,
      lineHeight: 1.65,
      whiteSpace: 'pre',
    }}>
      {code.split('\n').map((line, i) => (
        <div key={i}>
          {line.startsWith('#') ? (
            <span style={{ color: 'var(--text-4)' }}>{line}</span>
          ) : (
            <span>{line}</span>
          )}
        </div>
      ))}
    </pre>
  );
}

export default function ContributingPage() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const stepsRef = useScrollReveal<HTMLDivElement>(0.05);
  const guidelinesRef = useScrollReveal<HTMLDivElement>(0.05);
  const ctaRef = useScrollReveal<HTMLDivElement>();

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64 }}>
      {/* Grid bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%,black,transparent)',
      }} aria-hidden="true" />

      <div className="section__container" style={{ position: 'relative', zIndex: 1, paddingTop: 56, paddingBottom: 96 }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div ref={headerRef} className="reveal-up" style={{ marginBottom: 64 }}>
          <div className="section__eyebrow" style={{ marginBottom: 16 }}>
            <span className="section-label">Contributing</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--text)',
            marginBottom: 18,
            maxWidth: 640,
          }}>
            Help build something useful.
          </h1>
          <p style={{ fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)', color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 560, marginBottom: 28 }}>
            All projects under <span style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>th30d4y</span> are open source.
            Contributions of any size — bug fixes, documentation, features, feedback — are welcome.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href="https://github.com/th30d4y" target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d={GH} /></svg>
              View repositories ↗
            </a>
            <a href="https://github.com/th30d4y" target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
              Open an issue
            </a>
          </div>
        </div>

        {/* ── Step-by-step ────────────────────────────────────────── */}
        <div style={{ marginBottom: 64 }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="live-dot" aria-hidden="true" />
            <span className="section-label">How to contribute</span>
          </div>
          <h2 className="section__heading" style={{ marginBottom: 32 }}>Step by step</h2>

          <div ref={stepsRef} className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((s) => (
              <div key={s.num} style={{
                padding: '22px 24px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--accent)', opacity: 0.4, borderRadius: '2px 0 0 2px' }} />
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase' }}>{s.num}</span>
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.65 }}>{s.body}</p>
                  {s.code && <CodeBlock code={s.code} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Guidelines ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 64 }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="section-label">Guidelines</span>
          </div>
          <h2 className="section__heading" style={{ marginBottom: 32 }}>What makes a good contribution</h2>

          <div ref={guidelinesRef} className="stagger contrib-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 12 }}>
            {guidelines.map((g) => (
              <div key={g.title} style={{
                padding: '20px 22px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                gap: 16,
                transition: 'border-color 0.18s, background 0.18s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hi)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'; }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>{g.icon}</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>{g.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', lineHeight: 1.6 }}>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Code of Conduct ─────────────────────────────────────── */}
        <div style={{ marginBottom: 64, padding: '28px 32px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <div className="section__eyebrow" style={{ marginBottom: 10 }}>
            <span className="section-label">Code of conduct</span>
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Be excellent to each other.
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 600 }}>
            This project follows a simple rule: treat everyone with respect. Harassment, personal attacks,
            and unconstructive criticism have no place here. If you see behaviour that violates this,
            open an issue or reach out directly.
          </p>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <div ref={ctaRef} className="reveal-up" style={{
          padding: 'clamp(32px,5vw,52px)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%,rgba(0,232,122,0.05),transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>Ready?</span>
            <h2 style={{ fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Start contributing today.
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-3)', marginBottom: 28, maxWidth: 400, marginInline: 'auto', lineHeight: 1.65 }}>
              Browse open issues, fork a repository, or suggest an improvement.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://github.com/th30d4y" target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d={GH} /></svg>
                github.com/th30d4y ↗
              </a>
              <a href="https://docs.0d4y.dev/" target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
                docs.0d4y.dev ↗
              </a>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (min-width: 640px) {
          .contrib-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (min-width: 1024px) {
          .contrib-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
