"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import { ChartPie, ChartPieSkeleton } from "@/components/pie-chart";

export default function Page() {
  const categories = useQuery(api.categories.queries.list);
  const loading = categories === undefined;

  const incCats = useMemo(
    () => categories?.filter((cat) => cat.type === "income"),
    [categories],
  );
  const expCats = useMemo(
    () => categories?.filter((cat) => cat.type === "expense"),
    [categories],
  );

  return (
    <>
      <SiteHeader title="Statistics" />
      <div className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
        {loading ? (
          <ChartPieSkeleton />
        ) : categories ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            <ChartPie title={"Income by Category"} categories={incCats} />
            <ChartPie title={"Expense by Category"} categories={expCats} />
          </div>
        ) : (
          <ErrorMessage error={"Failed to load categories"} />
        )}
      </div>
    </>
  );
}
