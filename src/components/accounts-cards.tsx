"use client";

import {
  AccountCardSkeleton,
  AccountCard,
  AddAccountCard,
} from "@/components/account-card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AccountsCards() {
  const accounts = useQuery(api.accounts.queries.list);

  if (accounts === undefined) {
    return (
      <div className="flex gap-4 overflow-auto scrollbar-none">
        <AccountCardSkeleton />
        <AddAccountCard />
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-auto scrollbar-none">
      {accounts.map((account) => (
        <AccountCard key={account._id} account={account} />
      ))}

      <AddAccountCard />
    </div>
  );
}
