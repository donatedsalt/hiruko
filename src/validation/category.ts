import { z } from "zod";

export const CategorySchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    name: z.string().min(1, "Name is required").max(100),
    icon: z.string().min(1, "Icon is required").max(100),
    transactionCount: z
      .number()
      .min(0, "Transactions Count cannot be negative.")
      .default(0),
    transactionAmount: z.number().optional().default(0),
    type: z.enum(["income", "expense"], "Type must be income or expense."),
  })
  .strict();

export type CategoryInput = z.infer<typeof CategorySchema>;
