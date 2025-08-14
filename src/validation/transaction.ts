import { z } from "zod";

import { AccountId, CategoryId } from "@/types/convex";

export const TransactionSchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    accountId: z
      .string()
      .min(1, "Account is required.")
      .transform((val) => val as AccountId),
    categoryId: z
      .string()
      .min(1, "Category is required.")
      .transform((val) => val as CategoryId),
    title: z
      .string()
      .max(100, "Title must be less than 100 characters.")
      .optional()
      .default(""),
    note: z.string().optional().default(""),
    type: z.enum(["income", "expense"], "Type must be income or expense."),
    amount: z.number().positive("Amount must be a positive number."),
    transactionTime: z.number(),
    updatedAt: z.number().optional(),
  })
  .strict();

export type TransactionInput = z.infer<typeof TransactionSchema>;
