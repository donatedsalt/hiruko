"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

import { AccountId } from "@/types/convex";

import { TransactionSchema } from "@/validation/transaction";

import { useSmartRouter } from "@/hooks/use-smart-router";

import { SiteHeader } from "@/components/site-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorMessage } from "@/components/error-message";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Page() {
  const smartRouter = useSmartRouter();
  const accounts = useQuery(api.accounts.queries.list);
  const loading = accounts === undefined;

  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );
  const [transactionAccount, setTransactionAccount] = useState<AccountId | "">(
    ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTransaction = useMutation(api.transactions.mutations.create);

  useEffect(() => {
    if (accounts && accounts.length === 0) {
      toast.info("Please create an account to continue");
      smartRouter.push("/");
    }
    if (accounts && accounts.length > 0 && transactionAccount === "") {
      setTransactionAccount(accounts?.[0]?._id);
    }
  }, [accounts, smartRouter, transactionAccount]);

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
      setIsSubmitting(false);
      return;
    }

    try {
      await createTransaction(result.data);
      toast.success("Transaction added");
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

  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM

  return (
    <>
      <SiteHeader title="Add Transaction" />
      <form onSubmit={handleSubmit} className="grid gap-6 m-4 md:m-6">
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="category">
            Category<span className="text-destructive">*</span>
          </Label>
          <Input
            id="category"
            name="category"
            type="text"
            placeholder="Shopping"
            required
          />
        </div>
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="type">
            Type<span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="type" value={transactionType} />
          <ToggleGroup
            type="single"
            value={transactionType}
            onValueChange={(val: "income" | "expense") => {
              if (val) setTransactionType(val);
            }}
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
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="account">
            Account<span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="account" value={transactionAccount} />
          {loading ? (
            <Skeleton className="w-full h-9" />
          ) : accounts ? (
            <ToggleGroup
              type="single"
              value={transactionAccount}
              onValueChange={(val: AccountId) => {
                if (val) setTransactionAccount(val);
              }}
            >
              {accounts.map((account) => (
                <ToggleGroupItem
                  key={account._id}
                  value={account._id}
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
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="amount">
            Amount<span className="text-destructive">*</span>
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="99.99"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" type="text" placeholder="Shopping" />
        </div>
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            name="note"
            rows={4}
            placeholder="something related to current transaction..."
            className="resize-none"
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-3 *:w-full">
            <Label htmlFor="date">
              Date<span className="text-destructive">*</span>
            </Label>
            <DatePicker id="date" name="date" defaultValue={currentDate} />
          </div>
          <div className="grid gap-3 *:w-full">
            <Label htmlFor="time">
              Time<span className="text-destructive">*</span>
            </Label>
            <Input
              id="time"
              name="time"
              type="time"
              defaultValue={currentTime}
              required
            />
          </div>
        </div>
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={smartRouter.back}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Add Transaction
          </Button>
        </div>
      </form>
    </>
  );
}
