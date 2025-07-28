import { z } from "zod";

export const TransactionSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    category: z.string().min(3).max(100),
    title: z.string().min(3).max(100).optional(),
    note: z.string().optional(),
    type: z.enum(["income", "expense"]),
    amount: z.number().positive(),
    transactionTime: z.coerce.date(),
  })
  .strict();
