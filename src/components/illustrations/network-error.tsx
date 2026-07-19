interface IllustrationProps {
  className?: string;
}

export function NetworkErrorIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Satellite / Antenna */}
      <rect x="95" y="30" width="10" height="35" rx="2" fill="currentColor" opacity="0.12" />
      <circle cx="100" cy="25" r="10" stroke="currentColor" strokeWidth="3" opacity="0.12" />
      <line x1="100" y1="15" x2="100" y2="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.08" />
      
      {/* Antenna dish */}
      <path d="M70 65 L100 48 L130 65" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.1" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="100" y1="48" x2="100" y2="58" stroke="currentColor" strokeWidth="2.5" opacity="0.08" />
      
      {/* Wifi waves - broken */}
      <path d="M75 85 C85 77 115 77 125 85" stroke="currentColor" strokeWidth="3" opacity="0.1" strokeLinecap="round" />
      <path d="M82 95 C90 89 110 89 118 95" stroke="currentColor" strokeWidth="2.5" opacity="0.08" strokeLinecap="round" />
      <path d="M90 105 C95 101 105 101 110 105" stroke="currentColor" strokeWidth="2" opacity="0.06" strokeLinecap="round" />
      
      {/* X mark over wifi */}
      <line x1="70" y1="82" x2="130" y2="142" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.08" />
      <line x1="130" y1="82" x2="70" y2="142" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.08" />
      
      {/* Device */}
      <rect x="82" y="150" width="36" height="24" rx="5" fill="currentColor" opacity="0.08" />
      <rect x="88" y="156" width="24" height="12" rx="2" fill="currentColor" opacity="0.04" />
      <circle cx="100" cy="174" r="2" fill="currentColor" opacity="0.08" />
      
      {/* Sad face on device */}
      <line x1="93" y1="160" x2="96" y2="162" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.1" />
      <line x1="107" y1="160" x2="104" y2="162" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.1" />
      <path d="M94 167 Q100 164 106 167" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.08" strokeLinecap="round" />
    </svg>
  );
}
