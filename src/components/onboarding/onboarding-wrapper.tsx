"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WelcomeScreen } from "./welcome-screen";
import { LevelSelect } from "./level-select";
import { FirstWordReveal } from "./first-word";
import { useRouter } from "next/navigation";

type Step = "welcome" | "level-select" | "first-word" | "done";

const ONBOARDING_KEY = "engli-onboarding-done";

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return true;
  }
}

export function markOnboardingDone(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "true");
  } catch {
    // Ignore
  }
}

export function clearOnboardingFlag(): void {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // Ignore
  }
}

export function OnboardingWrapper() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [selectedLevel, setSelectedLevel] = useState<string>("intermediate");

  const handleWelcomeDone = useCallback((level?: string) => {
    if (level) setSelectedLevel(level);
    setStep("level-select");
  }, []);

  const handleLevelDone = useCallback((level: string) => {
    setSelectedLevel(level);
    setStep("first-word");
  }, []);

  const handleFirstWordDone = useCallback(() => {
    setStep("done");
    markOnboardingDone();
    // Redirect to home after a brief pause
    setTimeout(() => router.push("/"), 800);
  }, [router]);

  const handleSkip = useCallback(() => {
    markOnboardingDone();
    // Save default level
    try {
      localStorage.setItem("engli-default-level", "all");
    } catch {}
    router.push("/");
  }, [router]);

  const stepVariants = {
    initial: { opacity: 0, y: 30, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.97 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      {/* Skip button — always visible except on last step */}
      <div className="absolute top-4 right-4 z-50">
        {step !== "done" && (
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            Lewati
          </button>
        )}
      </div>

      {/* Step progress dots */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        {(["welcome", "level-select", "first-word"] as Step[]).map((s, i) => {
          const stepOrder = ["welcome", "level-select", "first-word"];
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = stepOrder.indexOf(s);
          const isActive = thisIdx === currentIdx;
          const isDone = thisIdx < currentIdx;

          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isDone
                    ? "bg-primary"
                    : isActive
                    ? "bg-primary w-3 h-3"
                    : "bg-muted-foreground/20"
                }`}
              />
              {i < stepOrder.length - 1 && (
                <div
                  className={`w-6 h-px transition-colors duration-300 ${
                    isDone ? "bg-primary" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === "welcome" && (
              <motion.div
                key="welcome"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <WelcomeScreen onContinue={handleWelcomeDone} />
              </motion.div>
            )}

            {step === "level-select" && (
              <motion.div
                key="level-select"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <LevelSelect
                  defaultLevel={selectedLevel}
                  onSelect={handleLevelDone}
                />
              </motion.div>
            )}

            {step === "first-word" && (
              <motion.div
                key="first-word"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <FirstWordReveal onDone={handleFirstWordDone} />
              </motion.div>
            )}

            {step === "done" && (
              <motion.div
                key="done"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-4xl">🎉</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold"
                >
                  Siap Belajar!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground mt-2"
                >
                  Kata pertamamu sudah menunggu...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
