"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const HISTORY_KEY_PREFIX = "visitedPaths:";
const ANON_SCOPE = "anon";
const MAX_HISTORY_LENGTH = 10;
const IGNORED_PATHS = ["/sign-in", "/sign-up"];

export function historyKey(userId: string | null | undefined) {
  return `${HISTORY_KEY_PREFIX}${userId ?? ANON_SCOPE}`;
}

function updateHistory(key: string, path: string) {
  if (IGNORED_PATHS.some((p) => path.startsWith(p))) return;

  try {
    const raw = localStorage.getItem(key);
    let history: string[] = raw ? JSON.parse(raw) : [];

    if (history[history.length - 1] === path) return;

    history = history.filter((p) => p !== path);
    history.push(path);

    if (history.length > MAX_HISTORY_LENGTH) {
      history = history.slice(history.length - MAX_HISTORY_LENGTH);
    }

    localStorage.setItem(key, JSON.stringify(history));
  } catch (err) {
    console.warn("Failed to update history:", err);
  }
}

export function HistoryTracker() {
  const pathname = usePathname();
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    updateHistory(historyKey(userId), pathname);
  }, [pathname, userId, isLoaded]);

  return null;
}
