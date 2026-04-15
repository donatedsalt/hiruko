# Agent Guide for Hiruko

Hiruko is a personal finance tracker built with **Next.js 15 (App Router, Turbopack)**, **React 19**, **Convex** (backend + realtime DB), **Clerk** (auth), **Tailwind v4**, and **shadcn/ui** (new-york style, neutral base, Tabler icons). An AI "consult" feature streams responses from Google Gemini via `@google/genai`.

## 1. Environment & Commands

- **Package manager**: `bun` (committed `bun.lock`). `package.json` is source of truth.
- **Scripts**:
  - `bun run dev` — runs Next (Turbopack) **and** `convex dev` together via `concurrently`.
  - `bun run dev:next` / `bun run dev:convex` — run them individually.
  - `bun run build` — production build (also type-checks).
  - `bun run start` — run production build.
  - `bun run lint` — `next lint` (ESLint flat config).
- **Required env**: `CLERK_FRONTEND_API_URL` (used by `convex/auth.config.ts`), `CLERK_WEBHOOK_SECRET` (svix verification in `convex/http.ts`), the standard Clerk `NEXT_PUBLIC_CLERK_*` keys, `NEXT_PUBLIC_CONVEX_URL`, and `GEMINI_API_KEY` (used by `/api/chat`).

### Testing & Verification

- **No test framework** is configured (no Jest/Vitest/Playwright).
- Verification protocol: `bun run build` for types, `bun run lint` for lint, manual browser check for UI/flow.

## 2. Project Structure

### `src/app` (App Router)

Uses two route groups, each with its **own `<html>`/`<body>` root layout** (there is no top-level `src/app/layout.tsx`):

- `(auth)/layout.tsx` — Clerk + Convex + Theme providers, fixed theme-toggle button.
  - `sign-in/[[...sign-in]]/page.tsx`
  - `sign-up/[[...sign-up]]/page.tsx`
- `(dashboard)/layout.tsx` — same providers plus `AppSidebar`, `Toaster`, `FloatingButtons`, `HistoryTracker`, `SpeedInsights`.
  - `page.tsx` (home / overview)
  - `transactions/page.tsx`, `transactions/new/page.tsx`, `transactions/[id]/page.tsx`
  - `categories/page.tsx`
  - `budgets/page.tsx`
  - `goals/page.tsx`
  - `statistics/page.tsx`
  - `consult/page.tsx` (AI chat)
- `api/chat/route.ts` — POST endpoint that streams Gemini (`gemini-2.0-flash-001`) responses as newline-delimited JSON.
- `manifest.ts` — PWA manifest.
- `globals.css` — Tailwind v4 + theme tokens.

### `src/components`

- `ui/` — shadcn/ui primitives (button, card, dialog, sidebar, calendar, chart, drawer, sonner, etc.) plus `ui/ai/` (AI chat-specific: `conversation.tsx`, `message.tsx`, `prompt-input.tsx`, `reasoning.tsx`, `response.tsx`, `code-block.tsx`, `tool.tsx`, etc.).
- `icons/hiruko-icon.tsx` — brand mark.
- Feature-level components live directly under `src/components/` (flat): `app-sidebar.tsx`, `nav-main.tsx`, `nav-businesses.tsx`, `nav-secondary.tsx`, `nav-user.tsx`, `site-header.tsx`, `transaction-list.tsx`, `account-card.tsx`, `accounts-cards.tsx`, `budget-card.tsx`, `goal-card.tsx`, `category-list.tsx`, `category-dialog.tsx`, `chart-area-interactive.tsx`, `pie-chart.tsx`, `list-item.tsx`, `emoji-picker-button.tsx`, `error-message.tsx`, `floating-buttons.tsx`, `history-tracker.tsx` (persists visited paths to localStorage for `useSmartRouter`), `theme-provider.tsx`, `theme-change-button.tsx`, `convex-client-provider.tsx`.

### `src/hooks`

- `use-mobile.ts` — media-query mobile detection.
- `use-countdown.ts` — generic countdown timer.
- `use-smart-router.ts` — wraps `next/navigation` router; adds `replaceWithBack(fallback)` using `localStorage.visitedPaths` populated by `HistoryTracker`.

### `src/lib`

- `utils.ts` — exports `cn` (clsx + tailwind-merge). **The only util module.**

### `src/types`

- `convex.ts` — re-exports `Doc<T>` / `Id<T>` as `Transaction`, `TransactionId`, `Category`, `CategoryId`, `Account`, `AccountId`, `Budget`, `BudgetId`, `Goal`, `GoalId`, plus `TransactionGroups = Record<string, Transaction[]>`. Use these instead of re-deriving types at call sites.

### `src/validation` (Zod v4)

- `account.ts`, `budget.ts`, `category.ts`, `goal.ts`, `transaction.ts` — strict Zod schemas for form input. `TransactionSchema` narrows id strings to the correct branded `Id<"...">` types via `.transform(...)`.

### `src/middleware.ts`

Clerk `clerkMiddleware`. **Public routes**: `/sign-in(.*)`, `/sign-up(.*)`. **Everything else** calls `auth.protect()` and redirects unauthenticated users to sign-in. Matcher skips Next internals and common static assets; always runs for `/api` and `/trpc`.

## 3. Backend (Convex)

### Schema (`convex/schema.ts`)

All tables carry `userId: string` (Clerk subject) and are indexed by it.

| Table          | Key fields                                                                                                             | Indexes                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `accounts`     | `name`, `balance`, `transactionCount`, `updatedAt`                                                                     | `by_userId`                                                                                                                            |
| `categories`   | `name`, `icon`, `type: "income" \| "expense"`, `transactionCount`, `transactionAmount`                                 | `by_userId`, `by_userId_name`                                                                                                          |
| `transactions` | `categoryId`, `accountId`, `budgetId?`, `goalId?`, `amount`, `type`, `title?`, `note?`, `transactionTime`, `updatedAt` | `by_userId`, `by_account`, `by_category`, `by_budget`, `by_goal`, `by_userId_type` (userId+type+transactionTime), `by_userId_transactionTime` (userId+transactionTime) |
| `budgets`      | `name`, `amount`, `spent`, `transactionCount`                                                                          | `by_userId`                                                                                                                            |
| `goals`        | `name`, `amount`, `saved`, `transactionCount`                                                                          | `by_userId`                                                                                                                            |

Relationships: `transactions` references `accounts` + `categories` (required) and optionally `budgets` / `goals`. Parent aggregates (`balance`, `transactionCount`, `transactionAmount`, `spent`, `saved`) are **denormalized** and maintained inside transaction mutations — any code that mutates `transactions` must keep these counters in sync (see `convex/transactions/mutations.ts` and the `adjustAccount` helper in `convex/utils/db/accounts.ts`).

### Feature folder pattern

Each feature exposes `queries.ts` and `mutations.ts`. Current exports:

- `accounts`: `queries.list`, `queries.getById`; `mutations.create`, `mutations.update`, `mutations.remove`.
- `categories`: `queries.list`, `queries.getById`; `mutations.create`, `mutations.createDefaultCategories`, `mutations.update`, `mutations.remove`.
- `transactions`: `queries.list`, `queries.listRecent`, `queries.listPaginated`, `queries.statsByDay`, `queries.getById`; `mutations.create`, `mutations.update`, `mutations.remove`.
- `budgets`: `queries.list`; `mutations.createBudget`, `mutations.update`, `mutations.remove`. (Note: the create is named `createBudget`, not `create`.)
- `goals`: `queries.list`; `mutations.createGoal`, `mutations.update`, `mutations.remove`. (Same naming quirk.)
- `users`: `mutations.initializeUser` (internal). Invoked from the Clerk webhook on `user.created` to seed a Cash account and default categories.

`convex/http.ts` exposes `/clerk-webhook` (svix-verified) which dispatches to `users.mutations.initializeUser` on `user.created`.

Call from React:

```ts
const accounts = useQuery(api.accounts.queries.list);
const create = useMutation(api.transactions.mutations.create);
```

### Auth helper (`convex/utils/auth.ts`)

```ts
getUserId(ctx): Promise<string | null>          // Clerk subject or null
requireUserId(ctx): Promise<string>              // throws "Unauthorized: User not logged in." if missing
```

Call `requireUserId(ctx)` at the top of every query/mutation handler that touches user data, and always check `doc.userId === userId` before reading/writing another document. Auth is wired via `convex/auth.config.ts` pointing at `process.env.CLERK_FRONTEND_API_URL` with `applicationID: "convex"`.

### Shared DB helpers

- `convex/utils/db/accounts.ts` → `adjustAccount(ctx, account, amount, type, sign)` applies a signed balance/count delta. Use this when editing/deleting transactions so balances stay correct.

## 4. Code Style & Conventions

- **TypeScript strict** is on (`tsconfig.json`). Target ES2017, `moduleResolution: bundler`, `jsx: preserve`.
- **Path aliases** (tsconfig):
  - `@/*` → `./src/*`
  - `@/convex/*` → `./convex/*`
- **ESLint** extends `next/core-web-vitals` + `next/typescript`. Unused vars are warnings (underscore-prefix ignored). `@typescript-eslint/no-explicit-any` is a **warning** — avoid `any` but it won't fail lint.
- **Naming**: files `kebab-case`; React components `PascalCase`; functions/variables `camelCase`; Convex functions `camelCase`.
- **Class merging**: always use `cn` from `@/lib/utils` when composing `className`.
- **Icons**: `@tabler/icons-react` (shadcn `iconLibrary: "tabler"` in `components.json`). Brand icons via `@icons-pack/react-simple-icons` when needed.
- **Client components**: add `"use client"` when using hooks, browser APIs, or events.
- **Toasts / feedback**: `sonner` (`toast.success(...)`). `<Toaster />` is mounted in the dashboard layout.
- **Forms & validation**: Zod schemas in `src/validation`. Reuse the branded id types from `src/types/convex.ts`.
- **shadcn/ui**: style = `new-york`, base = `neutral`, CSS vars on. Check `src/components/ui` before adding a primitive; run `bunx shadcn@latest add <name>` to scaffold new ones.

## 5. Workflow

### Branching & Commits

- Never commit to `main` directly. New branch per task.
- Branch naming: `feature/<name>`, `fix/<issue>`, `refactor/<scope>`.
- Conventional Commits: `feat(ui): ...`, `fix(convex): ...`, `refactor(transactions): ...`.
- Do not commit unless the user explicitly asks.

### Planning

- `TODO.md` is the live backlog/progress file (there is no `PLAN.md`). Update it when completing or discovering work.
- `README.md` is minimal; don't rely on it for architecture info.

## 6. Gotchas & Notes

- **Two root layouts**: `(auth)/layout.tsx` and `(dashboard)/layout.tsx` each render `<html>` because there is no shared `src/app/layout.tsx`. Keep providers (ClerkProvider, ConvexClientProvider, ThemeProvider, fonts, `globals.css`) in sync between the two when editing one.
- **Denormalized counters**: mutating `transactions` without updating `accounts.balance`/`transactionCount`, `categories.transactionCount`/`transactionAmount`, `budgets.spent`, and `goals.saved` will desync the UI. Follow the patterns already in `convex/transactions/mutations.ts`.
- **Budget/goal creation naming**: `api.budgets.mutations.createBudget` and `api.goals.mutations.createGoal` (not `create`). Accounts/categories/transactions use plain `create`.
- **AI streaming format**: `/api/chat` emits newline-delimited `{"token": "..."}` JSON chunks, not SSE and not the Vercel AI SDK protocol — despite `ai` being a dependency, the current route is a custom stream. The `src/components/ui/ai/*` primitives are generic and don't assume a specific wire format.
- **No tests**. Do not claim coverage; rely on `build` + `lint` + manual QA.
- **`next.config.ts`** is empty — no custom redirects, images, or headers configured.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->
