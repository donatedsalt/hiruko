import { z } from "zod";

export const CategorySchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    name: z.string().min(1, "Name is required").max(100),
    icon: z.string().min(1, "Icon is required").max(100),
  })
  .strict();

export type CategoryInput = z.infer<typeof CategorySchema>;
