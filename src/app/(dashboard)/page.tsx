"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  ChartAreaInteractive,
  ChartAreaInteractiveSkeleton,
} from "@/components/chart-area-interactive";
import {
  TransactionList,
  TransactionListSkeleton,
} from "@/components/transaction-list";
import { AccountsCards } from "@/components/accounts-cards";
import { ErrorMessage } from "@/components/error-message";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const DASHBOARD_TXN_LIMIT = 10;

export default function Page() {
  const transactions = useQuery(api.transactions.queries.listAllVariants);
  const categories = useQuery(api.categories.queries.list);
  const loading = transactions === undefined || categories === undefined;

  return (
    <>
      <SiteHeader title="Overview" />
      <div className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
        <AccountsCards />

        {loading ? (
          <>
            <ChartAreaInteractiveSkeleton />
            <TransactionListSkeleton />
          </>
        ) : transactions && categories ? (
          <>
            <ChartAreaInteractive data={transactions.all} />
            <TransactionList
              allData={transactions.all.slice(0, DASHBOARD_TXN_LIMIT)}
              incomeData={transactions.income.slice(0, DASHBOARD_TXN_LIMIT)}
              expenseData={transactions.expense.slice(0, DASHBOARD_TXN_LIMIT)}
              categories={categories}
              showEndMarker={false}
            />
            {transactions.all.length > DASHBOARD_TXN_LIMIT && (
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
      </div>
    </>
  );
}
