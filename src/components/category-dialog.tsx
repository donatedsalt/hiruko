"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconPlus,
  IconEdit,
} from "@tabler/icons-react";

import { CategoryId } from "@/types/convex";

import { CategorySchema } from "@/validation/category";

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
import EmojiPickerButton from "@/components/emoji-picker-button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type CategoryFormValues = {
  name: string;
  icon: string;
  type: "income" | "expense";
};

interface CategoryDialogProps {
  mode?: "add" | "edit";
  initialValues?: Partial<CategoryFormValues> & { id?: CategoryId };
  trigger?: React.ReactNode;
}

export function CategoryDialog({
  mode = "add",
  initialValues = {},
  trigger,
}: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCategory = useMutation(api.categories.mutations.create);
  const updateCategory = useMutation(api.categories.mutations.update);

  const [name, setName] = useState(initialValues.name || "");
  const [icon, setIcon] = useState(initialValues.icon || "😀");
  const [type, setType] = useState<"income" | "expense">(
    initialValues.type || "expense"
  );

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
      if (mode === "edit" && initialValues.id) {
        await updateCategory({ id: initialValues.id, ...result.data });
        toast.success("Category updated");
      } else {
        await createCategory(result.data);
        toast.success("Category added");
      }
      setName(initialValues.name || "");
      setIcon(initialValues.icon || "😀");
      setType(initialValues.type || "expense");
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
        {trigger ? (
          trigger
        ) : mode === "add" ? (
          <Button size="icon" variant="outline">
            <IconPlus />
          </Button>
        ) : (
          <Button size="icon" variant="ghost">
            <IconEdit />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the selected transaction category."
              : "Create a new transaction category."}
          </DialogDescription>
        </DialogHeader>

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

          <div className="flex gap-4">
            <div className="grid gap-3">
              <Label htmlFor="icon">Icon</Label>
              <EmojiPickerButton
                value={icon}
                onChange={(val) => setIcon(val)}
              />
            </div>
            <div className="grid gap-3 grow">
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

        <DialogFooter className="mt-4">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
