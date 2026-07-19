interface IllustrationProps {
  className?: string;
}

export function SearchEmptyIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Magnifying glass */}
      <circle cx="85" cy="80" r="35" stroke="currentColor" strokeWidth="6" opacity="0.3" />
      <line x1="110" y1="105" x2="135" y2="130" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
      
      {/* Question marks */}
      <text x="75" y="170" textAnchor="middle" fill="currentColor" opacity="0.15" fontSize="40" fontWeight="bold">?</text>
      <text x="125" y="155" textAnchor="middle" fill="currentColor" opacity="0.1" fontSize="24" fontWeight="bold">?</text>
      <text x="55" y="145" textAnchor="middle" fill="currentColor" opacity="0.08" fontSize="18" fontWeight="bold">?</text>
      
      {/* Small dots */}
      <circle cx="35" cy="50" r="3" fill="currentColor" opacity="0.1" />
      <circle cx="155" cy="45" r="2" fill="currentColor" opacity="0.08" />
      <circle cx="170" cy="90" r="2.5" fill="currentColor" opacity="0.1" />
      <circle cx="25" cy="110" r="2" fill="currentColor" opacity="0.08" />
      
      {/* Search handle extension */}
      <line x1="110" y1="105" x2="130" y2="125" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.15" />
    </svg>
  );
}
