"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import { Budget } from "@/types/convex";

import { BudgetSchema } from "@/validation/budget";

import { useCountdown } from "@/hooks/use-countdown";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function BudgetCard({ budget }: { budget: Budget }) {
  const [open, setOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { count, done } = useCountdown(3, showConfirmDelete);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateBudget = useMutation(api.budgets.mutations.update);
  const deleteBudget = useMutation(api.budgets.mutations.remove);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const amount = parseFloat(formData.get("amount") as string);

    const payload = { name, amount };

    const result = BudgetSchema.omit({
      userId: true,
      spent: true,
      transactionCount: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    try {
      await updateBudget({
        id: budget._id,
        ...result.data,
      });
      toast.success("Budget updated");
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

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      await deleteBudget({ id: budget._id });
      toast.success("Budget deleted");
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
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (showConfirmDelete && val === false) {
          setShowConfirmDelete(false);
          return;
        }
        setOpen(val);
      }}
    >
      <DialogTrigger asChild>
        <Card
          key={budget._id}
          className="justify-center gap-3 p-6 shadow-xs cursor-pointer select-none min-h-36 shrink-0 from-primary/5 to-card dark:bg-card bg-gradient-to-t"
        >
          <CardHeader className="@container-normal">
            <CardTitle className="text-xl font-semibold text-muted-foreground">
              {budget.name}
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground tabular-nums">
              <p>
                ${budget.spent} / ${budget.amount} used
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min((budget.spent / budget.amount) * 100)} />
          </CardContent>
          <CardFooter>
            <p className="text-base font-semibold text-muted-foreground tabular-nums">
              {budget.amount - budget.spent >= 0
                ? `$${budget.amount - budget.spent} left`
                : `Over budget by $${Math.abs(budget.amount - budget.spent)}`}
            </p>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {showConfirmDelete ? "Delete Budget" : "Edit Budget"}
            </DialogTitle>
            <DialogDescription>
              {showConfirmDelete ? (
                <>
                  <span>
                    Are you sure? This will delete the budget and remove budget
                    from associated transactions.
                  </span>
                  <br />
                  <span className="text-destructive">
                    {budget.transactionCount} Transactions will be updated
                  </span>
                </>
              ) : (
                "Update your budget details below."
              )}
            </DialogDescription>
          </DialogHeader>

          {!showConfirmDelete && (
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={budget.name}
                  placeholder="Bank"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  defaultValue={budget.amount}
                  required
                  step="0.01"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 justify-between!">
            {!showConfirmDelete ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    Save changes
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col-reverse justify-end gap-2 grow sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting || !done}
                >
                  {done ? "Confirm Delete" : `Confirm in ${count}s`}
                </Button>
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BudgetCardSkeleton() {
  return <Skeleton className="h-42" />;
}

export function AddBudgetCard() {
  const createBudget = useMutation(api.budgets.mutations.createBudget);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    await createBudget({ name, amount: Number(amount) });
    setName("");
    setAmount("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="flex flex-col items-center justify-center gap-0 p-0 bg-transparent border-dashed shadow-xs cursor-pointer select-none min-h-42 shrink-0">
          <CardHeader className="@container-normal">
            <CardTitle className="flex flex-col items-center gap-1 text-2xl font-semibold text-muted-foreground">
              <IconCirclePlusFilled />
              <span>Add Budget</span>
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Click to add a new Budget
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
            />
          </div>
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
