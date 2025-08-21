import { z } from "zod";

export const BudgetSchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    name: z.string().min(1, "Name is required").max(100),
    amount: z.number().positive().default(0),
  })
  .strict();

export type BudgetInput = z.infer<typeof BudgetSchema>;
