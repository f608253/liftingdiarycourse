import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { getUserWorkoutsByDate, Workout } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";
import DatePicker from "./components/DatePicker";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const { userId } = await auth();
  const selectedDate = params?.date ? new Date(params.date) : new Date();
  const formattedDate = format(selectedDate, "do MMM yyyy");

  let workouts: Workout[] = [];
  if (userId) {
    workouts = await getUserWorkoutsByDate(userId, selectedDate);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-col flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Workout Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Select a date to view your workouts
            </p>
          </div>

          {/* Date Picker */}
          <DatePicker selectedDate={selectedDate} />

          {/* Workouts List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Workouts for {formattedDate}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Your logged workouts for this day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workouts.length === 0 ? (
                  /* Empty state */
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No workouts logged for this day
                    </p>
                    <Button variant="outline" size="sm" className="mx-auto">
                      Log a workout
                    </Button>
                  </div>
                ) : (
                  /* Workout list */
                  <ul className="space-y-3">
                    {workouts.map((workout) => (
                      <li
                        key={workout.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {workout.name ?? 'Untitled Workout'}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {format(workout.startedAt, "h:mm a")}
                          </p>
                        </div>
                        <div className="text-right text-sm font-semibold">
                          <span className="text-green-600 dark:text-green-400">
                            {workout.completedAt ? 'Completed' : 'In progress'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}