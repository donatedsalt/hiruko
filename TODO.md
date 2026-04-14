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

## Bugs

- [ ] edit form drops `goalId` (never read from FormData) and type-flip income↔expense can double-count budget — `convex/transactions/mutations.ts`, `src/app/(dashboard)/transactions/[id]/page.tsx`
- [ ] budget/goal `transactionCount` not adjusted on transaction `update`; budget/goal `remove` doesn't reverse counters — `convex/{transactions,budgets,goals}/mutations.ts`
- [ ] `accounts.remove` and `categories.remove` cascade-delete transactions without reversing budget/goal/category counters — `convex/{accounts,categories}/mutations.ts`
- [ ] `accounts.update` balance-correction bypasses `adjustAccount` and overwrites balance non-atomically — `convex/accounts/mutations.ts:107-160`
- [ ] typo: `goalLoading = budgets === undefined` (and `budLoading` swap) — `src/app/(dashboard)/transactions/[id]/page.tsx:69,376`
- [ ] `groupByDate` keys by UTC day → non-UTC users see transactions in wrong bucket — `convex/transactions/queries.ts:106`
- [ ] `validation/budget.ts` uses `.positive()` on `spent` — rejects legal value `0`
- [ ] `useSmartRouter` returns unbound `router.back/forward` — can throw — `src/hooks/use-smart-router.ts:23-31`

## Latent / perf

- [ ] race on denormalized counters: handlers read account/category/budget/goal early then patch after many awaits — re-fetch right before patch
- [ ] `listAllVariants` + `groupBy*` `.collect()` entire tables on every dashboard mount — paginate or aggregate
- [ ] `createDefaultCategories` called from a form `useEffect` with no uniqueness guard → can create duplicates — `convex/categories/mutations.ts`, `src/app/(dashboard)/transactions/new/page.tsx:81-85`

## Security

- [ ] `/api/chat` has no auth, rate limit, or input validation — anyone can drain Gemini key — `src/app/api/chat/route.ts`
- [ ] `next.config.ts` is empty — add CSP / security headers, `poweredByHeader: false`
- [ ] `HistoryTracker` localStorage key not namespaced per user — paths leak between accounts after sign-out — `src/components/history-tracker.tsx`

## UX

- [ ] middleware treats `/manifest.webmanifest` and icon paths as protected — breaks PWA install previews — `src/middleware.ts:3`

## UI / Design

- [ ] consult page: fixed `height: 500px`; loading-dot `delay-75/150` are *transition* delays not animation; `setIsLoading(false)` runs in per-token finally — `src/app/(dashboard)/consult/page.tsx:98,114-118,82`
- [ ] add-budget/goal dialog forms diverge from edit forms (no Cancel, no required asterisks, different spacing) — `src/components/{budget,goal}-card.tsx:298-345`
- [ ] income uses raw `text-emerald-500` (not a token) and color is the only signal in some places — promote to `--color-success`/`text-success` — `transaction-list.tsx`, `category-list.tsx`, `category-dialog.tsx:188`
- [ ] edit page "Cancel" reads the same in view + edit modes; doesn't discard dirty state — `src/app/(dashboard)/transactions/[id]/page.tsx:502-528`
- [ ] `ListItem` div branch (category-list) has no hover/focus/cursor styling despite being clickable — `src/components/{list-item,category-list}.tsx`

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
