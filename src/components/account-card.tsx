"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Account } from "@/types/convex";

import { AccountSchema } from "@/validation/account";

import { useCountdown } from "@/hooks/use-countdown";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountCard({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { count, done } = useCountdown(3, showConfirmDelete);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateAccount = useMutation(api.accounts.mutations.update);
  const deleteAccount = useMutation(api.accounts.mutations.remove);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const balance = parseFloat(formData.get("balance") as string);

    const payload = { name, balance };

    const result = AccountSchema.omit({
      userId: true,
      transactionCount: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    try {
      await updateAccount({
        id: account._id,
        ...result.data,
      });
      toast.success("Account updated");
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
      await deleteAccount({ id: account._id });
      toast.success("Account deleted");
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
        <Card className="justify-center gap-3 p-6 shadow-xs cursor-pointer select-none min-h-36 shrink-0 from-primary/5 to-card dark:bg-card bg-gradient-to-t">
          <CardHeader className="@container-normal">
            <CardTitle className="text-xl font-semibold text-muted-foreground">
              {account.name}
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground tabular-nums">
              {account.balance.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </CardDescription>
          </CardHeader>
          <CardFooter className="text-sm">
            <p className="text-muted-foreground">
              {account.transactionCount} Transactions
            </p>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {showConfirmDelete ? "Delete Account" : "Edit Account"}
            </DialogTitle>
            <DialogDescription>
              {showConfirmDelete ? (
                <>
                  <span>
                    Are you sure? This will delete the account and its
                    transactions.
                  </span>
                  <br />
                  <span className="text-destructive">
                    {account.transactionCount} Transactions will be deleted
                  </span>
                </>
              ) : (
                "Update your account details below."
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
                  defaultValue={account.name}
                  placeholder="Bank"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="balance">Correct Balance</Label>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  defaultValue={account.balance}
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

export function AccountCardSkeleton() {
  return <Skeleton className="min-h-36 aspect-3/2" />;
}

export function AddAccountCard() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createAccount = useMutation(api.accounts.mutations.create);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const balance = parseFloat(formData.get("balance") as string);

    const payload = { name, balance };

    const result = AccountSchema.omit({
      userId: true,
      transactionCount: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    try {
      await createAccount(result.data);
      toast.success("Account added");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="flex flex-col items-center justify-center gap-0 p-0 bg-transparent border-dashed shadow-xs cursor-pointer select-none min-h-36 shrink-0">
          <CardHeader className="@container-normal">
            <CardTitle className="flex flex-col items-center gap-1 text-2xl font-semibold text-muted-foreground">
              <IconCirclePlusFilled />
              <span>Add Account</span>
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Click to add a new account
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
            <DialogDescription>
              Create a new account to manage your finances.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Bank"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="balance">Initial Balance</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                defaultValue={0}
                required
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
