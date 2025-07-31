"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

const hiddenRoutes = ["/transactions/add", "/transactions/edit", "/settings"];

export function FloatingButtons() {
  const pathname = usePathname();

  if (hiddenRoutes.includes(pathname)) return null;

  return (
    <div className="fixed z-50 flex flex-col items-end gap-4 bottom-6 right-6">
      <Button floating asChild>
        <Link href="/transactions/add">
          <IconCirclePlusFilled className="!size-6" />
        </Link>
      </Button>
    </div>
  );
}
