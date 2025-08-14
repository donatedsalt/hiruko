/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts_mutations from "../accounts/mutations.js";
import type * as accounts_queries from "../accounts/queries.js";
import type * as categories_mutations from "../categories/mutations.js";
import type * as categories_queries from "../categories/queries.js";
import type * as transactions_mutations from "../transactions/mutations.js";
import type * as transactions_queries from "../transactions/queries.js";
import type * as utils_auth from "../utils/auth.js";
import type * as utils_db_accounts from "../utils/db/accounts.js";
import type * as utils_db_transactions from "../utils/db/transactions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "accounts/mutations": typeof accounts_mutations;
  "accounts/queries": typeof accounts_queries;
  "categories/mutations": typeof categories_mutations;
  "categories/queries": typeof categories_queries;
  "transactions/mutations": typeof transactions_mutations;
  "transactions/queries": typeof transactions_queries;
  "utils/auth": typeof utils_auth;
  "utils/db/accounts": typeof utils_db_accounts;
  "utils/db/transactions": typeof utils_db_transactions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
