# Agent Guide for Hiruko

Hiruko is a personal finance tracker built with **Next.js 15 (App Router, Turbopack)**, **React 19**, **Convex** (backend + realtime DB), **Clerk** (auth), **Tailwind v4**, and **shadcn/ui** (new-york style, neutral base, Tabler icons). An AI "consult" feature streams responses from Google Gemini via `@google/genai`.

## 1. Environment & Commands

- **Package manager**: `bun` (committed `bun.lock`). `package.json` is source of truth.
- **Scripts**:
  - `bun run dev` — runs Next (Turbopack) **and** `convex dev` together via `concurrently`.
  - `bun run dev:next` / `bun run dev:convex` — run them individually.
  - `bun run build` — production build (also type-checks).
  - `bun run start` — run production build.
  - `bun run lint` / `bun run lint:fix` — `next lint` (ESLint flat config), with or without autofix.
  - `bun run typecheck` — `tsc --noEmit` (types only, faster than `build`).
  - `bun run format` / `bun run format:check` — Prettier (`.prettierrc.json`; `prettier-plugin-tailwindcss` sorts tailwind classes; `cn`/`cva` are recognized tailwind-class functions).
- **Required env**: `CLERK_FRONTEND_API_URL` (used by `convex/auth.config.ts`), `CLERK_WEBHOOK_SECRET` (svix verification in `convex/http.ts`), the standard Clerk `NEXT_PUBLIC_CLERK_*` keys, `NEXT_PUBLIC_CONVEX_URL`, and `GEMINI_API_KEY` (used by `/api/chat`).

### Testing & Verification

- **No test framework** is configured (no Jest/Vitest/Playwright).
- Verification protocol: `bun run typecheck` for types, `bun run lint` for lint, `bun run format:check` for formatting, manual browser check for UI/flow. `bun run build` also type-checks but is slower.
- **Pre-commit hook** (Husky + lint-staged): runs `prettier --write` on staged Markdown/JSON/YAML/CSS and `prettier --write` + `eslint --fix` on staged TS/JS. Installed automatically after `bun install` via the `prepare` script.

## 2. Project Structure

### `src/app` (App Router)

Single root layout + two route groups for chrome:

- `layout.tsx` — the only `<html>`/`<body>`. Owns Geist + Geist_Mono fonts, `globals.css`, the provider stack (ClerkProvider → ConvexClientProvider → ThemeProvider), and the shared `metadata` (title template `"%s | Hiruko"`, default `"Hiruko"`, keywords/description/icons).
- `(auth)/layout.tsx` — slim group wrapper: `{children}` plus the fixed `<ThemeChangeButton>`. Sibling `error.tsx` renders a centered error boundary with "Try again" (calls the Next `reset()` callback).
  - `sign-in/[[...sign-in]]/page.tsx`
  - `sign-up/[[...sign-up]]/page.tsx`
- `(dashboard)/layout.tsx` — slim group wrapper: `CommandBarProvider` around the sidebar subtree (`SidebarProvider` + `AppSidebar` + `SidebarInset` — `<div>`, page wraps its own content in `<main>`), plus `CommandBar`, `Toaster`, `FloatingButtons`, `HistoryTracker`, `SpeedInsights`. Sibling `error.tsx` shares the sidebar chrome and renders `SiteHeader` + an `<ErrorMessage>` + reset button. Each segment (transactions, categories, budgets, goals, statistics, consult, plus `transactions/new` and `transactions/[id]`) has a tiny server `layout.tsx` exporting `{ title: "<Page>" }` so the browser tab reads e.g. `"Categories | Hiruko"`.
  - `page.tsx` (home / overview)
  - `transactions/page.tsx`, `transactions/new/page.tsx`, `transactions/[id]/page.tsx`
  - `categories/page.tsx`
  - `budgets/page.tsx`
  - `goals/page.tsx`
  - `statistics/page.tsx`
  - `consult/page.tsx` (AI chat)
- `api/chat/route.ts` — POST endpoint using the Vercel AI SDK (`streamText` + `@ai-sdk/google`) against `gemini-2.0-flash-001`; consumed on the client by `useChat` + `DefaultChatTransport`. Hardened with Clerk auth (401), same-origin check (403), 32 KB body cap, Zod message validation (400), per-user 20/min rate limit (429), sanitized logs, fail-fast on missing `GEMINI_API_KEY` (503).
- `manifest.ts` — PWA manifest.
- `globals.css` — Tailwind v4 + theme tokens.

### `src/components`

- `ui/` — shadcn/ui primitives (button, card, dialog, sidebar, calendar, chart, command, drawer, sonner, etc.) plus `ui/ai/` (AI chat-specific: `conversation.tsx`, `message.tsx`, `prompt-input.tsx`, `reasoning.tsx`, `response.tsx`, `code-block.tsx`, `tool.tsx`, etc.).
- `icons/hiruko-icon.tsx` — brand mark.
- Feature-level components live directly under `src/components/` (flat): `app-sidebar.tsx`, `nav-main.tsx`, `nav-businesses.tsx`, `nav-secondary.tsx`, `nav-user.tsx`, `site-header.tsx`, `transaction-list.tsx`, `account-card.tsx`, `accounts-cards.tsx`, `budget-card.tsx`, `goal-card.tsx`, `category-list.tsx`, `category-dialog.tsx`, `chart-area-interactive.tsx`, `pie-chart.tsx`, `list-item.tsx`, `emoji-picker-button.tsx`, `error-message.tsx`, `floating-buttons.tsx`, `history-tracker.tsx` (persists visited paths to localStorage under a Clerk-userId-scoped key for `useSmartRouter`), `theme-provider.tsx`, `theme-change-button.tsx`, `convex-client-provider.tsx`, `command-bar.tsx` + `command-bar-provider.tsx` (Cmd/Ctrl+K palette; provider exposes `useCommandBar().open()/close()` and owns the global keydown listener — accepts both modifiers on all platforms).

### `src/hooks`

- `use-mobile.ts` — media-query mobile detection.
- `use-countdown.ts` — generic countdown timer.
- `use-smart-router.ts` — wraps `next/navigation` router; methods are returned as arrow wrappers so they're safe to destructure. Adds `replaceWithBack(fallback)` that reads the user-scoped `visitedPaths:<userId>` key populated by `HistoryTracker`.

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

| Table          | Key fields                                                                                                             | Indexes                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accounts`     | `name`, `balance`, `transactionCount`, `updatedAt`                                                                     | `by_userId`                                                                                                                                                            |
| `categories`   | `name`, `icon`, `type: "income" \| "expense"`, `transactionCount`, `transactionAmount`                                 | `by_userId`, `by_userId_name`                                                                                                                                          |
| `transactions` | `categoryId`, `accountId`, `budgetId?`, `goalId?`, `amount`, `type`, `title?`, `note?`, `transactionTime`, `updatedAt` | `by_userId`, `by_account`, `by_category`, `by_budget`, `by_goal`, `by_userId_type` (userId+type+transactionTime), `by_userId_transactionTime` (userId+transactionTime) |
| `budgets`      | `name`, `amount`, `spent`, `transactionCount`                                                                          | `by_userId`                                                                                                                                                            |
| `goals`        | `name`, `amount`, `saved`, `transactionCount`                                                                          | `by_userId`                                                                                                                                                            |

Relationships: `transactions` references `accounts` + `categories` (required) and optionally `budgets` / `goals`. Parent aggregates (`balance`, `transactionCount`, `transactionAmount`, `spent`, `saved`) are **denormalized** and maintained inside transaction mutations — any code that mutates `transactions` must keep these counters in sync (see `convex/transactions/mutations.ts` and the `adjustAccount` helper in `convex/utils/db/accounts.ts`).

### Feature folder pattern

Each feature exposes `queries.ts` and `mutations.ts`. Current exports:

- `accounts`: `queries.list`, `queries.getById`; `mutations.create`, `mutations.update`, `mutations.remove`.
- `categories`: `queries.list`, `queries.getById`; `mutations.create`, `mutations.createDefaultCategories`, `mutations.update`, `mutations.remove`.
- `transactions`: `queries.list`, `queries.listRecent`, `queries.listPaginated`, `queries.statsByDay`, `queries.getById`; `mutations.create`, `mutations.update`, `mutations.remove`.
- `budgets`: `queries.list`; `mutations.createBudget`, `mutations.update`, `mutations.remove`. (Note: the create is named `createBudget`, not `create`.)
- `goals`: `queries.list`; `mutations.createGoal`, `mutations.update`, `mutations.remove`. (Same naming quirk.)
- `users`: `queries.homeDefaults` (bundles accounts + categories + recent transactions for the overview page), `queries.formDefaults` (bundles accounts + categories + budgets + goals for the transactions form); `mutations.initializeUser` (internal, invoked from the Clerk webhook on `user.created` to seed a Cash account and default categories).

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
- **Icons**: `@tabler/icons-react` only (shadcn `iconLibrary: "tabler"` in `components.json`). Tabler's `IconBrand*` set (e.g. `IconBrandGithub`, `IconBrandGoogle`) covers brand marks — no separate brand-icon library.
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

- `TODO.md` is the live backlog (Todo / Bugs / Security / UX / UI sections). Update it when discovering work.
- `CHANGELOG.md` holds completed work under an `Unreleased` heading. When a `TODO.md` item ships, move it to `CHANGELOG.md` (drop the `[ ]` checkbox) rather than leaving it in TODO. Git history is still the authoritative record.
- `README.md` is minimal; don't rely on it for architecture info.

## 6. Gotchas & Notes

- **Single root layout**: `src/app/layout.tsx` is the only `<html>`/`<body>` and owns the provider stack + fonts + `globals.css` + shared metadata. Both route groups render their group-specific chrome only — when adding a provider, add it once at the root and not in either group layout.
- **Denormalized counters**: mutating `transactions` without updating `accounts.balance`/`transactionCount`, `categories.transactionCount`/`transactionAmount`, `budgets.spent`, and `goals.saved` will desync the UI. Follow the patterns already in `convex/transactions/mutations.ts`.
- **Budget/goal creation naming**: `api.budgets.mutations.createBudget` and `api.goals.mutations.createGoal` (not `create`). Accounts/categories/transactions use plain `create`.
- **AI streaming format**: `/api/chat` uses the Vercel AI SDK (`streamText` + `@ai-sdk/google`) and the client consumes it via `useChat` + `DefaultChatTransport`. Wire format is the AI SDK's UI-message stream — not SSE and not a custom newline-delimited protocol.
- **No tests**. Do not claim coverage; rely on `typecheck` + `lint` + `format:check` + manual QA.
- **`next.config.ts`** carries security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`), `poweredByHeader: false`, and `images.remotePatterns` for `img.clerk.com` / `images.clerk.dev`. No CSP yet (tracked in TODO Security).
- **`?new=1` auto-open**: the command bar's "New budget / goal / category" items navigate to `/<entity>?new=1`. Each target page has a `useEffect` that reads the param, auto-opens its add dialog via controlled `open`/`onOpenChange` props on `AddBudgetCard` / `AddGoalCard` / `CategoryDialog`, and strips the param with `router.replace`. Hoisting these dialogs into a global provider (so the palette can open them without navigating) is on the TODO.
- **Dashboard landmarks**: `SidebarInset` renders `<div>` (not `<main>`) so `<SiteHeader>` sits as a banner and each page's content wrapper is the `<main>` landmark.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->
