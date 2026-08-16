'use client';

import { useEffect, useState } from 'react';

interface LiveBadgeProps {
  lastUpdated: Date | null;
  refreshIntervalSec: number;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function LiveBadge({
  lastUpdated,
  refreshIntervalSec,
  loading,
  onRefresh,
}: LiveBadgeProps) {
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!lastUpdated) return;
    const tick = () => {
      const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      setElapsed(secs);
      setProgress(Math.min(secs / refreshIntervalSec, 1));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdated, refreshIntervalSec]);

  const formatElapsed = (secs: number) => {
    if (secs < 5) return 'just now';
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  const nextIn = refreshIntervalSec - elapsed;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Live pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 100,
        border: '1px solid rgba(0,232,122,0.25)',
        background: 'rgba(0,232,122,0.06)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.5625rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'var(--accent)',
          animation: 'pulse-dot 2s ease-in-out infinite',
        }} />
        Live
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-4)' }}>
          {formatElapsed(elapsed)}
        </span>
      )}

      {/* Progress ring toward next refresh */}
      {lastUpdated && (
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }} aria-hidden="true">
          <circle cx="8" cy="8" r="6" fill="none" stroke="var(--bg-raised)" strokeWidth="2" />
          <circle cx="8" cy="8" r="6" fill="none" stroke="var(--accent)" strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 6}`}
            strokeDashoffset={`${2 * Math.PI * 6 * progress}`}
            transform="rotate(-90 8 8)"
            style={{ transition: 'stroke-dashoffset 1s linear', opacity: 0.6 }}
          />
        </svg>
      )}

      {/* Next refresh countdown */}
      {lastUpdated && nextIn > 0 && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-4)' }}>
          ↻ {nextIn < 60 ? `${nextIn}s` : `${Math.ceil(nextIn / 60)}m`}
        </span>
      )}

      {/* Manual refresh */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            color: 'var(--text-3)',
            background: 'none',
            border: 'none',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.4 : 1,
            transition: 'color 0.15s',
            padding: 0,
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          aria-label="Refresh data now"
        >
          {loading ? '⟳' : '↻'}
        </button>
      )}
    </div>
  );
}
