# Dashboard Page Design Document

**Date:** 2026-09-26  
**Status:** Approved  

## Overview
Implement a `/dashboard` page in the Next.js App Router application that displays logged workouts for a user on a selected date. The page includes a datepicker component that defaults to the current date and updates URL search parameters for date filtering.

## Architecture & Data Flow

### 1. Route & Authentication
- **Path:** `/dashboard` (`src/app/dashboard/page.tsx`).
- **Auth:** Uses Clerk `auth()` to retrieve `userId`. Unauthenticated requests are redirected or rejected.

### 2. Date Filtering & URL State
- **URL Parameter:** `?date=YYYY-MM-DD`.
- **Defaulting:** If `date` is missing from `searchParams`, default to today's date formatted as `YYYY-MM-DD`.
- **Date Range Querying:** The selected date string is parsed into start of day (`00:00:00.000`) and end of day (`23:59:59.999`) boundary `Date` objects.

### 3. Database Query
- Uses Drizzle ORM relational query:
  ```ts
  const workouts = await db.query.workoutsTable.findMany({
    where: and(
      eq(workoutsTable.userId, userId),
      gte(workoutsTable.startedAt, dayStart),
      lte(workoutsTable.startedAt, dayEnd)
    ),
    with: {
      exercises: {
        orderBy: (exercises, { asc }) => [asc(exercises.order)],
        with: {
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
    orderBy: (workouts, { desc }) => [desc(workouts.startedAt)],
  });
  ```

## Components & File Structure

### 1. `src/app/dashboard/page.tsx` (Server Component)
- Asynchronously resolves Next.js 16 `searchParams` (`Promise<{ date?: string }>`).
- Fetches user workouts with nested exercises and sets for the target date.
- Renders:
  - Header & DatePicker controls.
  - Workout cards list or an empty state when no workouts are found.

### 2. `src/app/dashboard/date-picker.tsx` (Client Component `"use client"`)
- Form control wrapping `<input type="date">`.
- Synchronizes with `router.push('/dashboard?date=YYYY-MM-DD')` on change.

### 3. `src/components/workout-card.tsx` (Server / UI Component)
- Card component displaying:
  - Workout title (or default "Untitled Workout") and start/completion times.
  - List of exercises.
  - Table or grid of set details (Set #, Reps, Weight + Unit, RPE, Duration).

### 4. `src/components/Header.tsx` (Update)
- Includes a nav link to `/dashboard` when signed in.

## Design Self-Review
- [x] No placeholders or TODOs.
- [x] Internal consistency between Next.js 16 searchParams handling, Drizzle relational schema, and Clerk authentication.
- [x] Single focused feature scope.
- [x] Explicit behavior for empty state, date bounds, and missing parameters.
