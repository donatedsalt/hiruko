"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  TransactionList,
  TransactionListSkeleton,
} from "@/components/transaction-list";
import { AccountsCards } from "@/components/accounts-cards";
import { ErrorMessage } from "@/components/error-message";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const ChartAreaInteractive = dynamic(
  () =>
    import("@/components/chart-area-interactive").then((m) => ({
      default: m.ChartAreaInteractive,
    })),
  { ssr: false, loading: () => <Skeleton className="h-98" /> },
);

const DASHBOARD_TXN_LIMIT = 10;

export default function Page() {
  const home = useQuery(api.users.queries.homeDefaults, {
    recentLimit: DASHBOARD_TXN_LIMIT,
  });
  const loading = home === undefined;

  return (
    <>
      <SiteHeader title="Overview" />
      <main className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
        <AccountsCards accounts={home?.accounts} />
        <ChartAreaInteractive />

        {loading ? (
          <TransactionListSkeleton />
        ) : home ? (
          <>
            <TransactionList
              allData={home.recent.all}
              incomeData={home.recent.income}
              expenseData={home.recent.expense}
              categories={home.categories}
              showEndMarker={false}
            />
            {(home.recent.hasMoreAll ||
              home.recent.hasMoreIncome ||
              home.recent.hasMoreExpense) && (
              <div className="grid place-items-center">
                <Button asChild variant="outline">
                  <Link href="/transactions">View More</Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <ErrorMessage error="Failed to load transactions" />
        )}
      </main>
    </>
  );
}
