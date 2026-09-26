# Project Architecture & Workflow Guide: Lifting Diary App

This document explains how the **Lifting Diary** application works under the hood, how the `npm run dev` command operates, how routing and rendering occur for pages, how authentication functions, and how **Clerk**, **Neon**, and **Drizzle ORM** collaborate to fetch and display data.

---

## 1. Project Overview & Tech Stack

This application is built with the modern full-stack web architecture:

| Technology | Role | Details |
| :--- | :--- | :--- |
| **Next.js 16 (App Router)** | Full-stack Framework | Uses React 19, Server Components by default, file-system routing, and Turbopack compiler. |
| **Clerk** (`@clerk/nextjs`) | Authentication & User Management | Handles user signup, sign-in, session tokens, security middleware, and auth state components. |
| **Neon PostgreSQL** (`@neondatabase/serverless`) | Serverless Database | Cloud-hosted PostgreSQL database optimized for serverless/edge connection over HTTP/WebSockets. |
| **Drizzle ORM** (`drizzle-orm`) | Type-Safe Database ORM | SQL-like query builder and migration generator connected to Neon via `drizzle-orm/neon-http`. |
| **Tailwind CSS v4** | UI Styling | Utilizes CSS variables and utility classes. |

---

## 2. What Happens Behind `npm run dev`?

When you run `npm run dev` in your terminal, the following happens:

1. **Script Execution (`package.json`)**:
   `package.json` maps `"dev": "next dev"`. Executing `npm run dev` triggers the Next.js CLI binary located in `node_modules/.bin/next`.

2. **Server & Compiler Initialization**:
   - Next.js boots up a local Node.js development HTTP server listening at `http://localhost:3000`.
   - Next.js 16 uses **Turbopack** (an ultra-fast Rust-based bundler) to compile TypeScript (`.ts`/`.tsx`) and Tailwind CSS modules on demand.
   - Environment variables are loaded from `.env` and `.env.local` into `process.env` (e.g., `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).

3. **Middleware Interception (`src/proxy.ts` / `src/middleware.ts`)**:
   Every incoming HTTP request first hits `clerkMiddleware()` defined in `src/proxy.ts`. Clerk checks incoming request cookies/headers to attach the authenticated user context (`auth()`) to the request.

4. **Root Layout Wrapping (`src/app/layout.tsx`)**:
   Every page rendered in the App Router is wrapped inside `RootLayout`:
   - Loads global CSS (`src/app/globals.css`).
   - Configures Geist fonts (`geistSans`, `geistMono`).
   - Wraps the entire application inside `<ClerkProvider>` to provide authentication context to client and server components.
   - Renders the global `<Header />` navigation bar (`src/components/Header.tsx`).
   - Renders `{children}` (the specific page component being accessed).

---

## 3. How Pages are Rendered (`/` and `/dashboard`)

Next.js App Router uses **file-system based routing** inside the `src/app` directory.

### A. Home Page (`http://localhost:3000/`)

- **File used**: `src/app/page.tsx`
- **Render Flow**:
  1. Request `/` hits Next.js server.
  2. Middleware runs (`src/proxy.ts`).
  3. `src/app/layout.tsx` mounts: `<ClerkProvider>` + `<Header />`.
  4. `src/app/page.tsx` executes as a Server Component and returns the HTML layout (Next.js logo, welcome message, links).
  5. Next.js streams the combined HTML page to the browser.

### B. Dashboard Page (`http://localhost:3000/dashboard`)

- **Routing mechanism**: In Next.js App Router, routing is directory-based. Creating a file at `src/app/dashboard/page.tsx` automatically exposes the URL path `/dashboard`.
- **Render Flow**:
  1. Request `/dashboard` hits Next.js server.
  2. Middleware runs (`src/proxy.ts`), ensuring the user is authenticated.
  3. `src/app/layout.tsx` wraps the request with `<Header />` and `<ClerkProvider>`.
  4. `src/app/dashboard/page.tsx` executes on the server as a **React Server Component**.
  5. The Server Component retrieves the current user's ID via `auth()` from Clerk, queries Neon Postgres using Drizzle ORM, and renders the user's workouts and exercises directly into HTML before sending it to the browser.

---

## 4. How Login Works on the Application

Authentication is powered by **Clerk** (`@clerk/nextjs`).

```
[User Browser] ---> (Clicks Sign In)
       |
       v
[src/app/sign-in/[[...sign-in]]/page.tsx]  (Renders Clerk <SignIn /> component)
       |
       v
[Clerk Auth Servers] (Authenticates user, sets encrypted session cookie)
       |
       v
[src/proxy.ts (clerkMiddleware)] (Intercepts requests, validates token, extracts userId)
       |
       v
[src/components/Header.tsx] (<Show when="signed-in"> displays <UserButton />)
```

1. **Authentication Context**: `<ClerkProvider>` in `src/app/layout.tsx` provides authentication state across all server and client components.
2. **Middleware Interceptor**: `clerkMiddleware()` in `src/proxy.ts` executes on every route request to read session tokens stored in browser cookies and populate `auth()`.
3. **Catch-all Routes**:
   - `src/app/sign-in/[[...sign-in]]/page.tsx`: Renders Clerk's `<SignIn />` component.
   - `src/app/sign-up/[[...sign-up]]/page.tsx`: Renders Clerk's `<SignUp />` component.
4. **Header Navigation UI**: `src/components/Header.tsx` uses Clerk components:
   - `<Show when="signed-out">`: Displays `<SignInButton />` and `<SignUpButton />`.
   - `<Show when="signed-in">`: Displays `<UserButton />` (allowing user profile management and logout).

---

## 5. Database Architecture: Neon & Drizzle ORM

The application stores user lifting logs, workouts, exercises, and sets in a database.

### Schema Structure (`src/db/schema.ts`)

- **`workoutsTable`**: Represents a workout session (e.g., "Leg Day").
  - `id`: Unique UUID primary key.
  - `userId`: Text string storing the Clerk user ID (links workout to the logged-in user).
  - `startedAt`, `completedAt`: Timestamps.
- **`exercisesTable`**: Represents an exercise within a workout (e.g., "Bench Press").
  - `id`: Unique UUID primary key.
  - `userId`: Clerk user ID.
  - `workoutId`: Foreign key referencing `workoutsTable.id` (`onDelete: "cascade"`).
  - `name`: Exercise title.
  - `order`: Integer sequence order.
- **`setsTable`**: Represents individual sets within an exercise (e.g., 10 reps @ 80kg).
  - `id`: Unique UUID primary key.
  - `exerciseId`: Foreign key referencing `exercisesTable.id`.
  - `setNumber`, `reps`, `weight`, `unit`, `durationSeconds`, `rpe`.

### Database Connection Setup (`src/db/index.ts`)

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { relations } from './relations';

// 1. Establish HTTP connection to Neon Postgres using DATABASE_URL
const sql = neon(process.env.DATABASE_URL!);

// 2. Initialize Drizzle ORM instance with relations
export const db = drizzle({ client: sql, relations });
```

---

## 6. How Clerk, Neon, and Drizzle Work Together to Render the Dashboard

When a logged-in user requests `/dashboard`, all three services collaborate seamlessly in a server-side execution pipeline:

```
+-----------------------------------------------------------------------------------+
| Next.js Server Component (src/app/dashboard/page.tsx)                              |
+-----------------------------------------------------------------------------------+
       |
       | 1. Obtain Authenticated User ID
       v
  [ Clerk Auth (`auth()`) ]  ====>  Returns userId (e.g., "user_29X...")
       |
       | 2. Construct Type-Safe Query with User Filter
       v
  [ Drizzle ORM (`db.query.workoutsTable.findMany`) ]
       |   - Filters by `userId`
       |   - Includes related `exercises` and `sets`
       v
  [ Neon HTTP Driver (`@neondatabase/serverless`) ]
       |
       | 3. Send SQL over HTTP Request
       v
  [ Neon PostgreSQL Database ]  ====>  Executes SQL query & returns JSON data
       |
       | 4. Return Typed Objects
       v
  [ Drizzle ORM ]  ====>  Parse JSON rows into TypeScript objects
       |
       | 5. Render HTML with Data
       v
  [ Browser ]  <====  Streams fully rendered Dashboard HTML page
```

### Example Dashboard Server Component Data Fetching Flow:

```typescript
// Example src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { workoutsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  // Step 1: Clerk retrieves current authenticated user ID
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Step 2: Drizzle ORM queries Neon DB for workouts owned by this userId
  const userWorkouts = await db.query.workoutsTable.findMany({
    where: eq(workoutsTable.userId, userId),
    with: {
      exercises: {
        with: {
          sets: true,
        },
      },
    },
  });

  // Step 3: Next.js renders the workouts into HTML and sends to user
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Your Workout Dashboard</h1>
      {userWorkouts.map((workout) => (
        <div key={workout.id} className="border p-4 my-2 rounded">
          <h2>{workout.name || "Unnamed Workout"}</h2>
          <p>Started: {new Date(workout.startedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### Summary of Roles:

1. **Clerk**: Secures the route and provides the verified `userId`.
2. **Drizzle ORM**: Builds type-safe SQL queries using TypeScript models (`workoutsTable`, `exercisesTable`, `setsTable`) and handles relations.
3. **Neon Database**: Receives the query over lightweight HTTP requests, executes it on cloud PostgreSQL, and returns data instantly without connection pool overhead.
4. **Next.js**: Coordinates the request on the server, fetches data during server rendering, and sends pure HTML to the user's browser.
