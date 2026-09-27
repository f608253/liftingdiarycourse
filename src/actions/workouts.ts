"use server";

import { auth } from "@clerk/nextjs/server";
import { createFullWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const SetSchema = z.object({
  setNumber: z.number().int().positive(),
  reps: z.number().int().nonnegative().optional(),
  weight: z.string().optional(),
  unit: z.string().default("kg"),
  durationSeconds: z.number().int().nonnegative().optional(),
  rpe: z.string().optional(),
});

const ExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name cannot be empty"),
  order: z.number().int().nonnegative(),
  sets: z.array(SetSchema),
});

const CreateWorkoutPayloadSchema = z.object({
  name: z.string().min(1, "Workout name is required").max(100),
  startedAt: z.string().or(z.date()),
  completedAt: z.string().or(z.date()).nullable().optional(),
  exercises: z.array(ExerciseSchema).default([]),
});

export type CreateWorkoutPayload = z.infer<typeof CreateWorkoutPayloadSchema>;

export async function createWorkoutAction(payload: CreateWorkoutPayload) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized. Please sign in.");
  }

  const validated = CreateWorkoutPayloadSchema.safeParse(payload);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const data = validated.data;
    await createFullWorkout({
      userId,
      name: data.name,
      startedAt: new Date(data.startedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      exercises: data.exercises,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create workout",
    };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
