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
    <div className={cn("min-h-64 content-center text-center", className)}>
      <p className="text-xl font-semibold">
        {error ?? "Something went wrong. 😞"}
      </p>
      {error && (
        <p className="text-muted-foreground text-sm">Please try again.</p>
      )}
    </div>
  );
};
