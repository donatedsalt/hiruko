"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Budget } from "@/types/convex";

import {
  BudgetCard,
  AddBudgetCard,
  BudgetCardSkeleton,
} from "@/components/budget-card";
import { SiteHeader } from "@/components/site-header";

function NewParamWatcher({ onOpen }: { onOpen: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      onOpen();
      router.replace(pathname);
    }
  }, [searchParams, router, pathname, onOpen]);

  return null;
}

export default function BudgetsPage() {
  const budgets = useQuery(api.budgets.queries.list);
  const loading = budgets === undefined;

  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <SiteHeader title={"Budgets"} />
      <Suspense fallback={null}>
        <NewParamWatcher onOpen={() => setAddOpen(true)} />
      </Suspense>
      <main className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
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
          {!loading && (
            <AddBudgetCard open={addOpen} onOpenChange={setAddOpen} />
          )}
        </div>
      </main>
    </>
  );
}
