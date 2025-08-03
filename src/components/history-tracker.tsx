"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HISTORY_KEY = "visitedPaths";
const MAX_HISTORY_LENGTH = 10;

const IGNORED_PATHS = ["/sign-in", "/sign-up"];

function updateHistory(path: string) {
  if (IGNORED_PATHS.includes(path)) return;

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    let history: string[] = raw ? JSON.parse(raw) : [];

    // Prevent duplication of current path
    if (history[history.length - 1] === path) return;

    // Remove the current path if it already exists (to ensure uniqueness)
    history = history.filter((p) => p !== path);

    // Add the path at the end
    history.push(path);

    // Keep only the last MAX_HISTORY_LENGTH items
    if (history.length > MAX_HISTORY_LENGTH) {
      history = history.slice(history.length - MAX_HISTORY_LENGTH);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn("Failed to update history:", err);
  }
}

export function HistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    updateHistory(pathname);
  }, [pathname]);

  return null;
}
