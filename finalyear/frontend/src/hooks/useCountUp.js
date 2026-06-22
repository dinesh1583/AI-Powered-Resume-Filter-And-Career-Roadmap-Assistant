import { useState, useEffect, useRef } from 'react';

/**
 * Animated counter hook — counts from 0 to `end` over `duration` ms.
 * Used for stat cards, scores, and percentage displays.
 */
export function useCountUp(end, duration = 1500, startOnMount = true) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!startOnMount || end === 0 || end === undefined || end === null) {
      setCount(end || 0);
      return;
    }

    const numericEnd = typeof end === 'string' ? parseFloat(end) : end;
    if (isNaN(numericEnd)) { setCount(0); return; }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * numericEnd));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, startOnMount]);

  return count;
}

export default useCountUp;
