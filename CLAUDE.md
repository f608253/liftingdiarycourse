# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start dev server (Turbopack, http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint (flat config, eslint.config.mjs)
- `npx drizzle-kit push` — apply database schema changes directly to Neon Postgres
- `npx drizzle-kit generate` — generate migration files
- `npx drizzle-kit migrate` — execute database migrations
- `npx tsx src/index.ts` — run database seed/query test script

No test framework is configured yet.

## Architecture

**Next.js 16 App Router** with React 19, TypeScript, Tailwind CSS v4, Clerk Auth, and Drizzle ORM (Neon Postgres).

- `src/app/` — App Router routes, layouts, and pages
- `src/db/schema.ts` — Drizzle ORM database tables & schema definitions
- `src/db/index.ts` — Database connection setup using `@neondatabase/serverless` HTTP driver
- `drizzle.config.ts` — Drizzle Kit configuration file
- `drizzle/` — Drizzle migration files and SQL snapshots
- `src/app/layout.tsx` — root layout (Geist fonts, global CSS, ClerkProvider, Header)
- `src/app/globals.css` — Tailwind v4 import + CSS custom properties for theming
- `public/` — static assets

**Path alias:** `@/*` maps to `./src/*`.

## Key differences in this stack

- **Next.js 16:** APIs may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/01-app/` before using unfamiliar APIs. Note `LayoutProps<"/">` typed layout props (see `layout.tsx`).
- **Tailwind CSS v4:** Uses `@import "tailwindcss"` and `@theme inline` blocks in CSS instead of `tailwind.config.js`. Theme tokens are CSS custom properties, not JS config.
- **React 19:** Server Components are the default. Use `"use client"` only when the component needs browser APIs, state, or effects.
