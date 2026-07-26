"use client";

import { motion } from "motion/react";
import Link from "next/link";

interface WelcomeScreenProps {
  onContinue: (level?: string) => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="text-center space-y-8 py-8">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/25"
      >
        <span className="text-4xl font-bold text-white">E</span>
      </motion.div>

      {/* Title */}
      <div className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl font-bold tracking-tight"
        >
          Englipedia
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg text-muted-foreground"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            Temukan{" "}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
            className="text-primary font-semibold"
          >
            kata baru
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.3 }}
          >
            {" "}setiap hari
          </motion.span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="text-sm text-muted-foreground"
        >
          Dengarkan cara bacanya, pahami artinya, dan ingat selamanya!
        </motion.p>
      </div>

      {/* Features preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="grid grid-cols-2 gap-3 max-w-xs mx-auto"
      >
        {[
          { icon: "📖", label: "9.000+ Kata" },
          { icon: "🔊", label: "Cara Baca" },
          { icon: "🧠", label: "Spaced Repetition" },
          { icon: "🎯", label: "Latihan Interaktif" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 + i * 0.1, duration: 0.3 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl px-3 py-3 text-center"
          >
            <span className="text-xl block mb-1">{item.icon}</span>
            <span className="text-[11px] font-medium text-muted-foreground leading-tight block">
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.5 }}
        className="space-y-3"
      >
        <button
          onClick={() => onContinue()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          🚀 Mulai Petualangan
        </button>

        <p className="text-xs text-muted-foreground">
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sudah punya akun? Masuk
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
