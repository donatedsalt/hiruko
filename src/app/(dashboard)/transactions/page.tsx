"use client";

import { useEffect, useRef } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import type { Transaction, Category } from "@/types/convex";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import {
  RenderGroupedList,
  TransactionListSkeleton,
} from "@/components/transaction-list";
import { EmptyState } from "@/components/list-item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 20;
const PAGINATION_OPTIONS = { initialNumItems: PAGE_SIZE } as const;
const EMPTY_ARGS = {} as const;
const INCOME_ARGS = { type: "income" } as const;
const EXPENSE_ARGS = { type: "expense" } as const;

type TxnType = "income" | "expense" | undefined;

function PaginatedTab({
  type,
  categories,
  emptyText,
}: {
  type: TxnType;
  categories: Category[];
  emptyText: string;
}) {
  const args =
    type === "income"
      ? INCOME_ARGS
      : type === "expense"
        ? EXPENSE_ARGS
        : EMPTY_ARGS;
  const { results, status, loadMore } = usePaginatedQuery(
    api.transactions.queries.listPaginated,
    args,
    PAGINATION_OPTIONS,
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (status !== "CanLoadMore") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadMore(PAGE_SIZE);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [status, loadMore]);

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col">
        <Skeleton className="my-3 h-4 w-32" />
        <ul className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <li key={i}>
              <Skeleton className="h-14 w-full" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!results.length) {
    return <EmptyState text={emptyText} />;
  }

  return (
    <div>
      <RenderGroupedList
        transactions={results as Transaction[]}
        categories={categories}
        showEndMarker={false}
      />
      <div ref={sentinelRef} aria-hidden className="h-1" />
      {status === "LoadingMore" && (
        <div className="text-muted-foreground grid place-items-center py-6 text-sm">
          <p>Loading more…</p>
        </div>
      )}
      {status === "Exhausted" && (
        <div className="grid place-items-center py-12">
          <p>End of list 🫡</p>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const categories = useQuery(api.categories.queries.list);
  const initialLoading = categories === undefined;

  return (
    <>
      <SiteHeader title="Transactions" />
      <main className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {initialLoading ? (
          <TransactionListSkeleton />
        ) : categories ? (
          <Tabs
            defaultValue="all"
            className="w-full flex-col justify-start gap-4 md:gap-6"
          >
            <div>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expense</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="flex flex-col">
              <PaginatedTab
                type={undefined}
                categories={categories}
                emptyText="No transactions found. 😲"
              />
            </TabsContent>

            <TabsContent value="income" className="flex flex-col">
              <PaginatedTab
                type="income"
                categories={categories}
                emptyText="No income found. 😬"
              />
            </TabsContent>

            <TabsContent value="expense" className="flex flex-col">
              <PaginatedTab
                type="expense"
                categories={categories}
                emptyText="No expense found. 🤯"
              />
            </TabsContent>
          </Tabs>
        ) : (
          <ErrorMessage error={"Failed to load transactions"} />
        )}
      </main>
    </>
  );
}
