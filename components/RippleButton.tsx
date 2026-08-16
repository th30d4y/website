'use client';

import { useCallback } from 'react';

interface RippleButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
}

export default function RippleButton({ children, href, onClick, className = '', style, target, rel }: RippleButtonProps) {
  const handleRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const circle = document.createElement('span');
    circle.className = 'ripple-circle';
    circle.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    el.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }, []);

  const cls = `ripple-wrap ${className}`;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={cls} style={style} onClick={handleRipple}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} style={style} onClick={(e) => { handleRipple(e); onClick?.(); }}>
      {children}
    </button>
  );
}
