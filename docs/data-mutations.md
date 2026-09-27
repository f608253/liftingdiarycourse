# Data Mutation Coding Standards

## Data Layer (`src/data`)
- All mutations MUST use helper functions inside `src/data/` that wrap Drizzle ORM db calls (e.g. `db.insert()`, `db.update()`).

## Server Actions (`actions.ts`)
- All mutations MUST use colocated `actions.ts` files with `"use server"`.
- Params MUST be typed; NEVER use `FormData`.

## Validation
- ALL server actions MUST validate arguments with `zod`. No exceptions.
