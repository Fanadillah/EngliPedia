"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: "circle" | "square" | "star";
  delay: number;
  drift: number;
}

const COLORS = [
  "#8B5CF6", // primary
  "#F97316", // orange
  "#10B981", // emerald
  "#3B82F6", // blue
  "#EC4899", // pink
  "#F59E0B", // amber
  "#06B6D4", // cyan
  "#A855F7", // purple
];

const SHAPES: ("circle" | "square" | "star")[] = ["circle", "square", "star"];

export function Confetti({ active, duration = 3000, particleCount = 60, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active && !show) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: -10 - Math.random() * 20,
          rotation: Math.random() * 360,
          scale: 0.3 + Math.random() * 0.7,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          delay: Math.random() * 0.3,
          drift: (Math.random() - 0.5) * 30,
        });
      }
      setParticles(newParticles);
      setShow(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShow(false);
        setParticles([]);
        onComplete?.();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]); // eslint-disable-line

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              initial={{
                y: -20,
                x: 0,
                rotate: 0,
                opacity: 1,
                scale: p.scale,
              }}
              animate={{
                y: [null, 60 + Math.random() * 40],
                x: p.drift,
                rotate: p.rotation * (Math.random() > 0.5 ? 1 : -1),
                opacity: [1, 0.8, 0],
                scale: [p.scale, p.scale * 0.5],
              }}
              transition={{
                duration: 1.5 + Math.random() * 1.5,
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {p.shape === "circle" ? (
                <div
                  className="rounded-full"
                  style={{
                    width: 6 + Math.random() * 6,
                    height: 6 + Math.random() * 6,
                    backgroundColor: p.color,
                  }}
                />
              ) : p.shape === "square" ? (
                <div
                  className="rounded-sm"
                  style={{
                    width: 5 + Math.random() * 5,
                    height: 5 + Math.random() * 5,
                    backgroundColor: p.color,
                    transform: `rotate(${p.rotation}deg)`,
                  }}
                />
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  style={{ transform: `rotate(${p.rotation}deg)` }}
                >
                  <polygon
                    points="5,0 6.3,3.4 10,3.9 7.3,6.5 8.1,10 5,8 1.9,10 2.7,6.5 0,3.9 3.7,3.4"
                    fill={p.color}
                  />
                </svg>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
