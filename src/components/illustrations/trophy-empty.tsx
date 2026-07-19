interface IllustrationProps {
  className?: string;
}

export function TrophyEmptyIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Trophy cup */}
      <path
        d="M75 55 C65 55 60 60 60 70 C60 85 68 90 75 92"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.15"
        strokeLinecap="round"
      />
      <path
        d="M125 55 C135 55 140 60 140 70 C140 85 132 90 125 92"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.15"
        strokeLinecap="round"
      />
      <path
        d="M75 92 L100 95 L125 92"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Trophy bowl */}
      <path
        d="M72 70 L100 95 L128 70"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Trophy stem */}
      <line x1="100" y1="95" x2="100" y2="115" stroke="currentColor" strokeWidth="4" opacity="0.12" />
      
      {/* Trophy base */}
      <rect x="85" y="115" width="30" height="5" rx="2.5" fill="currentColor" opacity="0.12" />
      <rect x="90" y="120" width="20" height="4" rx="2" fill="currentColor" opacity="0.08" />
      
      {/* Trophy handles */}
      <path d="M60 70 C50 72 48 82 58 85" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.08" strokeLinecap="round" />
      <path d="M140 70 C150 72 152 82 142 85" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.08" strokeLinecap="round" />
      
      {/* Star */}
      <path
        d="M100 138 L103 145 L110 146 L105 151 L107 158 L100 154 L93 158 L95 151 L90 146 L97 145 Z"
        fill="currentColor"
        opacity="0.1"
      />
      
      {/* Lock */}
      <rect x="90" y="155" width="20" height="16" rx="3" fill="currentColor" opacity="0.08" />
      <path d="M95 155 V148 C95 145 97 143 100 143 C103 143 105 145 105 148 V155" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.08" />
      <circle cx="100" cy="160" r="2" fill="currentColor" opacity="0.08" />
    </svg>
  );
}
