import { z } from "zod";

export const GoalSchema = z
  .object({
    userId: z.string().min(1, "User ID is required."),
    name: z.string().min(1, "Name is required").max(100),
    amount: z.number().nonnegative(),
    saved: z.number().nonnegative().default(0),
    transactionCount: z.number().nonnegative().default(0),
  })
  .strict();

export type GoalInput = z.infer<typeof GoalSchema>;
