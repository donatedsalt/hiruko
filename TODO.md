# TODOs

list of todos

## Todo

- [ ] fix invalid date error
- [ ] give the AI access to user data (e.g., income, expenses, balance) after asking permission to improve AI response
- [ ] market tracking (e.g., crypto, stocks, gold, currencies)
- [ ] settings page
- [ ] checkbox to disable or enable deletion conformation in settings
- [ ] premium features like family budgets and goals tracking
- [ ] take image of receipts to automatically add transactions
- [ ] decouple categories from `type`: treat income/expense as a UI suggestion, not a constraint
  - drop the `category.type === txn.type` check in `convex/transactions/mutations.ts`
  - split `categories.transactionAmount` into `incomeAmount` + `expenseAmount`; one-shot migration backfills from existing `type`
  - keep `category.type` as a default for the txn form's type toggle and for picker sort order
  - statistics / pie chart need to pick which bucket to show (income vs expense)

- [ ] consolidate to a single `src/app/layout.tsx` — `(auth)` and `(dashboard)` layouts each render `<html>`/`<body>` with duplicated Clerk/Convex/Theme/font providers; drift is inevitable
- [ ] remove unused `ai` SDK from `package.json` (or migrate `/api/chat` to it) — current route emits `{token}\n` lines while `ai` v5 is installed but unused
- [ ] aggregate `accounts`/`categories`/`budgets`/`goals` into one Convex query for `transactions/new` instead of 4 `useQuery` calls — `src/app/(dashboard)/transactions/new/page.tsx`
- [ ] use the Convex `statsByDay` / grouped query in `transaction-list.tsx` instead of recomputing `groupByDay` client-side
- [ ] add `error.tsx` at `(auth)` and `(dashboard)` route boundaries; wrap data-dependent sections in `<Suspense>` with skeletons
- [ ] lazy-load `chart-area-interactive.tsx` (Recharts) and other heavy chart components
- [ ] memoize `<ListItem>` and reduce re-renders in `transaction-list.tsx`; consider virtualization for paginated lists
- [ ] reduce pervasive `"use client"` (66 files) — keep providers/interactive shells client, push pages toward server-first
- [ ] tighten `tsconfig.json`: enable `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`
- [ ] tighten ESLint: promote `no-explicit-any` to `error`, add `eslint-plugin-jsx-a11y`, set `react-hooks/exhaustive-deps` to `error`
- [ ] add `package.json` scripts: `typecheck` (`tsc --noEmit`), `format`/`format:check` (Prettier), `lint:fix`
- [ ] add Prettier config (`.prettierrc.json`) for consistent formatting
- [ ] add Husky + lint-staged pre-commit hooks (lint + format on staged files)
- [ ] add GitHub Actions CI workflow running `bun install`, `typecheck`, `lint`, `build`
- [ ] add Vitest + @testing-library/react; first targets: `convex/transactions/mutations.ts` counter logic, `/api/chat` route, form validators
- [ ] expand `README.md` with architecture overview, env setup, and command reference
- [ ] settings: locale + currency selector — `formatCurrency` in `src/lib/utils.ts:13` is hardcoded to `USD`/`en-US`
- [ ] allow toggling `category.type` (income ↔ expense) instead of forcing delete + recreate — `src/components/category-dialog.tsx`
- [ ] extract a shared form hook (or adopt react-hook-form) for category/budget/goal/transaction dialogs — surface field-level errors instead of single-issue toasts
- [ ] separate the type toggle from the category select on `transactions/new` so manual type choices aren't silently overwritten when the category changes — `src/app/(dashboard)/transactions/new/page.tsx:186`
- [ ] reset dialog form state before closing (not after) to avoid stale fields when rapidly reopening — budget/goal/category dialogs

## Bugs

- [ ] edit form drops `goalId` (never read from FormData) and type-flip income↔expense can double-count budget — `convex/transactions/mutations.ts`, `src/app/(dashboard)/transactions/[id]/page.tsx`
- [ ] budget/goal `transactionCount` not adjusted on transaction `update`; budget/goal `remove` doesn't reverse counters — `convex/{transactions,budgets,goals}/mutations.ts`
- [ ] `accounts.remove` and `categories.remove` cascade-delete transactions without reversing budget/goal/category counters — `convex/{accounts,categories}/mutations.ts`
- [ ] `accounts.update` balance-correction bypasses `adjustAccount` and overwrites balance non-atomically — `convex/accounts/mutations.ts:107-160`
- [ ] typo: `goalLoading = budgets === undefined` (and `budLoading` swap) — `src/app/(dashboard)/transactions/[id]/page.tsx:69,376`
- [ ] `groupByDate` keys by UTC day → non-UTC users see transactions in wrong bucket — `convex/transactions/queries.ts:106`
- [ ] `validation/budget.ts` uses `.positive()` on `spent` — rejects legal value `0`
- [ ] `useSmartRouter` returns unbound `router.back/forward` — can throw — `src/hooks/use-smart-router.ts:23-31`
- [ ] `useSmartRouter` reads `localStorage.visitedPaths` that nothing writes — feature dead, `replaceWithBack` always falls back to `/` — `src/hooks/use-smart-router.ts`, `src/components/history-tracker.tsx`
- [ ] Convex `list` queries omit `args: {}` validators (violates Convex guidelines) — `convex/{accounts,budgets,categories,goals}/queries.ts`
- [ ] unbounded `.collect()` on list queries will collapse as data grows — switch to `.take()` or paginate — `convex/{accounts,budgets,categories,goals,transactions}/queries.ts`
- [ ] inconsistent error contract on delete: budgets/goals return `{ success: false }` on not-found/unauthorized while other mutations throw — `convex/{budgets,goals}/mutations.ts:59-65`
- [ ] Clerk webhook lacks idempotency/dedup — store Svix event IDs to defend against retries/replays — `convex/http.ts`
- [ ] `useCountdown` resets unexpectedly when `start` prop changes mid-countdown — `src/hooks/use-countdown.ts:25`, used by `src/components/category-dialog.tsx:51`
- [ ] `ConvexReactClient` instantiated at module scope can hold stale config across hot reloads — move inside the provider component — `src/components/convex-client-provider.tsx:12`
- [ ] no delete confirmation/countdown on transaction detail page (other entities use `useCountdown`) — `src/app/(dashboard)/transactions/[id]/page.tsx:475`

## Security

- [ ] `/api/chat` has no auth, rate limit, or input validation — anyone can drain Gemini key — `src/app/api/chat/route.ts`
- [ ] `/api/chat` has no body-size limit — `req.json()` can buffer arbitrary payloads (OOM risk) — `src/app/api/chat/route.ts`
- [ ] `/api/chat` has no CSRF / `origin` allowlist check — `src/app/api/chat/route.ts`
- [ ] `console.error` in `/api/chat` logs the full Gemini error object (may include request details / partial key fragments in stack traces) — sanitize before logging — `src/app/api/chat/route.ts:44`
- [ ] verify Svix `Webhook.verify()` enforces a timestamp tolerance window; if not, manually reject payloads older than ~5 min to block replay — `convex/http.ts:32-36`
- [ ] `next.config.ts` is empty — add CSP / security headers, `poweredByHeader: false`
- [ ] `HistoryTracker` localStorage key not namespaced per user — paths leak between accounts after sign-out — `src/components/history-tracker.tsx`

## UX

- [ ] AI consult page: surface API/network errors (currently silent when `res.body` is null or fetch fails) — `src/app/(dashboard)/consult/page.tsx`, `src/app/api/chat/route.ts`
- [ ] AI consult: add abort + retry for in-flight streams
- [ ] AI consult: persist message history (DB or localStorage) so refresh doesn't wipe the conversation
- [ ] first-run onboarding flow after Clerk webhook seeds Cash account + default categories — dashboard and `transactions/new` redirect path are confusing for empty state
- [ ] statistics page: add date-range controls (match the 7d/30d toggle from `chart-area-interactive`) and show historical trends — `src/app/(dashboard)/statistics/page.tsx`
- [ ] over-budget warnings: prominent visual state and (eventually) notifications when budgets/goals trip thresholds
- [ ] form validation: highlight invalid fields inline instead of toasting only the first issue — `src/app/(dashboard)/transactions/new/page.tsx:100-112` and other forms
- [ ] mobile: stack toggle groups and audit floating button overlap on small screens (budget/goal/account edit dialogs)
- [ ] PWA: add manifest screenshots, categories, larger icons (1024x1024), and an offline fallback / service worker — `src/app/manifest.ts`
- [ ] add breadcrumbs on nested routes (e.g. `/transactions/[id]`)
- [ ] combine separate date + time inputs into a single datetime picker on `transactions/new`
- [ ] dark-mode WCAG AA contrast audit (Lighthouse), especially pie-chart palette
- [ ] show impact preview on category delete (which budgets/goals lose associations) — `src/components/category-dialog.tsx:156-157`

## UI / Design

- [ ] wrap dashboard page content in a `<main>` landmark — `src/components/site-header.tsx`
- [ ] add `aria-describedby` to dialogs; use `alertdialog` role for destructive confirmations
- [ ] audit remaining icon-only buttons for `aria-label` coverage

---

Completed work lives in [`CHANGELOG.md`](./CHANGELOG.md).
