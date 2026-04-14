import React from "react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error?: string | null;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  className,
}) => {
  return (
    <div className={cn("text-center content-center min-h-64", className)}>
      <p className="text-xl font-semibold">
        {error ?? "Something went wrong. 😞"}
      </p>
      {error && (
        <p className="text-sm text-muted-foreground">Please try again.</p>
      )}
    </div>
  );
};
