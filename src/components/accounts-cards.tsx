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

  const handleUpdateAccount = (newAccount: IAccountDocument) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account._id === newAccount._id ? newAccount : account
      )
    );
  };

  const handleRemoveAccount = (account: IAccountDocument) => {
    setAccounts((prev) => prev.filter((a) => a._id !== account._id));
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
            account={account}
            onRemove={handleRemoveAccount}
            onUpdate={handleUpdateAccount}
          />
        ))
      )}

      <AddAccountCard onAdd={handleAddAccount} />
    </div>
  );
}
