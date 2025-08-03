"use client";

import { format } from "date-fns";
import { useParams } from "next/navigation";

import { useTransaction } from "@/hooks/use-transaction";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";

export default function Page() {
  const { id } = useParams();
  const { transaction, loading, error } = useTransaction(id as string);

  return (
    <>
      <SiteHeader title="Transaction Details" />

      {loading || (!transaction && !error) ? (
        <div className="text-center mt-6 text-muted-foreground">Loading...</div>
      ) : error ? (
        <ErrorMessage error="Transaction not found." />
      ) : (
        <div className="space-y-2 text-sm text-muted-foreground px-6 py-4 max-w-2xl mx-auto">
          <p className="flex justify-between gap-3">
            <span className="font-semibold text-foreground">Type:</span>
            <span>{transaction?.type}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="font-semibold text-foreground">Category:</span>
            <span>{transaction?.category}</span>
          </p>
          {transaction?.title && (
            <p className="flex justify-between gap-3">
              <span className="font-semibold text-foreground">Title:</span>
              <span>{transaction.title}</span>
            </p>
          )}
          {transaction?.note && (
            <p className="flex justify-between gap-3">
              <span className="font-semibold text-foreground">Note:</span>
              <span>{transaction.note}</span>
            </p>
          )}
          <p className="flex justify-between gap-3">
            <span className="font-semibold text-foreground">Amount:</span>
            <span>
              {transaction?.amount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="font-semibold text-foreground">
              Transaction Time:
            </span>
            {format(new Date(transaction!.transactionTime), "PPPpp")}
          </p>
          <p className="flex justify-between gap-3">
            <span className="font-semibold text-foreground">Account:</span>
            <span>
              {typeof transaction?.account === "object" &&
              "name" in (transaction?.account ?? {})
                ? (transaction.account as { name: string }).name
                : "-"}
            </span>
          </p>
        </div>
      )}
    </>
  );
}
