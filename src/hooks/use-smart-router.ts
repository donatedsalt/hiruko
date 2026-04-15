"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { historyKey } from "@/components/history-tracker";

export function useSmartRouter() {
  const router = useRouter();
  const { userId } = useAuth();

  const replaceWithBack = useCallback(
    (fallbackUrl = "/") => {
      let previous = fallbackUrl;
      try {
        const raw = localStorage.getItem(historyKey(userId));
        const history: string[] = raw ? JSON.parse(raw) : [];
        if (history.length > 1) previous = history[history.length - 2];
      } catch {
        // fall through to fallback
      }
      router.replace(previous);
    },
    [router, userId],
  );

  return {
    replaceWithBack,
    back: () => router.back(),
    forward: () => router.forward(),
    push: (...args: Parameters<typeof router.push>) => router.push(...args),
    replace: (...args: Parameters<typeof router.replace>) =>
      router.replace(...args),
    refresh: () => router.refresh(),
    prefetch: (...args: Parameters<typeof router.prefetch>) =>
      router.prefetch(...args),
  };
}
