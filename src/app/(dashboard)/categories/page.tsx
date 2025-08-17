"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import { CateogryList, DataListSkeleton } from "@/components/category-list";

export default function Page() {
  const categories = useQuery(api.categories.queries.list);
  const loading = categories === undefined;

  return (
    <>
      <SiteHeader title="Categories" />
      <div className="@container/main flex flex-col flex-1 gap-4 py-4 md:gap-6 md:py-6">
        {loading ? (
          <DataListSkeleton />
        ) : categories ? (
          <CateogryList Data={categories} />
        ) : (
          <ErrorMessage error={"Failed to load categories"} />
        )}
      </div>
    </>
  );
}
