# Hiruko

AI-powered personal finance tracker for you and your businesses.

> Built for **Aptech Vision 2025**.

## Overview

Hiruko helps you track accounts, transactions, categories, budgets, and savings goals with realtime sync and an AI "Consult" assistant that streams insights over your own data.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack), React 19
- **Backend**: [Convex](https://convex.dev) (realtime DB + serverless functions)
- **Auth**: [Clerk](https://clerk.com)
- **Styling**: Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) (new-york), Tabler Icons
- **AI**: Google Gemini (`@google/genai`) via streaming route handler
- **Validation**: Zod v4
- **Package manager**: [Bun](https://bun.sh)

## Features

- Accounts with live balances and transaction counts
- Income/expense categorization with custom icons
- Transactions linked to accounts, categories, budgets, and goals
- Budget tracking with spend rollups
- Savings goals with progress tracking
- Interactive charts and daily statistics
- AI chat for financial insights (Gemini-powered)
- Installable PWA with light/dark theme

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- Clerk application (Frontend API URL + publishable/secret keys)
- Convex project (`npx convex dev` on first run)
- Google Gemini API key

### Environment Variables

Copy [`.env.example`](.env.example) to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Note: `CLERK_WEBHOOK_SECRET` is read by the Convex HTTP action, so set it on the Convex deployment as well:

```bash
bunx convex env set CLERK_WEBHOOK_SECRET whsec_...
```

### Install & Run

```bash
bun install
bun run dev
```

This runs Next.js (Turbopack) and `convex dev` concurrently. Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script               | Description                                 |
| -------------------- | ------------------------------------------- |
| `bun run dev`        | Run Next.js and Convex dev servers together |
| `bun run dev:next`   | Run only the Next.js dev server             |
| `bun run dev:convex` | Run only the Convex dev server              |
| `bun run build`      | Production build (includes type-checking)   |
| `bun run start`      | Start the production build                  |
| `bun run lint`       | Run ESLint                                  |

## Project Structure

```
src/
  app/
    (auth)/          # Sign-in / sign-up routes
    (dashboard)/     # Main app (transactions, budgets, goals, consult, ...)
    api/chat/        # Streaming Gemini endpoint
  components/        # Feature + shadcn/ui components
  hooks/             # Custom React hooks
  lib/               # Shared utilities
  types/             # Convex document/id type aliases
  validation/        # Zod schemas
convex/
  schema.ts          # Database schema
  <feature>/         # queries.ts + mutations.ts per feature
  http.ts            # Clerk webhook handler
```

## Roadmap

See [TODO.md](TODO.md) for the active backlog and [CHANGELOG.md](CHANGELOG.md) for shipped work.
