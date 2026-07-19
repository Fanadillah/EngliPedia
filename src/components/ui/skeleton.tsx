import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton loading component with shimmer animation.
 * Matches the design system's warm gray palette.
 */
export function Skeleton({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted/70 rounded-md";
  
  const variants = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "h-32 w-full rounded-2xl",
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

/**
 * Skeleton card for word cards, with title + subtitle lines.
 */
export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-4 space-y-3", className)}>
      <Skeleton variant="text" className="h-5 w-2/3" />
      <Skeleton variant="text" className="h-3.5 w-1/2" />
      {lines > 2 && <Skeleton variant="text" className="h-3.5 w-3/4" />}
      {lines > 3 && <Skeleton variant="text" className="h-3 w-1/3" />}
    </div>
  );
}

/**
 * Skeleton for the Word of the Day hero card.
 */
export function SkeletonWOTD({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-3xl p-6 space-y-4", className)}>
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="h-6 w-28 rounded-full" />
        <Skeleton variant="circular" className="h-9 w-9" />
      </div>
      <div className="text-center space-y-3 py-4">
        <div className="flex justify-center">
          <Skeleton variant="text" className="h-10 w-3/4 max-w-[200px]" />
        </div>
        <div className="flex justify-center">
          <Skeleton variant="text" className="h-4 w-1/3" />
        </div>
        <div className="flex justify-center">
          <Skeleton variant="text" className="h-5 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="flex justify-center">
        <Skeleton variant="text" className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton for search result list.
 */
export function SkeletonSearchList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={3} />
      ))}
    </div>
  );
}
