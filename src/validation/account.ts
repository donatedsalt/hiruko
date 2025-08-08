import { z } from "zod";

export const AccountSchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    name: z.string().min(1, "Name is required").max(100),
    balance: z.number().optional().default(0),
    transactionsCount: z
      .number()
      .min(0, "Transactions Count cannot be negative.")
      .default(0),
    updatedAt: z.number().optional(),
  })
  .strict();

export type AccountInput = z.infer<typeof AccountSchema>;
