import { z } from "zod";

export const AccountSchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    name: z.string().min(1, "Name is required").max(100),
    balance: z.number().default(0),
    transactionCount: z.number().nonnegative().default(0),
    updatedAt: z.number().optional(),
  })
  .strict();

export type AccountInput = z.infer<typeof AccountSchema>;
