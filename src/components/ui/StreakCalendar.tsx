\"use client\";

import { motion } from \"motion/react\";
import { clsx, type ClassValue } from \"clsx\";
import { twMerge } from \"tailwind-merge\";

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
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const todayStr = new Date().toISOString().split(\"T\")[0];
  const lastActive = new Date(lastActiveDate).toISOString().split(\"T\")[0];

  return (
    <div className={cn(\"p-5 bg-card rounded-3xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]\", className)}>
      <div className=\"flex items-center justify-between mb-4\">
        <h3 className=\"font-bold text-foreground\">Your Streak</h3>
        <div className=\"flex items-center gap-1.5 bg-purple-500/10 px-3 py-1 rounded-full\">
          <span className=\"text-purple-400 font-bold\">{streak}</span>
          <span className=\"text-purple-400/70 text-xs font-medium\">days</span>
        </div>
      </div>

      <div className=\"grid grid-cols-7 gap-2\">
        {days.map((date, i) => {
          const dateStr = date.toISOString().split(\"T\")[0];
          // Logika asli: apakah tanggal ini <= today DAN >= lastActiveDate?
          // Atau lebih sederhana: apakah tanggal ini dalam streak history?
          // Untuk sekarang, kita hitung selisih hari.
          const isToday = dateStr === todayStr;
          
          // Logic: Jika lastActiveDate <= dateStr dan dateStr <= todayStr
          const isActive = dateStr <= todayStr && dateStr >= lastActive;
          
          return (
            <div key={i} className=\"flex flex-col items-center gap-1.5\">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={cn(
                  \"w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border\",
                  isActive
                    ? \"bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20\"
                    : \"bg-muted/30 border-border text-muted-foreground\",
                  isToday && !isActive && \"border-purple-400 ring-2 ring-purple-500/20\"
                )}
              >
                {date.getDate()}
              </motion.div>
              <span className={cn(
                \"text-[10px] font-medium uppercase\",
                isToday ? \"text-purple-400 font-bold\" : \"text-muted-foreground\"
              )}>
                {date.toLocaleDateString(\"id-ID\", { weekday: \"short\" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
