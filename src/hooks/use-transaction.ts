"use client";

import { useEffect, useState } from "react";

import api from "@/lib/axios";

import type { ITransactionDocument } from "@/types/transaction";

export function useTransaction(id: string) {
  const [transaction, setTransaction] = useState<ITransactionDocument | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/transactions/${id}`, {
          signal: controller.signal,
        });

        if (res.data.success) {
          setTransaction(res.data.data as ITransactionDocument);
        } else {
          setError(res.data.error || "Failed to fetch transaction.");
          setTransaction(null);
        }
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          const message =
            err?.response?.data?.error || err.message || "Unknown error.";
          setError(message);
          setTransaction(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();

    return () => controller.abort();
  }, [id]);

  return { transaction, loading, error };
}
