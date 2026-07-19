import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast-provider";
import { AuthProvider } from "@/components/auth/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Englipedia - Kosakata Bahasa Inggris",
  description: "Belajar kosakata Bahasa Inggris dengan cara baca Indonesia",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Englipedia",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#8b5cf6" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn(inter.variable, "h-full antialiased")} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {/* ⚡ Flash-prevention: set dark class before React hydrates */}
        <script dangerouslySetInnerHTML={{
          __html: `!function(){try{var e=localStorage.getItem("engli-theme")||"system",t="dark"===e||"system"===e&&window.matchMedia("(prefers-color-scheme: dark)").matches;t&&document.documentElement.classList.add("dark")}catch(e){}}()`
        }} />
        <AuthProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
