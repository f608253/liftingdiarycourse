"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  initialDate: string;
}

export default function DatePicker({ initialDate }: DatePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newDate) {
      params.set("date", newDate);
    } else {
      params.delete("date");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="workout-date" className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <Calendar className="w-4 h-4" />
        Select Date:
      </label>
      <input
        id="workout-date"
        type="date"
        value={initialDate}
        onChange={handleDateChange}
        className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
      />
    </div>
  );
}
