"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import { IAccountApiResponse, IAccountDocument } from "@/types/account";

import api from "@/lib/axios";

import { useCountdown } from "@/hooks/use-countdown";

import { AccountSchema } from "@/validation/account";

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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AccountsCard({
  account,
  onUpdate,
  onRemove,
}: {
  account: IAccountDocument;
  onUpdate: (acc: IAccountDocument) => void;
  onRemove: (acc: IAccountDocument) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { count, done } = useCountdown(3, showConfirmDelete);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const loadingToast = toast.loading("Processing request...");

    const name = formData.get("name") as string;

    const payload = { name };

    const result = AccountSchema.omit({
      userId: true,
      balance: true,
      transactionsCount: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.dismiss(loadingToast);
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    try {
      const res = await api.put<IAccountApiResponse>(
        `/accounts/${account._id}`,
        result.data
      );
      const response = res.data;

      if (response.success && response.data && !Array.isArray(response.data)) {
        onUpdate(response.data);
        toast.dismiss(loadingToast);
        toast.success("Account updated");
        form.reset();
        setOpen(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to update account.", {
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

  const handleDelete = async () => {
    const loadingToast = toast.loading("Deleting account...");

    try {
      const res = await api.delete<IAccountApiResponse>(
        `/accounts/${account._id}`
      );
      const response = res.data;

      if (response.success && response.data && !Array.isArray(response.data)) {
        onRemove(response.data);
        toast.dismiss(loadingToast);
        toast.success("Account deleted");
        setOpen(false);
        window.location.reload();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to delete account.", {
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
            <CardTitle className="font-semibold text-1xl text-muted-foreground">
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
              {account.transactionsCount} Transactions
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
                    {account.transactionsCount} Transactions will be deleted
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
            </div>
          )}
          <DialogFooter className="justify-between!">
            {!showConfirmDelete ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Delete
                </Button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Save changes</Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!done}
                  onClick={handleDelete}
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

export function AccountsCardSkeleton() {
  return <Skeleton className="min-h-36 aspect-3/2" />;
}

export function AddAccountCard({
  onAdd,
}: {
  onAdd: (acc: IAccountDocument) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const loadingToast = toast.loading("Processing request...");

    const name = formData.get("name") as string;
    const balance = parseFloat(formData.get("balance") as string);

    const payload = { name, balance };

    const result = AccountSchema.omit({
      userId: true,
      transactionsCount: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.dismiss(loadingToast);
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    try {
      const res = await api.post<IAccountApiResponse>("/accounts", result.data);
      const response = res.data;

      if (response.success && response.data && !Array.isArray(response.data)) {
        onAdd(response.data);
        toast.dismiss(loadingToast);
        toast.success("Account added");
        form.reset();
        setOpen(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to create account.", {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="flex flex-col items-center justify-center gap-0 p-0 bg-transparent border-dashed shadow-xs cursor-pointer select-none min-h-36 shrink-0">
          <CardHeader className="@container-normal">
            <CardTitle className="flex flex-col items-center text-2xl font-semibold text-muted-foreground">
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
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
