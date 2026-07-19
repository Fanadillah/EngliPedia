interface IllustrationProps {
  className?: string;
}

export function ProfileEmptyIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Person silhouette */}
      <circle cx="100" cy="65" r="28" stroke="currentColor" strokeWidth="4" opacity="0.12" />
      
      {/* Body */}
      <path
        d="M55 170 C55 135 75 115 100 115 C125 115 145 135 145 170"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.12"
        strokeLinecap="round"
      />
      
      {/* Decorative circles */}
      <circle cx="40" cy="40" r="2.5" fill="currentColor" opacity="0.06" />
      <circle cx="160" cy="50" r="2" fill="currentColor" opacity="0.06" />
      <circle cx="170" cy="120" r="3" fill="currentColor" opacity="0.06" />
      <circle cx="30" cy="140" r="2" fill="currentColor" opacity="0.06" />
      
      {/* Login arrow */}
      <path
        d="M75 170 L125 170"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.15"
        strokeLinecap="round"
      />
      <path
        d="M115 162 L125 170 L115 178"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        opacity="0.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Shield lock */}
      <rect x="92" y="178" width="16" height="14" rx="3" fill="currentColor" opacity="0.06" />
    </svg>
  );
}
