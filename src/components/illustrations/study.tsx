interface IllustrationProps {
  className?: string;
}

export function StudyIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Book */}
      <rect x="68" y="55" width="64" height="80" rx="4" fill="currentColor" opacity="0.08" />
      <rect x="72" y="60" width="56" height="6" rx="2" fill="currentColor" opacity="0.06" />
      <rect x="72" y="70" width="44" height="4" rx="2" fill="currentColor" opacity="0.04" />
      <rect x="72" y="78" width="48" height="4" rx="2" fill="currentColor" opacity="0.04" />
      <rect x="72" y="86" width="38" height="4" rx="2" fill="currentColor" opacity="0.04" />
      
      {/* Book spine */}
      <rect x="64" y="55" width="6" height="80" rx="3" fill="currentColor" opacity="0.12" />
      
      {/* Open pages */}
      <path d="M72 140 L68 135 L68 60 L72 55" fill="currentColor" opacity="0.04" />
      
      {/* Lightbulb */}
      <circle cx="140" cy="55" r="14" fill="currentColor" opacity="0.1" />
      <rect x="137" y="69" width="6" height="6" rx="1" fill="currentColor" opacity="0.08" />
      <rect x="136" y="75" width="8" height="3" rx="1.5" fill="currentColor" opacity="0.06" />
      
      {/* Light rays */}
      <g opacity="0.06">
        <line x1="140" y1="35" x2="140" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="155" y1="40" x2="159" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="160" y1="55" x2="165" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="155" y1="70" x2="159" y2="73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="125" y1="40" x2="121" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="120" y1="55" x2="115" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      
      {/* Sparkles */}
      <g opacity="0.08">
        <path d="M160 100 L162 105 L167 107 L162 109 L160 114 L158 109 L153 107 L158 105 Z" fill="currentColor" />
        <path d="M45 80 L46.5 83.5 L50 85 L46.5 86.5 L45 90 L43.5 86.5 L40 85 L43.5 83.5 Z" fill="currentColor" />
      </g>
      
      {/* Floating letters */}
      <text x="155" y="130" fill="currentColor" opacity="0.06" fontSize="16" fontWeight="bold">A</text>
      <text x="45" y="110" fill="currentColor" opacity="0.06" fontSize="12" fontWeight="bold">B</text>
      <text x="165" y="155" fill="currentColor" opacity="0.04" fontSize="10" fontWeight="bold">C</text>
    </svg>
  );
}
