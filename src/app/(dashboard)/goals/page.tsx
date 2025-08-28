"use client";

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

  return (
    <>
      <SiteHeader title={"Goals"} />
      <div className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {loading ? (
            <>
              <GoalCardSkeleton />
              <GoalCardSkeleton />
            </>
          ) : (
            goals.map((goal: Goal) => <GoalCard key={goal._id} goal={goal} />)
          )}
          {!loading && goals?.length % 2 ? <AddGoalCard /> : null}
        </div>
        {loading || !(goals?.length % 2) ? <AddGoalCard /> : null}
      </div>
    </>
  );
}
