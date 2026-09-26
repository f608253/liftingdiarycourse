import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
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
    where: {
      userId,
      startedAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    with: {
      exercises: {
        orderBy: { order: "asc" },
        with: {
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
    orderBy: { startedAt: "desc" },
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
