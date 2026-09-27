'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

export default function DatePicker({ selectedDate }: {
  selectedDate: Date;
}) {
  const router = useRouter();
  const dateValue = selectedDate.toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const newDate = new Date(e.target.value);
    // Update URL — triggers server-side re-render with new date
    router.push(`?date=${newDate.toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-4">
      <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Date
      </label>
      <div className="relative">
        <Input
          id="date-picker"
          type="date"
          value={dateValue}
          onChange={handleChange}
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inside ring-gray-300 dark:ring-gray-600 dark:bg-gray-800 dark:text-gray-50 focus:ring-2 focus:ring-inside focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  );
}