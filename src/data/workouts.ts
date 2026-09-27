import { db } from '@/db'
import { workoutsTable } from '@/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'

export type Workout = {
  id: string
  name: string | null
  startedAt: Date
  completedAt: Date | null
}

/**
 * Get workouts for a specific user on a specific date
 * @param userId - The Clerk user ID
 * @param date - The date to fetch workouts for (defaults to today)
 */
export async function getUserWorkoutsByDate(userId: string, date: Date = new Date()) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const workouts = await db
    .select({
      id: workoutsTable.id,
      name: workoutsTable.name,
      startedAt: workoutsTable.startedAt,
      completedAt: workoutsTable.completedAt,
    })
    .from(workoutsTable)
    .where(
      and(
        eq(workoutsTable.userId, userId),
        gte(workoutsTable.startedAt, startOfDay),
        lte(workoutsTable.startedAt, endOfDay)
      )
    )
    .orderBy(workoutsTable.startedAt)

  return workouts
}

/**
 * Get all workouts for a specific user (paginated)
 * @param userId - The Clerk user ID
 * @param limit - Number of workouts to return
 * @param offset - Number of workouts to skip
 */
export async function getUserWorkouts(userId: string, limit = 10, offset = 0) {
  const workouts = await db
    .select({
      id: workoutsTable.id,
      name: workoutsTable.name,
      startedAt: workoutsTable.startedAt,
      completedAt: workoutsTable.completedAt,
    })
    .from(workoutsTable)
    .where(eq(workoutsTable.userId, userId))
    .orderBy(desc(workoutsTable.startedAt))
    .limit(limit)
    .offset(offset)

  return workouts
}