"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import { ChartPie, ChartPieSkeleton } from "@/components/pie-chart";
import { useEffect, useState } from "react";
import { Category } from "@/types/convex";

export default function Page() {
  const categories = useQuery(api.categories.queries.list);
  const loading = categories === undefined;

  const [incCats, setIncCats] = useState<Category[] | undefined>();
  const [expCats, setExpCats] = useState<Category[] | undefined>();

  useEffect(() => {
    if (!categories) return;
    setIncCats(categories.filter((cat) => cat.type === "income"));
    setExpCats(categories.filter((cat) => cat.type === "expense"));
  }, [categories]);

  return (
    <>
      <SiteHeader title="Statistics" />
      <div className="@container/main flex flex-col flex-1 gap-4 py-4 md:gap-6 md:py-6">
        {loading ? (
          <ChartPieSkeleton />
        ) : categories ? (
          <div className="grid grid-cols-1 gap-4 px-4 md:gap-6 lg:grid-cols-2 lg:px-6">
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
