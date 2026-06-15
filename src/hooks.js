import { useEffect, useRef, useState } from 'react';

// Smoothly animates a number toward a target — used for coins/gems/XP so values
// "roll up" instead of snapping, which reads as far more satisfying.
export function useCountUp(target, duration = 500) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    fromRef.current = display;
    startRef.current = performance.now();
    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(from + delta * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

// Returns [transform, shake()] — apply transform to a wrapper for screen-shake.
export function useScreenShake() {
  const [shake, setShake] = useState(0);
  const ref = useRef(0);
  const trigger = (intensity = 1) => {
    setShake(intensity);
    clearTimeout(ref.current);
    ref.current = setTimeout(() => setShake(0), 360);
  };
  const className = shake ? 'animate-shake' : '';
  return [className, trigger];
}
