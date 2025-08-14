"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  ChartAreaInteractive,
  ChartAreaInteractiveSkeleton,
} from "@/components/chart-area-interactive";
import { DataList, DataListSkeleton } from "@/components/data-list";
import { AccountsCards } from "@/components/accounts-cards";
import { ErrorMessage } from "@/components/error-message";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  const transactions = useQuery(api.transactions.queries.listAllVariants);
  const categories = useQuery(api.categories.queries.list);
  const loading = transactions === undefined || categories === undefined;

  return (
    <>
      <SiteHeader title="Overview" />
      <div className="@container/main flex flex-col flex-1 gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <AccountsCards />

          {loading ? (
            <>
              <ChartAreaInteractiveSkeleton />
              <DataListSkeleton />
            </>
          ) : transactions && categories ? (
            <>
              <ChartAreaInteractive data={transactions.all} />
              <DataList
                allData={transactions.all}
                incomeData={transactions.income}
                expenseData={transactions.expense}
                categories={categories}
              />
            </>
          ) : (
            <ErrorMessage error="Failed to load transactions" />
          )}
        </div>
      </div>
    </>
  );
}
