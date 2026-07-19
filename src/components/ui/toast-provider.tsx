"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Trophy, Flame, Star, Zap } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  message: string;
  type: "xp" | "achievement" | "streak" | "success" | "info" | "error";
  xpAmount?: number;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

// ─── Context ────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Icons per type ─────────────────────────────────────────────────────

const typeIcons = {
  xp: Sparkles,
  achievement: Trophy,
  streak: Flame,
  success: Star,
  info: Zap,
  error: X,
};

const typeColors = {
  xp: "from-purple-500 to-violet-500",
  achievement: "from-amber-400 to-orange-500",
  streak: "from-orange-400 to-red-500",
  success: "from-emerald-400 to-green-500",
  info: "from-blue-400 to-indigo-500",
  error: "from-red-400 to-rose-500",
};

// ─── Provider ───────────────────────────────────────────────────────────

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++toastCounter}`;
      const duration = toast.duration ?? (toast.type === "xp" ? 2500 : 4000);

      setToasts((prev) => [...prev.slice(-4), { ...toast, id }]); // Max 4 visible

      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const Icon = typeIcons[toast.type];
            const colors = typeColors[toast.type];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
                className="pointer-events-auto relative overflow-hidden rounded-2xl bg-card border border-border shadow-lg shadow-black/5 dark:shadow-black/20"
              >
                {/* Gradient accent bar */}
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${colors}`} />

                <div className="flex items-start gap-3 p-3.5">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-card-foreground leading-snug">
                      {toast.message}
                    </p>
                    {toast.type === "xp" && toast.xpAmount && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1.5 bg-muted rounded-full flex-1 max-w-[120px] overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${Math.min(100, (toast.xpAmount || 0) * 2)}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-violet-500">
                          +{toast.xpAmount} XP
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="p-0.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
