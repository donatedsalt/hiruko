"use client";

import api from "@/lib/axios";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";

import { useTransaction } from "@/hooks/use-transaction";
import { useSafeBack } from "@/hooks/use-safe-back";

import { SiteHeader } from "@/components/site-header";
import { ErrorMessage } from "@/components/error-message";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Page() {
  const { id } = useParams();
  const safeBack = useSafeBack();
  const { transaction, loading, error } = useTransaction(id as string);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    const loadingToast = toast.loading("Deleting transaction...");
    try {
      const res = await api.delete(`/transactions/${id}`);
      if (res.status === 200) {
        toast.success("Transaction deleted");
        setOpen(false);
        safeBack();
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch (err: any) {
      toast.error("Something went wrong", {
        description: err.response?.data?.error || err.message,
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

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
              {(transaction?.account as { name?: string })?.name ?? "-"}
            </span>
          </p>
          <div className="flex justify-end gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <IconTrash /> Delete
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Transaction</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this transaction? This action
                  cannot be undone.
                </p>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </>
  );
}
