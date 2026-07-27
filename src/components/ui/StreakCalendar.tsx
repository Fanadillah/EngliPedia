"use client";

import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StreakCalendarProps {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  className?: string;
}

export function StreakCalendar({ streak, lastActiveDate, className }: StreakCalendarProps) {
  // Generate 7 days (today + 6 days back)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const isActiveToday = lastActiveDate === new Date().toISOString().split("T")[0];

  return (
    <div className={cn("bg-card rounded-2xl border border-border p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Aktivitas Terakhir</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🔥</span>
          <span className="font-bold text-orange-500">{streak}</span>
          <span className="text-xs text-muted-foreground">hari</span>
        </div>
      </div>

      <div className="flex justify-between gap-1">
        {days.map((date) => {
          const isToday = date === new Date().toISOString().split("T")[0];
          const isActive = lastActiveDate && date <= lastActiveDate && date >= days[0];

          return (
            <div key={date} className="flex flex-col items-center gap-1.5 flex-1">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium transition-all",
                  isToday && isActiveToday
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : isActive
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isActive ? "✓" : ""}
              </motion.div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(date).toLocaleDateString("id-ID", { weekday: "short" }).charAt(0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
