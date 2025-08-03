"use client";

import { useRouter } from "next/navigation";

export function useSafeBack(fallbackUrl: string = "/") {
  const router = useRouter();

  const safeBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return safeBack;
}
