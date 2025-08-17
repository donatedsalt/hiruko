"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import {
  TransactionList,
  DataListSkeleton,
} from "@/components/transaction-list";

export default function Page() {
  const transactions = useQuery(api.transactions.queries.listAllVariants);
  const categories = useQuery(api.categories.queries.list);
  const loading = transactions === undefined || categories === undefined;

  return (
    <>
      <SiteHeader title="Transactions" />
      <div className="@container/main flex flex-col flex-1 gap-4 py-4 md:gap-6 md:py-6">
        {loading ? (
          <DataListSkeleton />
        ) : transactions && categories ? (
          <TransactionList
            allData={transactions.all}
            incomeData={transactions.income}
            expenseData={transactions.expense}
            categories={categories}
          />
        ) : (
          <ErrorMessage error={"Failed to load transactions"} />
        )}
      </div>
    </>
  );
}
