"use client";

import { useState, useEffect } from "react";

import api from "@/lib/axios";

import type {
  ITransactionDocument,
  ITransactionApiResponse,
} from "@/types/transaction";
import { DataList, DataListSkeleton } from "@/components/data-list";
import { SiteHeader } from "@/components/site-header";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ITransactionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ITransactionApiResponse>("/transactions");

      if (res.data.success && res.data.data && Array.isArray(res.data.data)) {
        setTransactions(res.data.data);
      } else {
        setError(res.data.error || "Failed to fetch transactions.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <>
      <SiteHeader title="Transactions" />
      <section className="grid h-full my-4">
        {loading ? (
          <DataListSkeleton />
        ) : transactions.length > 0 ? (
          <DataList data={transactions} />
        ) : !error ? (
          <div className="content-center text-center">
            <p className="text-xl font-semibold">No transactions found. 😲</p>
          </div>
        ) : (
          <div className="content-center text-center">
            <p className="text-xl font-semibold">Something went wrong.</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}
      </section>
    </>
  );
}
