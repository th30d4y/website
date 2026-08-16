'use client';

import type { LanguageStat } from '@/types/github';

interface LanguageStatsProps {
  languages: LanguageStat[];
  loading?: boolean;
  onFilter?: (lang: string | null) => void;
  activeFilter?: string | null;
}

export default function LanguageStats({
  languages,
  loading,
  onFilter,
  activeFilter,
}: LanguageStatsProps) {
  const displayLanguages = languages.slice(0, 8);

  return (
    <section id="languages" aria-label="Language Statistics" className="section">
      <div className="section__container">
        <div className="section__eyebrow">
          <span className="live-dot" aria-hidden="true" />
          <span className="section-label">05 / Languages</span>
        </div>
        <h2 className="section__heading">Technology Stack</h2>
        <p className="section__sub">Aggregated from all public repositories</p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="skeleton" style={{ height: 12, width: 96, borderRadius: 3, flexShrink: 0 }} />
                <div className="skeleton" style={{ height: 6, flex: 1, borderRadius: 3 }} />
                <div className="skeleton" style={{ height: 12, width: 48, borderRadius: 3, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        ) : displayLanguages.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }} className="lang-grid">
            {/* Bar chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayLanguages.map((lang) => (
                <button
                  key={lang.language}
                  onClick={() => onFilter?.(activeFilter === lang.language ? null : lang.language)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    opacity: activeFilter && activeFilter !== lang.language ? 0.4 : 1,
                    transition: 'opacity 0.15s',
                  }}
                  aria-label={`Filter by ${lang.language} (${lang.percentage}%)`}
                  aria-pressed={activeFilter === lang.language}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-2)', width: 96, flexShrink: 0, textAlign: 'right', transition: 'color 0.15s' }}>
                    {lang.language}
                  </span>
                  <div style={{ flex: 1, background: 'var(--bg-raised)', borderRadius: 100, height: 5, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(lang.percentage, 1)}%`,
                        height: '100%',
                        borderRadius: 100,
                        backgroundColor: lang.color,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-3)', width: 48, textAlign: 'right', flexShrink: 0 }}>
                    {lang.percentage.toFixed(1)}%
                  </span>
                </button>
              ))}
            </div>

            {/* Donut visualization */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DonutChart languages={displayLanguages} />
            </div>
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-4)' }}>No language data available.</p>
        )}

        {activeFilter && (
          <button
            onClick={() => onFilter?.(null)}
            style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ✕ Clear filter: {activeFilter}
          </button>
        )}

        <style>{`
          @media (min-width: 1024px) {
            .lang-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

function DonutChart({ languages }: { languages: LanguageStat[] }) {
  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = languages.map((lang) => {
    const length = (lang.percentage / 100) * circumference;
    const segment = { ...lang, offset, length };
    offset += length;
    return segment;
  });

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label="Language distribution donut chart"
        role="img"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-raised)"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {segments.map((seg) => (
          <circle
            key={seg.language}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={-seg.offset}
            className="transition-opacity duration-200"
          />
        ))}
      </svg>
      {/* Center label */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{languages.length}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)' }}>langs</span>
      </div>
    </div>
  );
}
