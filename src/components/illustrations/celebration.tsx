interface IllustrationProps {
  className?: string;
}

export function CelebrationIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Central star */}
      <path
        d="M100 50 L103 65 L118 68 L105 80 L108 95 L100 87 L92 95 L95 80 L82 68 L97 65 Z"
        fill="currentColor"
        opacity="0.15"
      />
      
      {/* Confetti particles */}
      <g opacity="0.1">
        <rect x="40" y="45" width="6" height="4" rx="1" fill="currentColor" transform="rotate(-20 43 47)" />
        <rect x="155" y="55" width="6" height="4" rx="1" fill="currentColor" transform="rotate(30 158 57)" />
        <rect x="50" y="90" width="5" height="5" rx="1" fill="currentColor" transform="rotate(45 52 92)" />
        <rect x="145" y="100" width="6" height="4" rx="1" fill="currentColor" transform="rotate(-35 148 102)" />
        <rect x="35" y="130" width="5" height="3" rx="1" fill="currentColor" transform="rotate(60 37 131)" />
        <rect x="160" y="140" width="5" height="5" rx="1" fill="currentColor" transform="rotate(-45 162 142)" />
        <rect x="60" y="40" width="4" height="6" rx="1" fill="currentColor" transform="rotate(15 62 43)" />
        <rect x="130" y="45" width="4" height="5" rx="1" fill="currentColor" transform="rotate(-10 132 47)" />
      </g>
      
      {/* Small sparkles */}
      <g opacity="0.08">
        <path d="M45 70 L46 73 L49 74 L46 75 L45 78 L44 75 L41 74 L44 73 Z" fill="currentColor" />
        <path d="M155 80 L156 83 L159 84 L156 85 L155 88 L154 85 L151 84 L154 83 Z" fill="currentColor" />
        <path d="M55 120 L56 122 L58 123 L56 124 L55 126 L54 124 L52 123 L54 122 Z" fill="currentColor" />
        <path d="M145 125 L146 127 L148 128 L146 129 L145 131 L144 129 L142 128 L144 127 Z" fill="currentColor" />
      </g>
      
      {/* Celebration circles */}
      <g opacity="0.04">
        <circle cx="30" cy="85" r="4" fill="currentColor" />
        <circle cx="170" cy="65" r="3" fill="currentColor" />
        <circle cx="40" cy="115" r="2.5" fill="currentColor" />
        <circle cx="160" cy="120" r="3.5" fill="currentColor" />
        <circle cx="70" cy="175" r="3" fill="currentColor" />
        <circle cx="130" cy="170" r="2" fill="currentColor" />
      </g>
      
      {/* Checkmark */}
      <circle cx="100" cy="135" r="18" stroke="currentColor" strokeWidth="3" opacity="0.12" />
      <path d="M92 135 L98 141 L109 129" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
      
      {/* Bottom decoration */}
      <path d="M70 165 Q100 155 130 165" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.06" strokeLinecap="round" />
    </svg>
  );
}
