"use client";

import { motion, type Variants } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// ─── Page Transition ────────────────────────────────────────

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with fade + slide animation.
 * Animates on mount and route change (via pathname key).
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Word Reveal ────────────────────────────────────────────

interface AnimatedWordProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Word reveal with scale + blur animation.
 * Perfect for Word of the Day and hero words.
 * Wrap around text inside semantic heading tags for accessibility.
 */
export function AnimatedWord({
  children,
  className,
  delay = 0,
}: AnimatedWordProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Staggered Children ─────────────────────────────────────

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container that staggers children animations.
 * Each child will animate in one after another.
 */
export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * Individual item within a StaggerContainer.
 * Animates in with slide-up and fade.
 */
export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Hover Card ─────────────────────────────────────────────

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Card that lifts on hover with smooth shadow transition.
 * Includes subtle scale-down on press.
 */
export function HoverCard({ children, className, onClick }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ─── Slide Up ───────────────────────────────────────────────

interface SlideUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Slides content up from below with fade.
 * Great for toasts, notifications, and staggered content.
 */
export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Fade In ────────────────────────────────────────────────

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Simple fade-in animation.
 */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Scale In ───────────────────────────────────────────────

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Scales content in from center.
 * Good for badges, modals, and emphasis elements.
 */
export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
