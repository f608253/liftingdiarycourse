# Dashboard Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a `/dashboard` page in Next.js App Router that allows users to select a date via a datepicker (defaulting to current date) and view logged workouts, exercises, and set details for that date.

**Architecture:** Server Component page at `/dashboard` that reads `searchParams.date`, queries Neon Postgres via Drizzle ORM relational queries filtered by user ID (Clerk auth) and day start/end dates. Includes a `"use client"` DatePicker input updating URL search params (`?date=YYYY-MM-DD`).

**Tech Stack:** Next.js 16 (App Router), React 19, Clerk Auth, Drizzle ORM (Neon Postgres), Tailwind CSS v4, Lucide React icons.

**Spec:** `docs/superpowers/specs/2026-09-26-dashboard-page-design.md`

## Global Constraints
- Next.js 16 async `searchParams` (`searchParams: Promise<{ date?: string }>`).
- Clerk authentication with `auth()`.
- Date parameter format: `YYYY-MM-DD`.
- Tailwind CSS v4 styling matching existing dark/light theme.

---

### Task 1: Update Header Navigation Link

**Files:**
- Modify: `src/components/Header.tsx`

**Interfaces:**
- Consumes: `@clerk/nextjs` (`Show`, `UserButton`, etc.), Next.js `Link`
- Produces: Navigation link to `/dashboard` when user is signed in

- [ ] **Step 1: Update `src/components/Header.tsx` with Dashboard link**

```tsx
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-xl font-bold">
        Lifting Diary
      </Link>
      <nav className="flex items-center gap-4">
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:underline text-zinc-700 dark:text-zinc-300"
          >
            Dashboard
          </Link>
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Verify linting passes**

Run: `npm run lint`  
Expected: PASS with no warnings or errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: add dashboard link to header navigation"
```

---

### Task 2: Create DatePicker Client Component

**Files:**
- Create: `src/app/dashboard/date-picker.tsx`

**Interfaces:**
- Consumes: Next.js `useRouter`, `useSearchParams`, `usePathname`
- Produces: Client component `<DatePicker initialDate={string} />`

- [ ] **Step 1: Write `src/app/dashboard/date-picker.tsx`**

```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  initialDate: string;
}

export default function DatePicker({ initialDate }: DatePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newDate) {
      params.set("date", newDate);
    } else {
      params.delete("date");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="workout-date" className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <Calendar className="w-4 h-4" />
        Select Date:
      </label>
      <input
        id="workout-date"
        type="date"
        value={initialDate}
        onChange={handleDateChange}
        className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify linting passes**

Run: `npm run lint`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/date-picker.tsx
git commit -m "feat: create DatePicker component for dashboard date filtering"
```

---

### Task 3: Create WorkoutCard Component

**Files:**
- Create: `src/components/workout-card.tsx`

**Interfaces:**
- Consumes: Workout object with nested `exercises` and `sets`
- Produces: Rendered UI component displaying workout header, exercises, and set details

- [ ] **Step 1: Write `src/components/workout-card.tsx`**

```tsx
import { Dumbbell, Clock } from "lucide-react";

export interface SetDetail {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
  unit: string | null;
  durationSeconds: number | null;
  rpe: string | null;
}

export interface ExerciseDetail {
  id: string;
  name: string;
  order: number;
  sets: SetDetail[];
}

export interface WorkoutDetail {
  id: string;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exercises: ExerciseDetail[];
}

interface WorkoutCardProps {
  workout: WorkoutDetail;
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  const formattedStartTime = new Date(workout.startedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedEndTime = workout.completedAt
    ? new Date(workout.completedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {workout.name || "Untitled Workout"}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {formattedStartTime}
            {formattedEndTime ? ` - ${formattedEndTime}` : " (In Progress)"}
          </span>
        </div>
      </div>

      {workout.exercises.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">No exercises logged in this workout.</p>
      ) : (
        <div className="space-y-4">
          {workout.exercises.map((exercise) => (
            <div key={exercise.id} className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {exercise.name}
              </h3>
              {exercise.sets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium">
                      <tr>
                        <th className="px-3 py-1.5 rounded-l">Set</th>
                        <th className="px-3 py-1.5">Reps</th>
                        <th className="px-3 py-1.5">Weight</th>
                        <th className="px-3 py-1.5">Duration</th>
                        <th className="px-3 py-1.5 rounded-r">RPE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {exercise.sets.map((set) => (
                        <tr key={set.id}>
                          <td className="px-3 py-1.5 font-medium">{set.setNumber}</td>
                          <td className="px-3 py-1.5">{set.reps ?? "-"}</td>
                          <td className="px-3 py-1.5">
                            {set.weight ? `${set.weight} ${set.unit || "kg"}` : "-"}
                          </td>
                          <td className="px-3 py-1.5">
                            {set.durationSeconds ? `${set.durationSeconds}s` : "-"}
                          </td>
                          <td className="px-3 py-1.5">{set.rpe ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic pl-3">No sets recorded.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify linting passes**

Run: `npm run lint`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/workout-card.tsx
git commit -m "feat: create WorkoutCard component for rendering logged workouts"
```

---

### Task 4: Create Dashboard Page

**Files:**
- Create: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `@clerk/nextjs/server` `auth()`, `src/db/index.ts`, `src/db/schema.ts`, `src/app/dashboard/date-picker.tsx`, `src/components/workout-card.tsx`
- Produces: Next.js Server Component page at `/dashboard`

- [ ] **Step 1: Write `src/app/dashboard/page.tsx`**

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { workoutsTable } from "@/db/schema";
import DatePicker from "./date-picker";
import WorkoutCard from "@/components/workout-card";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const todayString = new Date().toISOString().split("T")[0];
  const selectedDateString = resolvedSearchParams.date || todayString;

  // Calculate start of day and end of day in local / UTC context
  const dayStart = new Date(`${selectedDateString}T00:00:00.000Z`);
  const dayEnd = new Date(`${selectedDateString}T23:59:59.999Z`);

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

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black p-4 sm:p-8">
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Workout Dashboard</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              View and track your logged workouts by date.
            </p>
          </div>
          <DatePicker initialDate={selectedDateString} />
        </div>

        {workouts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center space-y-3">
            <p className="text-zinc-600 dark:text-zinc-400 text-base">
              No workouts logged for <span className="font-semibold text-zinc-900 dark:text-zinc-200">{selectedDateString}</span>.
            </p>
            <p className="text-xs text-zinc-400">Select another date using the datepicker above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify linting passes**

Run: `npm run lint`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: create /dashboard page to load logged workouts by date"
```
