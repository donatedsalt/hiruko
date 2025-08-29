"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

import { AccountId, CategoryId, BudgetId, GoalId } from "@/types/convex";

import { TransactionSchema } from "@/validation/transaction";

import { useSmartRouter } from "@/hooks/use-smart-router";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorMessage } from "@/components/error-message";
import { CategoryDialog } from "@/components/category-dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Page() {
  const smartRouter = useSmartRouter();
  const accounts = useQuery(api.accounts.queries.list);
  const accLoading = accounts === undefined;
  const categories = useQuery(api.categories.queries.list);
  const catLoading = categories === undefined;
  const budgets = useQuery(api.budgets.queries.list);
  const budLoading = budgets === undefined;
  const goals = useQuery(api.goals.queries.list);
  const goalLoading = budgets === undefined;

  const createTransaction = useMutation(api.transactions.mutations.create);
  const createDefaults = useMutation(
    api.categories.mutations.createDefaultCategories
  );

  const [txnType, setTxnType] = useState<"income" | "expense">("expense");
  const [txnAccount, setTxnAccount] = useState<AccountId | "">("");
  const [txnCategory, setTxnCategory] = useState<CategoryId | "">("");
  const [txnBudget, setTxnBudget] = useState<BudgetId | "">("");
  const [txnGoal, setTxnGoal] = useState<GoalId | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;
    if (!accounts || !categories) return;

    let toastTriggered = false;

    if (accounts.length === 0) {
      toast.info("Please create an account to continue");
      smartRouter.push("/");
      toastTriggered = true;
    } else {
      if (txnAccount === "") {
        setTxnAccount(accounts[0]?._id);
      }

      const onlyBalanceCorrection =
        categories.length > 0 &&
        categories.length <= 2 &&
        categories.every((cat) =>
          cat.name.trim().toLowerCase().startsWith("balance correction")
        );

      if (categories.length === 0 || onlyBalanceCorrection) {
        toast.info("No categories found. Creating defaults...");
        createDefaults();
        toastTriggered = true;
      }

      if (categories.length > 0 && txnCategory === "") {
        setTxnCategory(categories[0]?._id);
        setTxnType(categories[0]?.type);
      }
    }

    if (toastTriggered) toastShown.current = true;
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
    const budgetId = formData.get("budgetId") as BudgetId;
    const goalId = formData.get("goalId") as GoalId;
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
      budgetId,
      goalId,
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
      <form
        onSubmit={handleSubmit}
        className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6"
      >
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
                onValueChange={(catId: CategoryId) => {
                  const cat = categories.find((cat) => cat._id === catId);
                  setTxnCategory(catId);
                  setTxnType(cat?.type || "expense");
                }}
                required
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
            <CategoryDialog />
          </div>
        </div>
        <div className="grid gap-3 *:w-full">
          <Label htmlFor="type">
            Type<span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="type" value={txnType} required />
          <ToggleGroup
            type="single"
            value={txnType}
            onValueChange={(type: "income" | "expense") => {
              const cat = categories?.find((cat) => cat.type === type);
              setTxnType(type);
              setTxnCategory(cat?._id || "");
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
          <input type="hidden" name="accountId" value={txnAccount} required />
          {accLoading ? (
            <Skeleton className="w-full h-9" />
          ) : accounts ? (
            <ToggleGroup
              type="single"
              value={txnAccount}
              onValueChange={(accId: AccountId) => setTxnAccount(accId)}
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
        {(budLoading || (budgets && budgets.length > 0)) && (
          <div className="grid gap-3 *:w-full">
            <Label htmlFor="budgetId">
              Budget<span className="text-destructive">*</span>
            </Label>
            <input type="hidden" name="budgetId" value={txnBudget} required />
            {budLoading ? (
              <Skeleton className="w-full h-9" />
            ) : budgets ? (
              <ToggleGroup
                type="single"
                value={txnBudget}
                onValueChange={(accId: BudgetId) => setTxnBudget(accId)}
              >
                {budgets.map((budget) => (
                  <ToggleGroupItem
                    key={budget._id}
                    value={budget._id}
                    className="border dark:bg-input/30 dark:data-[state=on]:bg-input"
                  >
                    {budget.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : (
              <ErrorMessage
                error={"Failed to load budgets"}
                className="min-h-9"
              />
            )}
          </div>
        )}
        {(goalLoading || (goals && goals.length > 0)) && (
          <div className="grid gap-3 *:w-full">
            <Label htmlFor="goalId">
              Goal<span className="text-destructive">*</span>
            </Label>
            <input type="hidden" name="goalId" value={txnGoal} required />
            {goalLoading ? (
              <Skeleton className="w-full h-9" />
            ) : goals ? (
              <ToggleGroup
                type="single"
                value={txnGoal}
                onValueChange={(accId: GoalId) => setTxnGoal(accId)}
              >
                {goals.map((goal) => (
                  <ToggleGroupItem
                    key={goal._id}
                    value={goal._id}
                    className="border dark:bg-input/30 dark:data-[state=on]:bg-input"
                  >
                    {goal.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : (
              <ErrorMessage
                error={"Failed to load goals"}
                className="min-h-9"
              />
            )}
          </div>
        )}
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
