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
    // Tick immediately and every second regardless of lastUpdated
    const tick = () => {
      if (!lastUpdated) { setElapsed(0); setProgress(0); return; }
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

  const nextIn = Math.max(0, refreshIntervalSec - elapsed);
  const isConnecting = !lastUpdated;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      {/* Live / connecting pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 100,
        border: `1px solid ${isConnecting ? 'rgba(255,255,255,0.08)' : 'rgba(0,232,122,0.25)'}`,
        background: isConnecting ? 'var(--bg-raised)' : 'rgba(0,232,122,0.06)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.5625rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: isConnecting ? 'var(--text-4)' : 'var(--accent)',
        transition: 'all 0.3s',
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: isConnecting ? 'var(--text-4)' : 'var(--accent)',
          animation: loading ? 'none' : 'pulse-dot 2s ease-in-out infinite',
          transition: 'background 0.3s',
        }} />
        {loading ? 'updating…' : isConnecting ? 'connecting' : 'live'}
      </div>

      {/* Elapsed time — only when data loaded at least once */}
      {lastUpdated && !loading && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-4)' }}>
          {formatElapsed(elapsed)}
        </span>
      )}

      {/* Countdown ring — drains to 0 as next refresh approaches */}
      {lastUpdated && (
        <svg width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0 }} aria-hidden="true">
          <circle cx="8" cy="8" r="6" fill="none" stroke="var(--bg-float)" strokeWidth="2" />
          <circle cx="8" cy="8" r="6" fill="none" stroke="var(--accent)" strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 6}`}
            strokeDashoffset={`${2 * Math.PI * 6 * progress}`}
            transform="rotate(-90 8 8)"
            style={{ transition: 'stroke-dashoffset 1s linear', opacity: 0.5 }}
          />
        </svg>
      )}

      {/* Countdown text */}
      {lastUpdated && nextIn > 0 && !loading && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-4)' }}>
          {nextIn < 60 ? `${nextIn}s` : `${Math.ceil(nextIn / 60)}m`}
        </span>
      )}

      {/* Manual refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-3)',
            background: 'none',
            border: 'none',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.4 : 1,
            transition: 'color 0.15s',
            padding: '0 2px',
            lineHeight: 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
          aria-label="Refresh now"
        >
          {loading ? '⟳' : '↻'}
        </button>
      )}
    </div>
  );
}
