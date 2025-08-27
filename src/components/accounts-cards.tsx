"use client";

import { ErrorMessage } from "@/components/error-message";
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
      <div className="flex gap-4 px-4 overflow-auto lg:px-6 scrollbar-none">
        <AccountCardSkeleton />
        <AddAccountCard />
      </div>
    );
  }

  if (accounts instanceof Error) {
    return <ErrorMessage error={accounts.message} className="min-h-36" />;
  }

  return (
    <div className="flex gap-4 px-4 overflow-auto lg:px-6 scrollbar-none">
      {accounts.map((account) => (
        <AccountCard key={account._id} account={account} />
      ))}

      <AddAccountCard />
    </div>
  );
}
