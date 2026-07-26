"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { PageTransition } from "@/components/ui/motion-components";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { SWRegister } from "@/components/ui/sw-register";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        <AnimatePresence mode="wait">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Service Worker registration */}
      <SWRegister />
    </div>
  );
}
