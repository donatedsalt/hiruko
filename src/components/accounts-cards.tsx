"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import type { Account } from "@/types/convex";

import {
  AccountCardSkeleton,
  AccountCard,
  AddAccountCard,
} from "@/components/account-card";

export function AccountsCards({ accounts }: { accounts?: Account[] }) {
  const fallback = useQuery(
    api.accounts.queries.list,
    accounts === undefined ? {} : "skip",
  );
  const resolved = accounts ?? fallback;

  if (resolved === undefined) {
    return (
      <div className="scrollbar-none flex gap-4 overflow-auto">
        <AccountCardSkeleton />
        <AddAccountCard />
      </div>
    );
  }

  return (
    <div className="scrollbar-none flex gap-4 overflow-auto">
      {resolved.map((account) => (
        <AccountCard key={account._id} account={account} />
      ))}

      <AddAccountCard />
    </div>
  );
}
