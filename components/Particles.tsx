'use client';

import { useEffect, useRef } from 'react';

export default function Particles({ count = 12 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = containerRef.current;
    if (!container) return;

    const particles = Array.from({ length: count }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.setProperty('--px', `${(Math.random() - 0.5) * 60}px`);
      el.style.setProperty('--pd', `${2.5 + Math.random() * 3}s`);
      el.style.setProperty('--pdelay', `${Math.random() * 4}s`);
      el.style.left = `${10 + Math.random() * 80}%`;
      el.style.bottom = '0';
      el.style.background = i % 3 === 0 ? '#22d3ee' : '#00e87a';
      el.style.width = el.style.height = `${1.5 + Math.random() * 2.5}px`;
      el.style.opacity = '0';
      container.appendChild(el);
      return el;
    });

    return () => { particles.forEach(p => p.remove()); };
  }, [count]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
