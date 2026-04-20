"use client";

import { useEffect } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/error-message";
import { SiteHeader } from "@/components/site-header";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader title="Something went wrong" />
      <div className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
        <ErrorMessage error={error.message} />
        <div className="flex justify-center">
          <Button onClick={reset} variant="outline">
            <IconRefresh />
            Try again
          </Button>
        </div>
      </div>
    </>
  );
}
