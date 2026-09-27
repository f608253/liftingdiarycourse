# Lifting Diary — Project Setup & Architecture Guide

# Links and Apps used for this project:
# Udemy Course: https://capgemini.udemy.com/course/learn-claude-code/learn/lecture/52626733#overview

# Clerk: https://dashboard.clerk.com/apps/app_3JqLcuMAhAkoB43NRaawkXfsI0i/instances/ins_3JqLd0fJtUCttax92ugfRijYF6L/users/user_3JqOz1MVeCyJ1FQCCGr723UbmWL?users_hiddenColumns=username%2Cphone_number

# Neon DB - https://console.neon.tech/app/projects/icy-sky-63302933/branches/br-divine-mountain-b3u1ne1n/tables?database=neondb

# Drizzle docs - https://orm.drizzle.team/docs/get-started/neon-new

# Personal GH Repo - https://github.com/f608253/liftingdiarycourse/tree/master

> **Branch Notice (`dashboard-page-updated`)**: In this branch, we use **Shadcn UI** for UI development. There are specific guidelines to follow when developing UI components and features for this application.

A modern full-stack workout and fitness tracking web application built with **Next.js 16**, **React 19**, **Clerk Authentication**, **Neon Serverless Postgres**, and **Drizzle ORM**.

---

## 🛠️ Tools & Technologies Used & Their Purpose

| Tool / Technology | Technology Type | Purpose & Usage in Project |
| :--- | :--- | :--- |
| **Next.js 16 (App Router)** | Full-Stack Framework | Serves as the core React framework. Utilizes file-based routing, Server Components by default, and high-performance server rendering. |
| **React 19** | Frontend Library | UI rendering engine supporting modern concurrent features and Server Components. |
| **TypeScript** | Programming Language | Provides static typing across schema definitions, server components, and API integration for end-to-end type safety. |
| **Clerk Auth (`@clerk/nextjs`)** | Authentication Service | Manages user authentication, session security, sign-in/sign-up flows, and user profiles. Uses `clerkMiddleware` (`src/proxy.ts`) for route protection and pre-built UI components (`SignInButton`, `UserButton`, `SignIn`, `SignUp`). |
| **Neon Postgres (`@neondatabase/serverless`)** | Serverless Database | Cloud-native serverless PostgreSQL database. Offers instant connection scaling and uses HTTP-based drivers ideal for serverless execution environments. |
| **Drizzle ORM (`drizzle-orm`, `drizzle-kit`)** | ORM & Migration Tool | TypeScript-first Object-Relational Mapper used to define SQL schemas, write type-safe queries, handle relationships (`defineRelations`), and push schema changes to Neon. |
| **Tailwind CSS v4 & PostCSS** | Styling Framework | Utility-first CSS styling engine. Uses Tailwind v4 standard `@import "tailwindcss"` and `@theme inline` CSS custom variables in `globals.css`. |
| **Shadcn UI & Base UI (`@base-ui/react`)** | UI Component Primitives | Accessible component primitives and styling utilities (like `cva`, `cn` helper) for clean component UI (e.g. `button.tsx`). |
| **Lucide React** | Icon Set | Provides clean, scalable icons for UI components. |
| **tsx (`tsx`)** | TypeScript Executor | CLI tool used to run database seed scripts and query tests directly (`npx tsx src/index.ts`). |

---

## 📋 Steps Followed in Building This Project

### Step 1: Project Initialization & Structure Setup
- Initialized a Next.js 16 project configured with TypeScript, App Router, and Tailwind CSS v4.
- Established path aliases (`@/*` pointing to `./src/*`) and configured `tsconfig.json`.

### Step 2: Authentication Configuration with Clerk
- Installed `@clerk/nextjs`.
- Wrapped the root application layout (`src/app/layout.tsx`) with `<ClerkProvider>`.
- Configured authentication middleware in `src/proxy.ts` using `clerkMiddleware()` to handle secure request routing.
- Built authentication pages:
  - Sign In: `src/app/sign-in/[[...sign-in]]/page.tsx`
  - Sign Up: `src/app/sign-up/[[...sign-up]]/page.tsx`
- Created a top navigation bar in `src/components/Header.tsx` displaying conditional authentication states (`SignInButton`, `SignUpButton`, `UserButton` via Clerk's `<Show>` component).

### Step 3: Database Setup with Neon Postgres & Drizzle ORM
- Created a serverless PostgreSQL project on Neon.
- Installed `drizzle-orm`, `drizzle-kit`, and `@neondatabase/serverless`.
- Configured environment variables in `.env` with `DATABASE_URL`.
- Created Drizzle configuration file `drizzle.config.ts` targeting `postgresql` dialect and outputting SQL snapshots to `./drizzle`.
- Established database connection in `src/db/index.ts` using Neon's serverless HTTP driver.

### Step 4: Schema Definition & Relational Data Modeling
- Defined database tables in `src/db/schema.ts`:
  - **`usersTable`**: Auto-incrementing primary key identity, name, age, unique email.
  - **`workoutsTable`**: UUID primary key, Clerk `userId`, workout name, start and completion timestamps.
  - **`exercisesTable`**: Exercises belonging to a workout (`workoutId` foreign key referencing `workoutsTable` with `onDelete: "cascade"`), order index.
  - **`setsTable`**: Individual exercise sets referencing `exercisesTable` (`exerciseId` with `onDelete: "cascade"`), set number, reps, weight, unit, duration, and RPE (Rate of Perceived Exertion).
- Defined relational mapping in `src/db/relations.ts` using Drizzle's `defineRelations` (One-to-Many for Workouts -> Exercises and Exercises -> Sets).

### Step 5: Database Migration & Schema Push
- Executed `npx drizzle-kit push` to sync Drizzle schema definitions directly to the cloud Neon database.

### Step 6: Database CRUD Testing Script
- Created `src/index.ts` to perform and test end-to-end database operations:
  - **Create**: Inserting a new user into `usersTable`.
  - **Read**: Fetching all users from database.
  - **Update**: Updating user records using `drizzle-orm` operators (`eq`).
  - **Delete**: Removing test users.
- Run test script via `npx tsx src/index.ts`.

### Step 7: Global Styling & Theming Setup
- Configured custom OKLCH theme color tokens, radius variables, dark mode variants, and base layer styles in `src/app/globals.css`.

---

## 🗄️ Database Schema Diagram Structure

```
+------------------+       +-------------------+
|      Users       |       |     Workouts      |
+------------------+       +-------------------+
| id (PK, int)     |       | id (PK, uuid)     |
| name (varchar)   |       | userId (text)     | <--- Clerk User ID
| age (int)        |       | name (text)       |
| email (unique)   |       | startedAt (ts)    |
+------------------+       | completedAt (ts)  |
                           +-------------------+
                                     | 1
                                     |
                                     | N (on delete cascade)
                           +-------------------+
                           |     Exercises     |
                           +-------------------+
                           | id (PK, uuid)     |
                           | userId (text)     |
                           | workoutId (FK)    | ----> Workouts.id
                           | name (text)       |
                           | order (int)       |
                           +-------------------+
                                     | 1
                                     |
                                     | N (on delete cascade)
                           +-------------------+
                           |       Sets        |
                           +-------------------+
                           | id (PK, uuid)     |
                           | userId (text)     |
                           | exerciseId (FK)   | ----> Exercises.id
                           | setNumber (int)   |
                           | reps (int)        |
                           | weight (numeric)  |
                           | unit (text)       |
                           | durationSeconds   |
                           | rpe (numeric)     |
                           +-------------------+
```

---

## 🚀 Available Commands & Usage

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js Turbopack development server on `http://localhost:3000`. |
| `npm run build` | Builds the production bundle. |
| `npm run start` | Runs the production build. |
| `npm run lint` | Runs ESLint checks across the codebase. |
| `npx drizzle-kit push` | Pushes the Drizzle schema changes directly to Neon Postgres. |
| `npx drizzle-kit generate` | Generates SQL migration files in `./drizzle`. |
| `npx drizzle-kit migrate` | Applies pending database migrations. |
| `npx tsx src/index.ts` | Runs the database test/seed script. |

---

## 📁 Key File Structure

```text
liftingdiarycourse/
├── drizzle/                  # Generated SQL migrations and schema snapshots
├── src/
│   ├── app/
│   │   ├── globals.css       # Tailwind v4 import & OKLCH color system
│   │   ├── layout.tsx        # Root Layout wrapped with ClerkProvider & Header
│   │   ├── page.tsx          # Main landing page
│   │   ├── sign-in/          # Clerk custom Sign-In page
│   │   └── sign-up/          # Clerk custom Sign-Up page
│   ├── components/
│   │   ├── Header.tsx        # Top navigation with Clerk auth buttons
│   │   └── ui/               # Reusable UI components (button.tsx)
│   ├── db/
│   │   ├── index.ts          # Neon HTTP client + Drizzle ORM instance
│   │   ├── schema.ts         # Table definitions (users, workouts, exercises, sets)
│   │   └── relations.ts      # Relational mapping definitions
│   ├── lib/                  # Helper utilities (utils.ts for cn merge)
│   ├── index.ts              # Script to test DB operations
│   └── proxy.ts              # Clerk authentication middleware
├── drizzle.config.ts         # Drizzle Kit CLI configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies and npm scripts
└── tsconfig.json             # TypeScript compiler settings
```
