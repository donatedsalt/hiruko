"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconLoader2,
} from "@tabler/icons-react";

import { AccountId, Transaction, TransactionId } from "@/types/convex";

import { TransactionSchema } from "@/validation/transaction";

import { useSmartRouter } from "@/hooks/use-smart-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site-header";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorMessage } from "@/components/error-message";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Page() {
  const { id } = useParams();
  const smartRouter = useSmartRouter();
  const transaction = useQuery(api.transactions.queries.getById, {
    id: id as TransactionId,
  });
  const loading = transaction === undefined;
  const accounts = useQuery(api.accounts.queries.list);
  const accLoading = accounts === undefined;
  const updateTransaction = useMutation(api.transactions.mutations.update);
  const deleteTransaction = useMutation(api.transactions.mutations.remove);

  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );
  const [transactionAccount, setTransactionAccount] = useState<AccountId | "">(
    ""
  );
  const [transactionTime, setTransactionTime] = useState({
    date: "",
    time: "",
  });
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (transaction) {
      setTransactionAccount(transaction.accountId);

      setTransactionType(transaction.type);

      const date = new Date(transaction.transactionTime)
        .toISOString()
        .split("T")[0];
      const time = new Date(transaction.transactionTime)
        .toTimeString()
        .slice(0, 5);
      setTransactionTime({ date: date, time: time });
    }
  }, [transaction]);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteTransaction({ id: transaction?._id as TransactionId });
      toast.success("Transaction deleted");
      setOpen(false);
      smartRouter.replaceWithBack();
    } catch (err: any) {
      toast.error("Something went wrong!", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const accountId = formData.get("account") as AccountId;
    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as "income" | "expense";
    const title = formData.get("title") as string;
    const note = formData.get("note") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;

    const transactionTime = new Date(`${date}T${time}`).getTime();

    const payload = {
      accountId,
      category,
      amount,
      type,
      title: title || undefined,
      note: note || undefined,
      transactionTime,
    };

    const result = TransactionSchema.omit({ userId: true }).safeParse(payload);

    if (!result.success) {
      result.error.issues.slice(0, 3).forEach((issue) => {
        toast.warning(issue.message, {
          description: "Please check your input.",
        });
      });
      if (result.error.issues.length > 3) {
        toast.warning("Some other fields may have issues too.", {
          description: "Scroll to review your form.",
        });
      }
      return;
    }

    try {
      await updateTransaction({
        id: transaction!._id,
        updates: result.data as Transaction,
      });
      toast.success("Transaction updated");
      form.reset();
      smartRouter.back();
    } catch (err: any) {
      toast.error("Something went wrong!", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SiteHeader title="Edit Transaction" />

      {loading ? (
        <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
          <IconLoader2 className="animate-spin" />
          <span>Loading...</span>
        </div>
      ) : transaction ? (
        <form onSubmit={handleSubmit} className="grid gap-6 m-4 md:m-6 ">
          <div className="grid **:disabled:opacity-75 gap-3 *:w-full">
            <Label htmlFor="category">
              Category<span className="text-destructive">*</span>
            </Label>
            <Input
              id="category"
              name="category"
              type="text"
              placeholder="Shopping"
              defaultValue={transaction?.category}
              required
              disabled={!isEditing}
            />
          </div>
          <div className="grid **:disabled:opacity-75 gap-3 *:w-full">
            <Label htmlFor="type">
              Type<span className="text-destructive">*</span>
            </Label>
            <input
              type="hidden"
              name="type"
              value={transactionType}
              disabled={!isEditing}
            />
            <ToggleGroup
              type="single"
              value={transactionType}
              onValueChange={(val: "income" | "expense") => {
                if (val) setTransactionType(val);
              }}
              disabled={!isEditing}
            >
              <ToggleGroupItem
                value="expense"
                aria-label="Toggle expense"
                className="border dark:bg-input/30 data-[state=on]:bg-destructive! text-destructive-foreground"
              >
                <IconCaretDownFilled />
                <span>Expense</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="income"
                aria-label="Toggle income"
                className="border dark:bg-input/30 data-[state=on]:bg-emerald-500! text-foreground"
              >
                <IconCaretUpFilled />
                <span>Income</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="grid **:disabled:opacity-75 gap-3 *:w-full">
            <Label htmlFor="account">
              Account<span className="text-destructive">*</span>
            </Label>
            <input
              type="hidden"
              name="account"
              value={transactionAccount}
              disabled={!isEditing}
            />
            {accLoading ? (
              <Skeleton className="w-full h-9" />
            ) : accounts ? (
              <ToggleGroup
                type="single"
                value={transactionAccount}
                onValueChange={(val: AccountId) => {
                  if (val) setTransactionAccount(val);
                }}
                disabled={!isEditing}
              >
                {accounts.map((account) => (
                  <ToggleGroupItem
                    key={account._id.toString()}
                    value={account._id.toString()}
                    className="border dark:bg-input/30 dark:data-[state=on]:bg-input"
                  >
                    {account.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : (
              <ErrorMessage
                error={"Failed to load accounts"}
                className="min-h-36"
              />
            )}
          </div>
          <div className="grid **:disabled:opacity-75 gap-3 *:w-full">
            <Label htmlFor="amount">
              Amount<span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="99.99"
              defaultValue={transaction?.amount}
              required
              min="0.01"
              step="0.01"
              disabled={!isEditing}
            />
          </div>
          <div className="grid **:disabled:opacity-75 gap-3 *:w-full">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Shopping"
              defaultValue={transaction?.title}
              disabled={!isEditing}
            />
          </div>
          <div className="grid **:disabled:opacity-75 gap-3 *:w-full">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              name="note"
              rows={4}
              placeholder="something related to current transaction..."
              defaultValue={transaction?.note}
              className="resize-none"
              disabled={!isEditing}
            />
          </div>
          <div className="grid **:disabled:opacity-75 gap-6 sm:grid-cols-2">
            <div className="grid gap-3 *:w-full">
              <Label htmlFor="date">
                Date<span className="text-destructive">*</span>
              </Label>
              <DatePicker
                id="date"
                name="date"
                defaultValue={transactionTime.date}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-3 *:w-full">
              <Label htmlFor="time">
                Time<span className="text-destructive">*</span>
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                defaultValue={transactionTime.time}
                required
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-6 sm:flex-row">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={isSubmitting}>
                  Delete
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
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    smartRouter.back();
                  }
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {isEditing ? (
                <Button type="submit" disabled={isSubmitting}>
                  Save changes
                </Button>
              ) : (
                // idk whats wrong with this but it doesnt work normally
                <Button asChild>
                  <button type="button" onClick={() => setIsEditing(true)}>
                    Enable Editing
                  </button>
                </Button>
              )}
            </div>
          </div>
        </form>
      ) : (
        <ErrorMessage error="Transaction not found." />
      )}
    </>
  );
}
