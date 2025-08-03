"use client";

import { useAccounts } from "@/hooks/use-account";

import { ErrorMessage } from "@/components/error-message";
import {
  AccountsCardSkeleton,
  AccountsCard,
  AddAccountCard,
} from "@/components/account-card";
import { useEffect, useState } from "react";
import { IAccountDocument } from "@/types/account";

export function AccountsCards() {
  const { accounts: initialAccounts, loading, error } = useAccounts();
  const [accounts, setAccounts] = useState<IAccountDocument[]>([]);

  useEffect(() => {
    if (initialAccounts) {
      setAccounts(initialAccounts);
    }
  }, [initialAccounts]);

  const handleAddAccount = (newAccount: IAccountDocument) => {
    setAccounts((prev) => [...prev, newAccount]);
  };

  return (
    <div className="flex gap-4 px-4 overflow-auto lg:px-6 scrollbar-none">
      {loading ? (
        <>
          <AccountsCardSkeleton />
        </>
      ) : error ? (
        <ErrorMessage error={error} className="min-h-36" />
      ) : (
        accounts.map((account) => (
          <AccountsCard
            key={account._id.toString()}
            name={account.name}
            balance={account.balance}
            transactionsCount={account.transactionsCount}
          />
        ))
      )}

      <AddAccountCard onAdd={handleAddAccount} />
    </div>
  );
}
