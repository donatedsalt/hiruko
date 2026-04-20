"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import { CategoryList, CategoryListSkeleton } from "@/components/category-list";
import { CategoryDialog } from "@/components/category-dialog";

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

export default function Page() {
  const categories = useQuery(api.categories.queries.list);
  const loading = categories === undefined;

  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <SiteHeader title="Categories" />
      <Suspense fallback={null}>
        <NewParamWatcher onOpen={() => setAddOpen(true)} />
      </Suspense>
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
