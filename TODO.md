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

## Bugs

- [ ] edit form drops `goalId` (never read from FormData) and type-flip income↔expense can double-count budget — `convex/transactions/mutations.ts`, `src/app/(dashboard)/transactions/[id]/page.tsx`
- [ ] budget/goal `transactionCount` not adjusted on transaction `update`; budget/goal `remove` doesn't reverse counters — `convex/{transactions,budgets,goals}/mutations.ts`
- [ ] `accounts.remove` and `categories.remove` cascade-delete transactions without reversing budget/goal/category counters — `convex/{accounts,categories}/mutations.ts`
- [ ] `accounts.update` balance-correction bypasses `adjustAccount` and overwrites balance non-atomically — `convex/accounts/mutations.ts:107-160`
- [ ] typo: `goalLoading = budgets === undefined` (and `budLoading` swap) — `src/app/(dashboard)/transactions/[id]/page.tsx:69,376`
- [ ] `groupByDate` keys by UTC day → non-UTC users see transactions in wrong bucket — `convex/transactions/queries.ts:106`
- [ ] `validation/budget.ts` uses `.positive()` on `spent` — rejects legal value `0`
- [ ] `useSmartRouter` returns unbound `router.back/forward` — can throw — `src/hooks/use-smart-router.ts:23-31`

## Security

- [ ] `/api/chat` has no auth, rate limit, or input validation — anyone can drain Gemini key — `src/app/api/chat/route.ts`
- [ ] `next.config.ts` is empty — add CSP / security headers, `poweredByHeader: false`
- [ ] `HistoryTracker` localStorage key not namespaced per user — paths leak between accounts after sign-out — `src/components/history-tracker.tsx`

## UX

## UI / Design

## Done

- [x] transaction view
- [x] transaction edit
- [x] transaction delete
- [x] transaction delete confirmation
- [x] account view
- [x] account edit
- [x] account delete
- [x] disable buttons when action is being performed (submit button when form is being submitted)
- [x] migrate from mongodb to convex
- [x] consult chat-bot
- [x] budget
- [x] goal
- [x] add custom ~~brand~~ hiruko theme
- [x] change lucide icons to tabler icons
- [x] ~~[simple icons](https://simpleicons.org/) for using brand icons~~ use tabler brand icons instead
- [x] use sorted data from convex in data list
- [x] format budget/goal card amounts via shared `formatCurrency` helper
- [x] clamp budget/goal Progress with `Math.min(100, ...)`
- [x] fix `AddGoalCard` payload using wrong field (`balance` → `amount`)
- [x] sidebar active-route highlighting + nav-main `asChild` link wiring
- [x] add `aria-label` to icon-only floating add button and theme toggle
- [x] rename `CateogryList` → `CategoryList`
- [x] drop hex fallbacks on chart CSS vars
- [x] `ErrorMessage` shows the actual error message as the heading
- [x] extract shared `EmptyState`; rename duplicate `DataListSkeleton` → `TransactionListSkeleton`/`CategoryListSkeleton`
- [x] consolidate page padding to `p-4 md:p-6`; remove `px-4 lg:px-6` from list internals
- [x] always render Add card as last grid child (drop parity hack)
- [x] add `--success` token; replace raw `text-emerald-500`/`bg-emerald-500` with `text-success`/`bg-success`
- [x] AddBudget/AddGoal dialog form parity (DialogFooter, Cancel, asterisks, name attrs, missing isSubmitting reset)
- [x] consult page: flex-1 conversation height, real animation-delay on dots, isLoading reset only after stream completes
- [x] transactions edit: button reads "Discard" while editing; drop the `Button asChild` wrapping a button
- [x] `ListItem` rows have hover background, cursor, and focus-visible ring
- [x] middleware allowlists `/manifest.webmanifest`, `/icons/*`, `/favicon.ico` for PWA install previews
