import { z } from "zod";

export const AccountSchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    name: z.string().min(3).max(100),
    balance: z.number().default(0),
    transactionsCount: z
      .number()
      .min(0, "Transactions Count cannot be negative.")
      .default(0),
  })
  .strict();
