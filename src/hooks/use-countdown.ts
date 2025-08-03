import { useEffect, useState } from "react";

export function useCountdown(start: number, active: boolean) {
  const [count, setCount] = useState(start);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;

    setCount(start);
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
  }, [start, active]);

  return { count, done };
}
