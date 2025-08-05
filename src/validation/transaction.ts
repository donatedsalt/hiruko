import { z } from "zod";

export const TransactionSchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    account: z.string().min(1, "Account is required."),
    category: z.string().min(3).max(100),
    title: z
      .string()
      .max(100, "Username must be less than 100 characters.")
      .default(""),
    note: z.string().default(""),
    type: z.enum(["income", "expense"], "Type must be income or expense."),
    amount: z.number().positive("Amount must be a positive number."),
    transactionTime: z.coerce
      .date("Time must be a valid date.")
      .default(() => new Date()),
  })
  .strict();

export type TransactionFormSchema = Omit<
  z.infer<typeof TransactionSchema>,
  "transactionTime"
> & {
  transactionTime: Date;
};
