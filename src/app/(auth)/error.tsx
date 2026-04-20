"use client";

import { useEffect } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/error-message";

export default function AuthError({
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
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <ErrorMessage error={error.message} />
        <Button onClick={reset} variant="outline">
          <IconRefresh />
          Try again
        </Button>
      </div>
    </div>
  );
}
