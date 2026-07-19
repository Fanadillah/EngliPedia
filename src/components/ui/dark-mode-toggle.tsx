"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

let _transitionTimer: ReturnType<typeof setTimeout> | null = null;

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("engli-theme") as Theme) || "system";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const html = document.documentElement;
  
  // Guard: cancel pending removal if user toggles rapidly
  if (_transitionTimer) clearTimeout(_transitionTimer);
  
  // Smooth transition: add class before toggling, remove after animation
  html.classList.add("theme-transitioning");
  html.classList.toggle("dark", resolved === "dark");
  
  // Update color-scheme meta for browser UI
  html.style.colorScheme = resolved === "dark" ? "dark" : "light";
  
  // Remove transitioning class after 0.35s transition completes
  _transitionTimer = setTimeout(() => {
    html.classList.remove("theme-transitioning");
    _transitionTimer = null;
  }, 350);
}

interface DarkModeToggleProps {
  variant?: "icon" | "toggle";
  className?: string;
}

export function DarkModeToggle({ variant = "toggle", className }: DarkModeToggleProps) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getStoredTheme());
    applyTheme(getStoredTheme());
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const stored = getStoredTheme();
      if (stored === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("engli-theme", newTheme);
    applyTheme(newTheme);
  };

  const cycleTheme = () => {
    const order: Theme[] = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  if (!mounted) {
    return <div className={`w-9 h-9 rounded-xl bg-muted ${className || ""}`} />;
  }

  if (variant === "icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={cycleTheme}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
          theme === "dark"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        } ${className || ""}`}
        aria-label={`Dark mode: ${theme}`}
      >
        <AnimatePresence mode="wait">
          {theme === "dark" ? (
            <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Moon className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sun className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className || ""}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
          {theme === "dark" ? (
            <Moon className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Sun className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div>
          <span className="text-sm font-medium">Dark Mode</span>
          <p className="text-[11px] text-muted-foreground capitalize">{theme}</p>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={cycleTheme}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          theme === "dark" ? "bg-primary" : theme === "system" ? "bg-amber-300" : "bg-muted-foreground/20"
        }`}
        aria-label="Toggle dark mode"
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm"
          animate={{
            left: theme === "dark" ? 26 : theme === "system" ? 13 : 2,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}
