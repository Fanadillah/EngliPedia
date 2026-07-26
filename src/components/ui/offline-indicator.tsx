"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff } from "lucide-react";

/**
 * Subtle offline indicator badge.
 * Menampilkan badge kecil "Offline" di pojok kiri bawah saat user offline.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleOnline = useCallback(() => {
    setOffline(false);
    // Keep visible briefly to show reconnection
    setTimeout(() => setVisible(false), 2000);
  }, []);

  const handleOffline = useCallback(() => {
    setOffline(true);
    setVisible(true);
  }, []);

  useEffect(() => {
    // Init state
    if (typeof navigator !== "undefined") {
      setOffline(!navigator.onLine);
      setVisible(!navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed bottom-22 md:bottom-4 left-4 z-[9999] flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md ${
            offline
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
          }`}
        >
          <WifiOff className={`w-3.5 h-3.5 ${!offline ? "hidden" : ""}`} />
          <span>
            {offline
              ? "Kamu sedang offline — data terbatas"
              : "Kembali online"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
