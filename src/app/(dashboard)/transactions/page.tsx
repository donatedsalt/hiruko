"use client";

import { useTransactions } from "@/hooks/use-transactions";

import { DataList, DataListSkeleton } from "@/components/data-list";
import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";

export default function Page() {
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
          <ErrorMessage error={error} />
        )}
      </div>
    </>
  );
}
