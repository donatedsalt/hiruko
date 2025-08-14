import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  accounts: defineTable({
    userId: v.string(),
    name: v.string(),
    balance: v.number(),
    transactionsCount: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  categories: defineTable({
    userId: v.string(),
    name: v.string(),
    icon: v.string(),
    color: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_name", ["userId", "name"]),
  transactions: defineTable({
    userId: v.string(),
    categoryId: v.id("categories"),
    accountId: v.id("accounts"),
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
    .index("by_transactionTime", ["transactionTime"]),
});
