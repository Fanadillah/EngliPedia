"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail, Lock, Eye, EyeOff, Globe, ArrowLeft,
  User, ShieldCheck, LogIn, UserPlus, Check, X,
} from "lucide-react";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { motion, AnimatePresence } from "motion/react";

type AuthMode = "login" | "register";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam ? "Terjadi kesalahan. Silakan coba lagi." : null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const supabase = createClient();

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    setPasswordStrength(score);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/profile");
        router.refresh();
      } else {
        // Validasi register
        if (!fullName.trim()) throw new Error("Nama lengkap harus diisi");
        if (password !== confirmPassword) throw new Error("Konfirmasi password tidak cocok");

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
        if (error) throw error;
        setSuccess(`🎉 Akun berhasil dibuat! Cek email ${email} untuk konfirmasi.`);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setSuccess(null);
    setPasswordStrength(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>
        <DarkModeToggle variant="icon" className="shrink-0" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-br ${
              mode === "login"
                ? "from-primary to-secondary"
                : "from-emerald-500 to-teal-500"
            }`}>
              {mode === "login" ? (
                <LogIn className="w-7 h-7 text-white" />
              ) : (
                <UserPlus className="w-7 h-7 text-white" />
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-bold">
                  {mode === "login" ? "Masuk" : "Buat Akun Baru"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "login"
                    ? "Lanjutkan belajar kosakatamu"
                    : "Mulai petualangan belajarmu"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error / Success messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3 mb-4"
            >
              <p              className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl px-4 py-3 mb-4"
            >
              <p              className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </motion.div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {/* ── Nama Lengkap (Register only) ── */}
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="name-field"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="relative pb-3">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Nama Lengkap"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-9 h-12 rounded-xl bg-card border-border"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Email ── */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 h-12 rounded-xl bg-card border-border"
              />
            </div>

            {/* ── Password ── */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "login" ? "Password" : "Password (min. 6 karakter)"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (mode === "register") checkPasswordStrength(e.target.value);
                }}
                required
                minLength={6}
                className="pl-9 pr-9 h-12 rounded-xl bg-card border-border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* ── Password Strength (Register only) ── */}
            <AnimatePresence mode="wait">
              {mode === "register" && password.length > 0 && (
                <motion.div
                  key="strength"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 pb-1">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength
                              ? passwordStrength <= 2
                                ? "bg-red-400"
                                : passwordStrength <= 3
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                              : "bg-muted-foreground/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {passwordStrength <= 2
                        ? "Lemah"
                        : passwordStrength <= 3
                        ? "Sedang"
                        : "Kuat"}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Konfirmasi Password (Register only) ── */}
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="confirm-field"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="relative pb-1">
                    <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Konfirmasi Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`pl-9 h-12 rounded-xl bg-card border-border ${
                        confirmPassword && password !== confirmPassword
                          ? "border-red-400 focus-visible:border-red-400"
                          : confirmPassword && password === confirmPassword
                          ? "border-emerald-400 focus-visible:border-emerald-400"
                          : ""
                      }`}
                    />
                    {confirmPassword && (
                      <span className="absolute right-3 top-3">
                        {password === confirmPassword ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                      </span>
                    )}
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-red-400 mt-0.5 px-1">
                      Password tidak cocok
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit Button ── */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-xl font-semibold text-base transition-all ${
                mode === "login"
                  ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {mode === "login" ? "Memproses..." : "Mendaftarkan..."}
                </span>
              ) : mode === "login" ? (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Buat Akun
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              {mode === "login" ? "atau" : "atau daftar dengan"}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google OAuth */}
          <Button
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-card border-border text-card-foreground font-medium hover:bg-muted transition-all"
          >
            <Globe className="w-5 h-5 mr-2.5" />
            {mode === "login" ? "Lanjutkan dengan Google" : "Daftar dengan Google"}
          </Button>

          {/* Toggle mode */}
          <motion.p
            layout
            className="text-center text-sm text-muted-foreground mt-6"
          >
            {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button
              onClick={switchMode}
              className={`font-semibold hover:underline ${
                mode === "login" ? "text-emerald-500" : "text-primary"
              }`}
            >
              {mode === "login" ? "Daftar Sekarang" : "Masuk"}
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
