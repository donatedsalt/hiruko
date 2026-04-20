"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Goal } from "@/types/convex";

import {
  GoalCard,
  AddGoalCard,
  GoalCardSkeleton,
} from "@/components/goal-card";
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

export default function GoalsPage() {
  const goals = useQuery(api.goals.queries.list);
  const loading = goals === undefined;

  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <SiteHeader title={"Goals"} />
      <Suspense fallback={null}>
        <NewParamWatcher onOpen={() => setAddOpen(true)} />
      </Suspense>
      <main className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {loading ? (
            <>
              <GoalCardSkeleton />
              <GoalCardSkeleton />
            </>
          ) : (
            goals.map((goal: Goal) => <GoalCard key={goal._id} goal={goal} />)
          )}
          {!loading && <AddGoalCard open={addOpen} onOpenChange={setAddOpen} />}
        </div>
      </main>
    </>
  );
}
