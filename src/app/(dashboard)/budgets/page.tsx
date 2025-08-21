"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreateBudgetDialog } from "@/components/create-budget-dialog";
import { SiteHeader } from "@/components/site-header";

export default function BudgetsPage() {
  const budgets = useQuery(api.budgets.queries.getBudgetsWithProgress);

  if (!budgets) return <p>Loading...</p>;

  return (
    <>
      <SiteHeader title={"Budgets"} />
      <div className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid gap-4">
          {budgets.map((b) => (
            <Card key={b._id}>
              <CardHeader>
                <CardTitle>{b.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  ${b.spent} / ${b.amount} used
                </p>
                <Progress value={b.percent} className="mt-2" />
                <p className="text-sm text-muted-foreground">
                  {b.remaining >= 0
                    ? `$${b.remaining} left`
                    : `Over budget by $${Math.abs(b.remaining)}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <CreateBudgetDialog />
      </div>
    </>
  );
}
