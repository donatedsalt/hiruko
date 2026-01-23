# Agent Guide for Hiruko

This repository contains the source code for Hiruko, a personal finance tracker built with Next.js 15, Convex, and Tailwind CSS.

## 1. Environment & Commands

### Package Management & Build
- **Manager**: Use `bun`. `package.json` is the source of truth.
- **Dev Server**: `bun run dev` (Turbopack enabled).
- **Build**: `bun run build` (Production build & Type Check).
- **Lint**: `bun run lint` (ESLint).

### Testing & Verification
- **Status**: No unit test framework (Jest/Vitest) is currently configured.
- **Protocol**:
  1. **Build Integrity**: Run `bun run build`. This is your primary "test" to verify type safety.
  2. **Linting**: Run `bun run lint`.
  3. **Manual**: Verify changes in the dev environment if possible.
  4. **Fixes**: If build/lint fails, analyze and fix before asking for user feedback.

## 2. Project Structure

- **src/app**: App Router. `(auth)` for Clerk, `(dashboard)` for app, `api` for routes.
- **src/components**:
  - `ui`: shadcn/ui components (Radix primitives).
  - `ai`: AI-specific UI.
- **src/lib**: `utils.ts` (contains `cn`).
- **src/hooks**: Custom hooks.
- **convex**: Backend. `schema.ts`, `_generated`, `[feature]/` folders.

## 3. Code Style & Conventions

### General
- **Language**: TypeScript (`.ts`, `.tsx`) is mandatory. Strict mode enabled.
- **Imports**: Use absolute imports: `import { Button } from "@/components/ui/button";`
- **Formatting**: Prettier inferred. Clean, consistent code.

### Naming
- **Files**: `kebab-case` (e.g., `transaction-list.tsx`).
- **Components**: `PascalCase` (e.g., `TransactionList`).
- **Functions**: `camelCase`.
- **Convex**: `camelCase` for queries/mutations.

### UI & Styling (Tailwind v4)
- **Class Merging**: **ALWAYS** use `cn` from `@/lib/utils` for `className` props.
  ```tsx
  export function Box({ className }: { className?: string }) {
    return <div className={cn("p-4 bg-red-500", className)} />;
  }
  ```
- **Icons**: Use `@tabler/icons-react`.
- **Components**: Check `src/components/ui` for existing shadcn/ui components before creating new ones.
- **Client Components**: Add `'use client'` if using hooks/events.
- **Feedback**: Use `sonner` for toasts (`toast.success("...")`).

## 4. Backend (Convex)

- **Schema**: Defined in `convex/schema.ts` with `v` validators.
- **Auth**: Always use `requireUserId` (from `convex/utils/auth.ts`) or similar to secure queries/mutations.
- **Implementation**:
  ```typescript
  import { query } from "@/convex/_generated/server";
  import { v } from "convex/values";
  export const list = query({
    args: { id: v.id("table") },
    handler: async (ctx, args) => { /* implementation */ }
  });
  ```
- **Fetching**: Use typed hooks: `useQuery(api.feature.queries.list, args)`.

## 5. Workflow & Planning

### Planning
- **Source of Truth**: Read `PLAN.md` before starting major tasks.
- **Updates**: Update `PLAN.md` with progress or new discoveries.

### Branching & Commits
- **Branches**:
  - Feature: `feature/<name>`
  - Fix: `fix/<issue>`
  - Refactor: `refactor/<scope>`
- **Commits**: Conventional Commits format:
  ```
  feat(auth): add login flow
  fix(ui): resolve padding issue on mobile
  ```
- **Rules**:
  - Never commit directly to `main`.
  - Do not commit unless explicitly requested.
  - Create a new branch for every new task.

## 6. Tool Usage for Agents
- **Docs**: Use `context7` tools to search library documentation.
- **Code Search**: Use `grep` or `glob` to find patterns in the local codebase.
- **Examples**: If unsure, search for usage examples within the codebase first.
