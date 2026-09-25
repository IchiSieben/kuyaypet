import { useEffect, useRef, useState } from 'react';

/** Animates a number from 0 to `target`. Skips the animation for prefers-reduced-motion (accesibilidad). */
export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      return;
    }
    start.current = null;
    let raf = 0;
    const tick = (t: number) => {
      if (start.current === null) start.current = t;
      const p = Math.min(1, (t - start.current) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}
