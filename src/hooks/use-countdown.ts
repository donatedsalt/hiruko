import { useEffect, useRef, useState } from "react";

export function useCountdown(start: number, active: boolean) {
  const [count, setCount] = useState(start);
  const [done, setDone] = useState(false);

  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    if (!active) return;

    setCount(startRef.current);
    setDone(false);

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  return { count, done };
}
