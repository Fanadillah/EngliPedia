interface IllustrationProps {
  className?: string;
}

export function BookEmptyIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Bookshelf */}
      <rect x="40" y="50" width="120" height="8" rx="4" fill="currentColor" opacity="0.1" />
      <rect x="40" y="100" width="120" height="8" rx="4" fill="currentColor" opacity="0.1" />
      <rect x="40" y="150" width="120" height="8" rx="4" fill="currentColor" opacity="0.1" />
      
      {/* Side panel */}
      <rect x="38" y="45" width="6" height="120" rx="3" fill="currentColor" opacity="0.12" />
      <rect x="156" y="45" width="6" height="120" rx="3" fill="currentColor" opacity="0.12" />
      
      {/* Book 1 */}
      <rect x="55" y="60" width="18" height="38" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="57" y="65" width="14" height="4" rx="1" fill="currentColor" opacity="0.08" />
      
      {/* Book 2 */}
      <rect x="80" y="65" width="14" height="33" rx="2" fill="currentColor" opacity="0.1" />
      
      {/* Book 3 */}
      <rect x="100" y="58" width="20" height="40" rx="2" fill="currentColor" opacity="0.12" />
      <rect x="102" y="63" width="16" height="4" rx="1" fill="currentColor" opacity="0.06" />
      
      {/* Leaning book */}
      <rect x="130" y="62" width="14" height="36" rx="2" fill="currentColor" opacity="0.08" />
      
      {/* Empty shelf space indicators */}
      <circle cx="70" cy="130" r="2" fill="currentColor" opacity="0.06" />
      <circle cx="110" cy="126" r="2" fill="currentColor" opacity="0.06" />
      
      {/* Heart icon */}
      <path d="M100 175 C100 175 90 165 85 158 C80 151 85 142 92 142 C97 142 100 146 100 146 C100 146 103 142 108 142 C115 142 120 151 115 158 C110 165 100 175 100 175Z" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
