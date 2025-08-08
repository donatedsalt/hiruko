"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  ChartAreaInteractive,
  ChartAreaInteractiveSkeleton,
} from "@/components/chart-area-interactive";
import { DataList, DataListSkeleton } from "@/components/data-list";
import { AccountsCards } from "@/components/accounts-cards";
import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";

export default function Page() {
  const transactions = useQuery(api.transactions.queries.listAllVariants);
  const loading = transactions === undefined;

  return (
    <>
      <SiteHeader title="Overview" />
      <div className="@container/main flex flex-col flex-1 gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <AccountsCards />

          <div className="px-4 lg:px-6">
            {loading ? (
              <ChartAreaInteractiveSkeleton />
            ) : transactions ? (
              <ChartAreaInteractive data={transactions.all} />
            ) : (
              <ErrorMessage error={"Failed to load transactions"} />
            )}
          </div>

          {loading ? (
            <DataListSkeleton />
          ) : transactions ? (
            <DataList
              allData={transactions.all}
              incomeData={transactions.income}
              expenseData={transactions.expense}
            />
          ) : (
            <ErrorMessage error={"Failed to load transactions"} />
          )}
        </div>
      </div>
    </>
  );
}
