"use client";

import { useTransactions } from "@/hooks/use-transactions";

import { DataList, DataListSkeleton } from "@/components/data-list";
import { SiteHeader } from "@/components/site-header";

export default function TransactionsPage() {
  const { all, income, expense, loading, error } = useTransactions();

  return (
    <>
      <SiteHeader title="Transactions" />
      <div className="grid h-full my-4">
        {loading ? (
          <DataListSkeleton />
        ) : !error ? (
          <DataList allData={all} incomeData={income} expenseData={expense} />
        ) : (
          <div className="content-center text-center">
            <p className="text-xl font-semibold">Something went wrong.</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}
      </div>
    </>
  );
}
