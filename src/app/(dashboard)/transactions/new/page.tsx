"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconPlus,
} from "@tabler/icons-react";

import { AccountId, CategoryId } from "@/types/convex";

import { TransactionSchema } from "@/validation/transaction";

import { useSmartRouter } from "@/hooks/use-smart-router";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { CategorySchema } from "@/validation/category";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorMessage } from "@/components/error-message";
import EmojiPickerButton from "@/components/emoji-picker-button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Page() {
  const smartRouter = useSmartRouter();
  const accounts = useQuery(api.accounts.queries.list);
  const accLoading = accounts === undefined;
  const categories = useQuery(api.categories.queries.list);
  const catLoading = categories === undefined;

  const [txnType, setTxnType] = useState<"income" | "expense">("expense");
  const [txnAccount, setTxnAccount] = useState<AccountId | "">("");
  const [txnCategory, setTxnCategory] = useState<CategoryId | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTransaction = useMutation(api.transactions.mutations.create);
  const createDefaults = useMutation(
    api.categories.mutations.createDefaultCategories
  );

  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;

    if (accounts && accounts.length === 0) {
      toast.info("Please create an account to continue");
      smartRouter.push("/");
      toastShown.current = true;
      return;
    }

    if (accounts && accounts.length > 0 && txnAccount === "") {
      setTxnAccount(accounts[0]?._id);
    }

    if (categories && categories.length === 0) {
      toast.info("No categories found. Creating defaults...");
      createDefaults();
      toastShown.current = true;
    }

    if (categories && categories.length > 0 && txnCategory === "") {
      setTxnCategory(categories[0]?._id);
    }
  }, [
    accounts,
    categories,
    createDefaults,
    smartRouter,
    txnAccount,
    txnCategory,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const accountId = formData.get("accountId") as AccountId;
    const categoryId = formData.get("categoryId") as CategoryId;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as "income" | "expense";
    const title = formData.get("title") as string;
    const note = formData.get("note") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;

    const transactionTime = new Date(`${date}T${time}`).getTime();

    const payload = {
      accountId,
      categoryId,
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
          <Label htmlFor="categoryId">
            Category<span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-3">
            {catLoading ? (
              <Skeleton className="w-full h-9" />
            ) : categories ? (
              <Select
                name="categoryId"
                value={txnCategory}
                onValueChange={(value: CategoryId) => {
                  setTxnCategory(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <ErrorMessage
                error={"Failed to load categories"}
                className="min-h-9"
              />
            )}
            <AddCategory />
          </div>
        </div>
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="type">
            Type<span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="type" value={txnType} />
          <ToggleGroup
            type="single"
            value={txnType}
            onValueChange={(val: "income" | "expense") => {
              if (val) setTxnType(val);
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
          <Label htmlFor="accountId">
            Account<span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="accountId" value={txnAccount} />
          {accLoading ? (
            <Skeleton className="w-full h-9" />
          ) : accounts ? (
            <ToggleGroup
              type="single"
              value={txnAccount}
              onValueChange={(val: AccountId) => {
                if (val) setTxnAccount(val);
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
              className="min-h-9"
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

function AddCategory() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCategory = useMutation(api.categories.mutations.create);
  const [icon, setIcon] = useState("😀");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const icon = formData.get("icon") as string;
    // const color = formData.get("color") as string;

    const payload = { name, icon /* color */ };

    const result = CategorySchema.omit({
      userId: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    try {
      await createCategory(result.data);
      toast.success("Category added");
      form.reset();
      setOpen(false);
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size={"icon"}
            variant={"outline"}
            type="button"
            disabled={isSubmitting}
          >
            <IconPlus />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>
                Create a new transaction category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="icon">Icon</Label>
                  <input
                    id="icon"
                    name="icon"
                    type="hidden"
                    value={icon}
                    required
                  />
                  <EmojiPickerButton
                    value={icon}
                    onChange={(val) => {
                      console.log(val);
                      setIcon(val);
                    }}
                  />
                </div>
                <div className="grid gap-3 grow">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Shopping"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting}>Confirm</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
