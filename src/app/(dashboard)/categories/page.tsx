"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import { CategoryList, CategoryListSkeleton } from "@/components/category-list";
import { CategoryDialog } from "@/components/category-dialog";

export default function Page() {
  const categories = useQuery(api.categories.queries.list);
  const loading = categories === undefined;

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
      <SiteHeader title="Categories" />
      <main className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {loading ? (
          <CategoryListSkeleton />
        ) : categories ? (
          <CategoryList Data={categories} />
        ) : (
          <ErrorMessage error={"Failed to load categories"} />
        )}
        <CategoryDialog
          mode="add"
          open={addOpen}
          onOpenChange={setAddOpen}
          trigger={<span className="hidden" aria-hidden />}
        />
      </main>
    </>
  );
}
