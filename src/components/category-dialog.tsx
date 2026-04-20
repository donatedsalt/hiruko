"use client";

import { toast } from "sonner";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconPlus,
  IconEdit,
} from "@tabler/icons-react";

import { Category } from "@/types/convex";

import { CategorySchema } from "@/validation/category";

import { useCountdown } from "@/hooks/use-countdown";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const EmojiPickerButton = dynamic(
  () => import("@/components/emoji-picker-button"),
  {
    ssr: false,
    loading: () => (
      <Button
        aria-label="Loading icon picker"
        variant="outline"
        size="icon"
        type="button"
        disabled
      >
        {"🙂"}
      </Button>
    ),
  },
);

interface CategoryDialogProps {
  mode?: "add" | "edit";
  category?: Category;
  trigger?: React.ReactNode;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export function CategoryDialog({
  mode = "add",
  category,
  trigger,
  disabled = false,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: CategoryDialogProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChangeProp ?? setOpenState;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { count, done } = useCountdown(3, showConfirmDelete);

  const createCategory = useMutation(api.categories.mutations.create);
  const updateCategory = useMutation(api.categories.mutations.update);
  const deleteCategory = useMutation(api.categories.mutations.remove);

  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || "😀");
  const [type, setType] = useState<"income" | "expense">(
    category?.type || "expense",
  );

  const resetForm = useCallback(() => {
    setName(category?.name || "");
    setIcon(category?.icon || "😀");
    setType(category?.type || "expense");
    setShowConfirmDelete(false);
  }, [category]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const result = CategorySchema.omit({
      userId: true,
      transactionCount: true,
      transactionAmount: true,
    }).safeParse({ name, icon, type });

    if (!result.success) {
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "edit" && category) {
        await updateCategory({ id: category._id, ...result.data });
        toast.success("Category updated");
      } else {
        await createCategory(result.data);
        toast.success("Category added");
      }
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
      await deleteCategory({ id: category!._id });
      toast.success("Category deleted");
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
        if (!val) resetForm();
        setOpen(val);
      }}
    >
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : mode === "add" ? (
          <Button
            aria-label="Add category"
            size="icon"
            variant="outline"
            disabled={disabled}
          >
            <IconPlus />
          </Button>
        ) : (
          <Button
            aria-label={`Edit ${category?.name ?? "category"}`}
            size="icon"
            variant="ghost"
            disabled={disabled}
          >
            <IconEdit />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? showConfirmDelete
                ? "Delete Category"
                : "Edit Category"
              : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? (
              showConfirmDelete ? (
                <>
                  <span>
                    Are you sure? This will delete the category and its
                    transactions.
                  </span>
                  <br />
                  <span className="text-destructive">
                    {category?.transactionCount} Transactions will be deleted
                  </span>
                </>
              ) : (
                "Update the selected transaction category."
              )
            ) : (
              "Create a new transaction category."
            )}
          </DialogDescription>
        </DialogHeader>

        {!showConfirmDelete && (
          <div className="grid gap-4">
            <div className="grid gap-3 *:w-full">
              <Label htmlFor="type">
                Type<span className="text-destructive">*</span>
              </Label>
              <ToggleGroup
                type="single"
                value={type}
                onValueChange={(val: "income" | "expense") => {
                  if (val) setType(val);
                }}
              >
                <ToggleGroupItem
                  value="expense"
                  aria-label="Toggle expense"
                  className="dark:bg-input/30 data-[state=on]:bg-destructive! text-destructive-foreground border"
                >
                  <IconCaretDownFilled />
                  <span>Expense</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="income"
                  aria-label="Toggle income"
                  className="dark:bg-input/30 data-[state=on]:bg-success! text-foreground border"
                >
                  <IconCaretUpFilled />
                  <span>Income</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex gap-4">
              <div className="grid gap-3">
                <Label htmlFor="icon">Icon</Label>
                <EmojiPickerButton
                  value={icon}
                  onChange={(val) => setIcon(val)}
                />
              </div>
              <div className="grid grow gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Shopping"
                  value={name}
                  onChange={(val) => setName(val.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 justify-between!">
          {!showConfirmDelete ? (
            <>
              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
              ) : (
                <div></div>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !name.trim()}
                >
                  {mode === "edit" ? "Save Changes" : "Confirm"}
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
      </DialogContent>
    </Dialog>
  );
}
