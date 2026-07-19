interface IllustrationProps {
  className?: string;
}

export function GrowthIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Ground */}
      <ellipse cx="100" cy="165" rx="60" ry="8" fill="currentColor" opacity="0.08" />
      
      {/* Seed/Stage 1 - small sprout */}
      <g opacity="0.06">
        <line x1="60" y1="155" x2="60" y2="140" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M60 140 Q56 135 53 138" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M60 140 Q64 135 67 138" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      
      {/* Stage 2 - medium plant */}
      <g opacity="0.08">
        <line x1="100" y1="162" x2="100" y2="130" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M100 130 Q94 122 88 126" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M100 130 Q106 122 112 126" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M100 140 Q95 135 92 138" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M100 140 Q105 135 108 138" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      
      {/* Stage 3 - big tree */}
      <g opacity="0.12">
        <line x1="140" y1="160" x2="140" y2="105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="140" cy="95" r="22" fill="currentColor" opacity="0.06" />
        <circle cx="140" cy="100" r="18" fill="currentColor" opacity="0.04" />
        <path d="M140 105 Q135 98 130 102" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M140 105 Q145 98 150 102" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      
      {/* Arrows connecting stages */}
      <g opacity="0.06">
        <line x1="68" y1="148" x2="88" y2="148" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M85 144 L90 148 L85 152" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        <line x1="108" y1="148" x2="128" y2="148" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M125 144 L130 148 L125 152" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      
      {/* Sun */}
      <circle cx="165" cy="40" r="12" stroke="currentColor" strokeWidth="2" opacity="0.08" />
      <g opacity="0.05">
        <line x1="165" y1="24" x2="165" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="181" y1="40" x2="185" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="175" y1="30" x2="178" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="175" y1="50" x2="178" y2="53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="155" y1="30" x2="152" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="149" y1="40" x2="145" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      
      {/* Water drops */}
      <g opacity="0.06">
        <path d="M75 45 Q77 40 79 45 L77 50 Z" fill="currentColor" />
        <path d="M60 60 Q62 55 64 60 L62 65 Z" fill="currentColor" />
      </g>
    </svg>
  );
}
