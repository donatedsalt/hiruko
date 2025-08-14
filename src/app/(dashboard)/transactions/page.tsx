"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import { DataList, DataListSkeleton } from "@/components/data-list";

export default function Page() {
  const transactions = useQuery(api.transactions.queries.listAllVariants);
  const categories = useQuery(api.categories.queries.list);
  const loading = transactions === undefined || categories === undefined;

  return (
    <>
      <SiteHeader title="Transactions" />
      <div className="grid h-full my-4">
        {loading ? (
          <DataListSkeleton />
        ) : transactions && categories ? (
          <DataList
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
