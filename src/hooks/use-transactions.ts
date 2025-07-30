"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

import type {
  ITransactionDocument,
  ITransactionApiResponse,
} from "@/types/transaction";

export function useTransactions() {
  const [all, setAll] = useState<ITransactionDocument[]>([]);
  const [income, setIncome] = useState<ITransactionDocument[]>([]);
  const [expense, setExpense] = useState<ITransactionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allRes, incomeRes, expenseRes] = await Promise.all([
          api.get<ITransactionApiResponse>("/transactions", {
            signal: controller.signal,
          }),
          api.get<ITransactionApiResponse>("/transactions?type=income", {
            signal: controller.signal,
          }),
          api.get<ITransactionApiResponse>("/transactions?type=expense", {
            signal: controller.signal,
          }),
        ]);

        if (
          allRes.data.success &&
          incomeRes.data.success &&
          expenseRes.data.success
        ) {
          setAll(allRes.data.data as ITransactionDocument[]);
          setIncome(incomeRes.data.data as ITransactionDocument[]);
          setExpense(expenseRes.data.data as ITransactionDocument[]);
        } else {
          throw new Error("One or more responses failed.");
        }
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          setError(err.response?.data?.error || err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  return { all, income, expense, loading, error };
}
