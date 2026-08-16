'use client';

import { useEffect, useState } from 'react';

export default function Scanline() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return <div className="scanline" aria-hidden="true" />;
}
