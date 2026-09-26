import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const workoutsTable = pgTable("workouts", {
  id: uuid().defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const exercisesTable = pgTable("exercises", {
  id: uuid().defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => workoutsTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
  order: integer().notNull(),
});

export const setsTable = pgTable("sets", {
  id: uuid().defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercisesTable.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  reps: integer(),
  weight: numeric(),
  unit: text().default("kg"),
  durationSeconds: integer("duration_seconds"),
  rpe: numeric(),
});
