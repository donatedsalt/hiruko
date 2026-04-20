"use client";

import { toast } from "sonner";
import { memo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import { Goal } from "@/types/convex";
import { formatCurrency } from "@/lib/utils";

import { GoalSchema } from "@/validation/goal";

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

function GoalCardInner({ goal }: { goal: Goal }) {
  const [open, setOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { count, done } = useCountdown(3, showConfirmDelete);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const updateGoal = useMutation(api.goals.mutations.update);
  const deleteGoal = useMutation(api.goals.mutations.remove);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const amount = parseFloat(formData.get("amount") as string);

    const payload = { name, amount };

    const result = GoalSchema.omit({
      userId: true,
      saved: true,
      transactionCount: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    try {
      await updateGoal({
        id: goal._id,
        ...result.data,
      });
      toast.success("Goal updated");
      setOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error("Something went wrong!", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      await deleteGoal({ id: goal._id });
      toast.success("Goal deleted");
      setOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error("Something went wrong!", {
        description: message,
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
        if (!val) formRef.current?.reset();
        setOpen(val);
      }}
    >
      <DialogTrigger asChild>
        <Card
          key={goal._id}
          className="from-primary/5 to-card dark:bg-card min-h-36 shrink-0 cursor-pointer justify-center gap-3 bg-gradient-to-t p-6 shadow-xs select-none"
        >
          <CardHeader className="@container-normal">
            <CardTitle className="text-muted-foreground text-xl font-semibold">
              {goal.name}
            </CardTitle>
            <CardDescription className="text-foreground text-2xl font-semibold tabular-nums">
              <p>
                {formatCurrency(goal.saved)} / {formatCurrency(goal.amount)}{" "}
                used
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(100, (goal.saved / goal.amount) * 100)} />
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-base font-semibold tabular-nums">
              {goal.amount - goal.saved >= 0
                ? `${formatCurrency(goal.amount - goal.saved)} left`
                : `Over goal by ${formatCurrency(Math.abs(goal.amount - goal.saved))}`}
            </p>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {showConfirmDelete ? "Delete Goal" : "Edit Goal"}
            </DialogTitle>
            <DialogDescription>
              {showConfirmDelete ? (
                <>
                  <span>
                    Are you sure? This will delete the goal and remove goal from
                    associated transactions.
                  </span>
                  <br />
                  <span className="text-destructive">
                    {goal.transactionCount} Transactions will be updated
                  </span>
                </>
              ) : (
                "Update your goal details below."
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
                  defaultValue={goal.name}
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
                  defaultValue={goal.amount}
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
              <div className="flex grow flex-col-reverse justify-end gap-2 sm:flex-row">
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

export const GoalCard = memo(GoalCardInner);

export function GoalCardSkeleton() {
  return <Skeleton className="h-42" />;
}

export function AddGoalCard({
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
} = {}) {
  const createGoal = useMutation(api.goals.mutations.createGoal);
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChangeProp ?? setOpenState;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const amount = parseFloat(formData.get("amount") as string);

    const payload = { name, amount };

    const result = GoalSchema.omit({
      userId: true,
      saved: true,
      transactionCount: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createGoal(result.data);
      toast.success("Goal added");
      setOpen(false);
    } catch (err) {
      toast.error("Something went wrong!", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) formRef.current?.reset();
        setOpen(val);
      }}
    >
      <DialogTrigger asChild>
        <Card className="flex min-h-42 shrink-0 cursor-pointer flex-col items-center justify-center gap-0 border-dashed bg-transparent p-0 shadow-xs select-none">
          <CardHeader className="@container-normal">
            <CardTitle className="text-muted-foreground flex flex-col items-center gap-1 text-2xl font-semibold">
              <IconCirclePlusFilled />
              <span>Add Goal</span>
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Click to add a new Goal
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a target you can save toward over time.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">
                Name<span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. New Car"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="amount">
                Amount<span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="500"
                step="0.01"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
