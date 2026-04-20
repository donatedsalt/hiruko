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
- [ ] wrap data-dependent sections in `<Suspense>` with skeletons (route-level `error.tsx` already in place for `(auth)` and `(dashboard)`)
- [ ] consider virtualization (`react-window` / `@tanstack/react-virtual`) for paginated transaction lists once data volume warrants it
- [ ] reduce pervasive `"use client"` (66 files) — keep providers/interactive shells client, push pages toward server-first
- [ ] tighten `tsconfig.json`: enable `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`
- [ ] tighten ESLint: promote `no-explicit-any` to `error`, add `eslint-plugin-jsx-a11y`, set `react-hooks/exhaustive-deps` to `error`
- [ ] add Husky + lint-staged pre-commit hooks (lint + format on staged files)
- [ ] add GitHub Actions CI workflow running `bun install`, `typecheck`, `lint`, `build`
- [ ] add Vitest + @testing-library/react; first targets: `convex/transactions/mutations.ts` counter logic, `/api/chat` route, form validators
- [ ] expand `README.md` with architecture overview, env setup, and command reference
- [ ] settings: locale + currency selector — `formatCurrency` in `src/lib/utils.ts:13` is hardcoded to `USD`/`en-US`
- [ ] allow toggling `category.type` (income ↔ expense) instead of forcing delete + recreate — `src/components/category-dialog.tsx`
- [ ] extract a shared form hook (or adopt react-hook-form) for category/budget/goal/transaction dialogs — surface field-level errors instead of single-issue toasts
- [ ] hoist `AddBudgetCard` / `AddGoalCard` / add-mode `CategoryDialog` bodies into a global provider so the command bar can open them without route navigation — replaces the `?new=1` query-param auto-open pattern used in v1
- [ ] separate the type toggle from the category select on `transactions/new` so manual type choices aren't silently overwritten when the category changes — `src/app/(dashboard)/transactions/new/page.tsx:186`

## Performance

## Bugs

## Security

- [ ] add a Content-Security-Policy (with Clerk + Convex allowlists) — start in Report-Only mode and promote once clean. `next.config.ts` already has baseline headers.

## UX

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

- [ ] add `aria-describedby` to dialogs; use `alertdialog` role for destructive confirmations

---

Completed work lives in [`CHANGELOG.md`](./CHANGELOG.md).
