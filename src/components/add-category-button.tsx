"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconPlus,
} from "@tabler/icons-react";

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
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCategory = useMutation(api.categories.mutations.create);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("😀");
  const [type, setType] = useState<"income" | "expense">("expense");

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const payload = { name, icon, type };

    const result = CategorySchema.omit({
      userId: true,
      transactionCount: true,
      transactionAmount: true,
    }).safeParse(payload);

    if (!result.success) {
      toast.warning("Validation error", {
        description: result.error.issues[0].message,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createCategory(result.data);
      toast.success("Category added");
      setName("");
      setIcon("😀");
      setType("expense");
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
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Create a new transaction category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 *:w-full">
            <Label htmlFor="type">
              Type<span className="text-destructive">*</span>
            </Label>
            <input type="hidden" name="type" value={type} />
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
              <input
                id="icon"
                name="icon"
                type="hidden"
                value={icon}
                required
              />
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
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
