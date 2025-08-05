"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

// Hide Floating Button on:
// - /transactions/* (but not /transactions)
// - /settings and all its nested routes
const hiddenPatterns = [
  /^\/transactions\/.+$/, // Matches /transactions/anything (but not /transactions)
  /^\/settings(\/.*)?$/, // Matches /settings and any nested route
];

export function FloatingButtons() {
  const pathname = usePathname();

  if (hiddenPatterns.some((pattern) => pattern.test(pathname))) return null;

  return (
    <div className="fixed z-50 flex flex-col items-end gap-4 bottom-4 md:bottom-6 right-4 md:right-6">
      <Button floating asChild>
        <Link href="/transactions/new">
          <IconCirclePlusFilled className="!size-6" />
        </Link>
      </Button>
    </div>
  );
}
