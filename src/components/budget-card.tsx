"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import { Budget } from "@/types/convex";

import {
  Dialog,
  DialogContent,
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
  return (
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
