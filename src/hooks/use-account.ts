"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import type { IAccountDocument } from "@/types/account";

export function useAccounts() {
  const [accounts, setAccounts] = useState<IAccountDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAccounts() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/accounts", {
          signal: controller.signal,
        });

        if (res.data.success) {
          setAccounts(res.data.data as IAccountDocument[]);
        } else {
          setError(res.data.error || "Failed to fetch accounts.");
        }
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          setError(err?.response?.data?.error || err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();

    return () => controller.abort();
  }, []);

  return { accounts, loading, error };
}
