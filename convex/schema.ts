import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  accounts: defineTable({
    userId: v.string(),
    name: v.string(),
    balance: v.number(),
    transactionCount: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  categories: defineTable({
    userId: v.string(),
    name: v.string(),
    icon: v.string(),
    transactionCount: v.number(),
    transactionAmount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_name", ["userId", "name"]),
  transactions: defineTable({
    userId: v.string(),
    categoryId: v.id("categories"),
    accountId: v.id("accounts"),
    budgetId: v.optional(v.id("budgets")),
    goalId: v.optional(v.id("goals")),
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
    transactionTime: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_account", ["accountId"])
    .index("by_category", ["categoryId"])
    .index("by_budget", ["budgetId"])
    .index("by_goal", ["goalId"])
    .index("by_transactionTime", ["transactionTime"]),
  budgets: defineTable({
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    spent: v.number(),
    transactionCount: v.number(),
  }).index("by_userId", ["userId"]),
  goals: defineTable({
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    saved: v.number(),
    transactionCount: v.number(),
  }).index("by_userId", ["userId"]),
});
