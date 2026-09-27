# Authentication Coding Standards

## Core Provider
- **Clerk** (`@clerk/nextjs`) is the **exclusive** provider for authentication, user management, and session handling in this application.
- **NO custom authentication logic**, manual password hashing, or custom JWT handling should be implemented.

## Provider & Middleware Architecture
- **Root Provider**: The root layout (`src/app/layout.tsx`) MUST wrap the entire application within `<ClerkProvider>`.
- **Middleware**: All request interception and auth checks MUST use `clerkMiddleware()` in `src/proxy.ts`.
- **Auth Routes**: Use official Clerk catch-all page routes:
  - Sign In: `src/app/sign-in/[[...sign-in]]/page.tsx` rendering `<SignIn />`.
  - Sign Up: `src/app/sign-up/[[...sign-up]]/page.tsx` rendering `<SignUp />`.

## Server-Side Authentication
- In **Server Components**, **Server Actions**, and **Route Handlers**, use `auth()` from `@clerk/nextjs/server` to fetch authentication state:
  ```typescript
  import { auth } from "@clerk/nextjs/server";

  const { userId } = await auth();
  ```
- **Authorization Check**: Always verify that `userId` exists before querying or mutating user-specific data. If `userId` is missing, throw an unauthorized error or redirect to `/sign-in`.

## Client-Side Authentication & UI Components
- Use official Clerk React components for user interface controls:
  - `<SignInButton />` and `<SignUpButton />` for unauthenticated state.
  - `<UserButton />` for authenticated user profile management and sign-out.
  - Conditional rendering using Clerk's `<Show when="signed-in">` and `<Show when="signed-out">`.

## Database Integration Standards
- Use Clerk's string `userId` as the foreign identifier across database schemas (e.g., `userId: text("user_id").notNull()`).
- All database queries for user resources (workouts, exercises, sets) MUST filter explicitly by the authenticated `userId`:
  ```typescript
  import { eq } from "drizzle-orm";
  import { workoutsTable } from "@/db/schema";

  const userWorkouts = await db
    .select()
    .from(workoutsTable)
    .where(eq(workoutsTable.userId, userId));
  ```
