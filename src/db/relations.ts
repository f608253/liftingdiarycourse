import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  workoutsTable: {
    exercises: r.many.exercisesTable({
      from: r.workoutsTable.id,
      to: r.exercisesTable.workoutId,
    }),
  },
  exercisesTable: {
    workout: r.one.workoutsTable({
      from: r.exercisesTable.workoutId,
      to: r.workoutsTable.id,
    }),
    sets: r.many.setsTable({
      from: r.exercisesTable.id,
      to: r.setsTable.exerciseId,
    }),
  },
  setsTable: {
    exercise: r.one.exercisesTable({
      from: r.setsTable.exerciseId,
      to: r.exercisesTable.id,
    }),
  },
}));
