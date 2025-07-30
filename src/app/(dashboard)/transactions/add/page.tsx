"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { ITransactionApiResponse } from "@/types/transaction";

import api from "@/lib/axios";

import { SiteHeader } from "@/components/site-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TransactionSchema } from "@/validation/transaction";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";

export default function Page() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const loadingToast = toast.loading("Processing request...");

    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as "income" | "expense";
    const title = formData.get("title") as string;
    const note = formData.get("note") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;

    const transactionTime = new Date(`${date}T${time}`);

    const payload = {
      category,
      amount,
      type,
      title: title || undefined,
      note: note || undefined,
      transactionTime,
    };

    const result = TransactionSchema.omit({ userId: true }).safeParse(payload);

    if (!result.success) {
      console.log(result.error);

      toast.dismiss(loadingToast);
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    try {
      const res = await api.post<ITransactionApiResponse>(
        "/transactions",
        result.data
      );
      const response = res.data;

      if (response.success && response.data && !Array.isArray(response.data)) {
        toast.dismiss(loadingToast);
        toast.success("Transaction added");
        router.back();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to create transaction.", {
          description: response.error,
        });
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error("Something went wrong!", {
        description: err.response?.data?.error || err.message,
      });
    }
  };

  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM

  return (
    <>
      <SiteHeader title="Add Transaction" />
      <form onSubmit={handleSubmit} className="grid gap-6 m-4 md:m-6">
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            type="text"
            placeholder="Shopping"
            required
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
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="amount">Amount</Label>
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
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue="expense" required>
            <SelectTrigger id="type">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="date">Date</Label>
          <DatePicker id="date" name="date" defaultValue={currentDate} />
        </div>
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue={currentTime}
            required
          />
        </div>
        <Button type="submit">Add Transaction</Button>
      </form>
    </>
  );
}
