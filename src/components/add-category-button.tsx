"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconPlus } from "@tabler/icons-react";

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

export function AddCategoryButton() {
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
