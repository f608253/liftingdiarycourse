# Data Fetching Standards — Project `liftingdiarycourse`

## Core Principle
**ALL** data fetching in this application **MUST** be done exclusively via **Server Components**.

## Prohibited Approaches
- ❌ **NO** data fetching in Route Handlers (`app/api/*`)
- ❌ **NO** data fetching in Client Components (`"use client"`)
- ❌ **NO** data fetching via SWR, React Query, or similar client-side libraries
- ❌ **NO** data fetching in `useEffect`, `useState`, or any client-side hooks
- ❌ **NO** direct database queries in route handlers or client code

## Required Approach
✅ **ONLY** fetch data in Server Components (components without `"use client"` directive)

## Database Access Rules
1. **All** database queries **MUST** be performed via helper functions located in the `/src/data` directory (or equivalent data layer)
2. These helper functions **MUST** use **Drizzle ORM** exclusively
3. **RAW SQL IS STRICTLY PROHIBITED** anywhere in the codebase
4. Helper functions should be pure functions that accept parameters and return typed data

## User Data Isolation
✅ **CRITICAL**: A logged-in user **MUST ONLY** be able to access **their own data**
❌ **STRICTLY FORBIDDEN**: Allowing users to access any data belonging to other users
- All database queries **MUST** include a user ID filter (typically `userId = currentUserId`)
- Never return data without verifying it belongs to the requesting user
- Implement proper authentication checks before any data access

## Implementation Pattern
### Server Component Example
```tsx
// app/dashboard/page.tsx - Server Component (no "use client")
import { getUserWorkouts } from '@/data/workouts'

export default async function Dashboard() {
  // Get current user from auth (Clerk, etc.)
  const userId = await getCurrentUserId() // Your auth helper
  
  // Fetch data ONLY through data helper
  const workouts = await getUserWorkouts(userId)
  
  return (
    <div>
      {/* Render workouts */}
    </div>
  )
}
```

### Data Helper Example
```ts
// src/data/workouts.ts
import { db } from '@/db'
import { workouts } from '@/db/schema'

export async function getUserWorkouts(userId: string) {
  return await db.select().from(workouts).where(eq(workouts.userId, userId))
}
```

## Validation Checklist
Before any code is merged, verify:
- [ ] No `"use client"` in files that fetch data
- [ ] No `fetch` or data fetching libraries in client components
- [ ] All database queries go through `/src/data` helpers
- [ ] All helpers use Drizzle ORM (no raw SQL)
- [ ] Every query includes user-specific filtering
- [ ] Authentication checks precede data access

## Consequences of Violation
Violating these standards creates:
- **Security vulnerabilities** (unauthorized data access)
- **Performance problems** (unnecessary client-server roundtrips)
- **Architectural inconsistency** (mixing concerns)
- **Maintenance nightmares** (scattered data logic)

Adherence to this standard is **NON-NEGOTIABLE** for all contributions to this project.