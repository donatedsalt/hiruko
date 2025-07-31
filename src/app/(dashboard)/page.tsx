"use client";

import { useTransactions } from "@/hooks/use-transactions";

import {
  ChartAreaInteractive,
  ChartAreaInteractiveSkeleton,
} from "@/components/chart-area-interactive";
import { DataList, DataListSkeleton } from "@/components/data-list";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  const { all, income, expense, loading, error } = useTransactions();

  return (
    <>
      <SiteHeader title="Overview" />
      <div className="@container/main flex flex-col flex-1 gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />

          <div className="px-4 lg:px-6">
            {loading ? (
              <ChartAreaInteractiveSkeleton />
            ) : !error ? (
              <ChartAreaInteractive data={all} />
            ) : (
              <div className="content-center text-center min-h-64">
                <p className="text-xl font-semibold">Something went wrong.</p>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            )}
          </div>

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
      </div>
    </>
  );
}
