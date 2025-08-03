"use client";

import { useRouter } from "next/navigation";

export function useSmartRouter() {
  const router = useRouter();

  const getHistory = () => {
    try {
      return JSON.parse(localStorage.getItem("visitedPaths") || "[]");
    } catch {
      return [];
    }
  };

  const replaceWithBack = (fallbackUrl = "/") => {
    const history = getHistory();
    const previous =
      history.length > 1 ? history[history.length - 2] : fallbackUrl;
    router.replace(previous);
  };

  return {
    replaceWithBack,
    back: router.back,
    forward: router.forward,
    push: router.push,
    replace: router.replace,
    refresh: router.refresh,
    prefetch: router.prefetch,
  };
}
