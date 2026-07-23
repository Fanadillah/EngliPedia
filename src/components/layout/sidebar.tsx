"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BookOpen, Heart, Trophy, User, BarChart3, Sparkles, LogIn, Brain, GraduationCap, Target, Headphones, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { useAuth } from "@/components/auth/auth-context";

const navItems = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/learn", icon: GraduationCap, label: "Belajar" },
  { href: "/practice", icon: Brain, label: "Latihan" },
  { href: "/listening", icon: Headphones, label: "Listening" },
  { href: "/video-learning", icon: Film, label: "Video" },
  { href: "/search", icon: Search, label: "Jelajahi" },
  { href: "/saved", icon: Heart, label: "Tersimpan" },
  { href: "/progress", icon: Target, label: "Progress" },
  { href: "/achievements", icon: Trophy, label: "Pencapaian" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 flex-col">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Englipedia</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-2 border-t border-border">
        {user ? (
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.user_metadata?.full_name || "Pengguna"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </Link>
        ) : !loading ? (
          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Masuk</span>
          </Link>
        ) : null}
      </div>

      {/* Dark mode toggle */}
      <div className="px-3 py-2 border-t border-border">
        <DarkModeToggle variant="icon" className="mx-auto" />
      </div>

      {/* Footer */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5">
        <p className="text-xs text-muted-foreground">10,007 kata tersedia</p>
        <p className="text-[11px] text-primary font-medium mt-0.5">Mulai belajar sekarang!</p>
      </div>
    </aside>
  );
}
