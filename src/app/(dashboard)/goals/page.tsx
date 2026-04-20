"use client";

import { useEffect, useState } from "react";
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

export default function GoalsPage() {
  const goals = useQuery(api.goals.queries.list);
  const loading = goals === undefined;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setAddOpen(true);
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  return (
    <>
      <SiteHeader title={"Goals"} />
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
