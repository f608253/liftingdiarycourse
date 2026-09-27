import { db } from '@/db'
import { workoutsTable, exercisesTable, setsTable } from '@/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'

export type Workout = {
  id: string
  name: string | null
  startedAt: Date
  completedAt: Date | null
}

export type CreateWorkoutSetInput = {
  setNumber: number
  reps?: number
  weight?: string
  unit?: string
  durationSeconds?: number
  rpe?: string
}

export type CreateWorkoutExerciseInput = {
  name: string
  order: number
  sets: CreateWorkoutSetInput[]
}

export type CreateFullWorkoutInput = {
  userId: string
  name: string
  startedAt: Date
  completedAt?: Date | null
  exercises: CreateWorkoutExerciseInput[]
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

/**
 * Create a new complete workout with its exercises and sets within a transaction
 */
export async function createFullWorkout(data: CreateFullWorkoutInput) {
  return await db.transaction(async (tx) => {
    // 1. Insert the workout
    const [insertedWorkout] = await tx
      .insert(workoutsTable)
      .values({
        userId: data.userId,
        name: data.name,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      })
      .returning({ id: workoutsTable.id })

    // 2. Insert exercises and sets if any
    for (const exerciseData of data.exercises) {
      const [insertedExercise] = await tx
        .insert(exercisesTable)
        .values({
          userId: data.userId,
          workoutId: insertedWorkout.id,
          name: exerciseData.name,
          order: exerciseData.order,
        })
        .returning({ id: exercisesTable.id })

      if (exerciseData.sets && exerciseData.sets.length > 0) {
        await tx.insert(setsTable).values(
          exerciseData.sets.map((s) => ({
            userId: data.userId,
            exerciseId: insertedExercise.id,
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            unit: s.unit || 'kg',
            durationSeconds: s.durationSeconds,
            rpe: s.rpe,
          }))
        )
      }
    }

    return insertedWorkout
  })
}
