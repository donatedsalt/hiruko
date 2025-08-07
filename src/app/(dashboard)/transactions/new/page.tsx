"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

import { ITransactionApiResponse } from "@/types/transaction";

import api from "@/lib/axios";

import { useAccounts } from "@/hooks/use-account";
import { useSmartRouter } from "@/hooks/use-smart-router";

import { TransactionSchema } from "@/validation/transaction";

import { SiteHeader } from "@/components/site-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/error-message";

export default function Page() {
  const smartRouter = useSmartRouter();
  const { accounts, loading, error } = useAccounts();
  const [transactionType, setTransactionType] = useState("expense");
  const [transactionAccount, setTransactionAccount] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (accounts.length === 0) {
        smartRouter.push("/");
        toast.info("Please create an account to continue");
        return;
      }
    }, 1000);

    if (accounts && accounts.length > 0 && transactionAccount === "") {
      setTransactionAccount(accounts[0]._id.toString());
    }

    return () => clearTimeout(timeout);
  }, [accounts, smartRouter, transactionAccount]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const loadingToast = toast.loading("Processing request...");

    const account = formData.get("account") as string;
    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as "income" | "expense";
    const title = formData.get("title") as string;
    const note = formData.get("note") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;

    const transactionTime = new Date(`${date}T${time}`);

    const payload = {
      account,
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
      const res = await api.post<ITransactionApiResponse>(
        "/transactions",
        result.data
      );
      const response = res.data;

      if (response.success && response.data && !Array.isArray(response.data)) {
        toast.success("Transaction added");
        smartRouter.back();
      } else {
        toast.error("Failed to create transaction.", {
          description: response.error,
        });
      }
    } catch (err: any) {
      toast.error("Something went wrong!", {
        description: err.response?.data?.error || err.message,
      });
    } finally {
      toast.dismiss(loadingToast);
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
            onValueChange={(val: string) => {
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
          ) : error ? (
            <ErrorMessage error={error} className="min-h-36" />
          ) : (
            <ToggleGroup
              type="single"
              value={transactionAccount}
              onValueChange={(val: string) => {
                if (val) setTransactionAccount(val);
              }}
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
          <Button type="button" variant="outline" onClick={smartRouter.back}>
            Cancel
          </Button>
          <Button type="submit">Add Transaction</Button>
        </div>
      </form>
    </>
  );
}
