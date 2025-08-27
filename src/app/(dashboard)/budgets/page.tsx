"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Budget } from "@/types/convex";

import {
  BudgetCard,
  AddBudgetCard,
  BudgetCardSkeleton,
} from "@/components/budget-card";
import { SiteHeader } from "@/components/site-header";

export default function BudgetsPage() {
  const budgets = useQuery(api.budgets.queries.list);
  const loading = budgets === undefined;

  return (
    <>
      <SiteHeader title={"Budgets"} />
      <div className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {loading ? (
            <>
              <BudgetCardSkeleton />
              <BudgetCardSkeleton />
            </>
          ) : (
            budgets.map((budget: Budget) => (
              <BudgetCard key={budget._id} budget={budget} />
            ))
          )}
          {!loading && budgets?.length % 2 ? <AddBudgetCard /> : null}
        </div>
        {loading || !(budgets?.length % 2) ? <AddBudgetCard /> : null}
      </div>
    </>
  );
}
