# Changelog

Historical record of completed work. For authoritative history, see `git log`.

## Unreleased

- `/api/chat` hardening: Clerk auth (401), same-origin check (403), 8 KB body cap (413), Zod prompt validation (400), per-user 20/min rate limit (429), sanitized error logs, fail-fast on missing `GEMINI_API_KEY` (503)
- consult page: surface network / 401 / 429 / 400 / 5xx as visible system messages instead of silent failure
- `useSmartRouter` / `HistoryTracker`: namespace visitedPaths per Clerk userId (no cross-account leak), wrap router methods so `back`/`forward` are safe to destructure
- transaction view
- transaction edit
- transaction delete
- transaction delete confirmation
- account view
- account edit
- account delete
- disable buttons when action is being performed (submit button when form is being submitted)
- migrate from mongodb to convex
- consult chat-bot
- budget
- goal
- add custom ~~brand~~ hiruko theme
- change lucide icons to tabler icons
- ~~[simple icons](https://simpleicons.org/) for using brand icons~~ use tabler brand icons instead
- use sorted data from convex in data list
- format budget/goal card amounts via shared `formatCurrency` helper
- clamp budget/goal Progress with `Math.min(100, ...)`
- fix `AddGoalCard` payload using wrong field (`balance` → `amount`)
- sidebar active-route highlighting + nav-main `asChild` link wiring
- add `aria-label` to icon-only floating add button and theme toggle
- rename `CateogryList` → `CategoryList`
- drop hex fallbacks on chart CSS vars
- `ErrorMessage` shows the actual error message as the heading
- extract shared `EmptyState`; rename duplicate `DataListSkeleton` → `TransactionListSkeleton`/`CategoryListSkeleton`
- consolidate page padding to `p-4 md:p-6`; remove `px-4 lg:px-6` from list internals
- always render Add card as last grid child (drop parity hack)
- add `--success` token; replace raw `text-emerald-500`/`bg-emerald-500` with `text-success`/`bg-success`
- AddBudget/AddGoal dialog form parity (DialogFooter, Cancel, asterisks, name attrs, missing isSubmitting reset)
- consult page: flex-1 conversation height, real animation-delay on dots, isLoading reset only after stream completes
- transactions edit: button reads "Discard" while editing; drop the `Button asChild` wrapping a button
- `ListItem` rows have hover background, cursor, and focus-visible ring
- middleware allowlists `/manifest.webmanifest`, `/icons/*`, `/favicon.ico` for PWA install previews
