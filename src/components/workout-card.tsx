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
