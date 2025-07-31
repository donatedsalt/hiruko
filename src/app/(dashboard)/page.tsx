"use client";

import { useTransactions } from "@/hooks/use-transactions";

import {
  ChartAreaInteractive,
  ChartAreaInteractiveSkeleton,
} from "@/components/chart-area-interactive";
import { DataList, DataListSkeleton } from "@/components/data-list";
import { AccountsCards } from "@/components/accounts-cards";
import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";

export default function Page() {
  const { all, income, expense, loading, error } = useTransactions();

  return (
    <>
      <SiteHeader title="Overview" />
      <div className="@container/main flex flex-col flex-1 gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <AccountsCards />

          <div className="px-4 lg:px-6">
            {loading ? (
              <ChartAreaInteractiveSkeleton />
            ) : !error ? (
              <ChartAreaInteractive data={all} />
            ) : (
              <ErrorMessage error={error} />
            )}
          </div>

          {loading ? (
            <DataListSkeleton />
          ) : !error ? (
            <DataList allData={all} incomeData={income} expenseData={expense} />
          ) : (
            <ErrorMessage error={error} />
          )}
        </div>
      </div>
    </>
  );
}
