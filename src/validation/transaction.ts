import { z } from "zod";

export const TransactionSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    category: z.string().min(3).max(100),
    title: z
      .string()
      .min(3, "Username must be at least 2 characters.")
      .max(100, "Username must be less than 100 characters.")
      .optional(),
    note: z.string().optional(),
    type: z.enum(["income", "expense"], "Type must be income or expense."),
    amount: z.number().positive("Amount must de a positive number."),
    transactionTime: z.coerce.date("Time must be a valid date."),
  })
  .strict();

export type TransactionFormSchema = Omit<
  z.infer<typeof TransactionSchema>,
  "transactionTime"
> & {
  transactionTime: Date;
};
