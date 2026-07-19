interface IllustrationProps {
  className?: string;
}

export function ErrorStateIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Broken circle */}
      <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="4" opacity="0.12" />
      
      {/* Exclamation mark */}
      <line x1="100" y1="78" x2="100" y2="108" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.15" />
      <circle cx="100" cy="122" r="3" fill="currentColor" opacity="0.15" />
      
      {/* Crack lines */}
      <line x1="120" y1="60" x2="115" y2="75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.1" />
      <line x1="130" y1="65" x2="122" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
      <line x1="138" y1="72" x2="128" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.06" />
      
      {/* Broken piece */}
      <path
        d="M65 145 L72 138 L78 148 L85 140"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        opacity="0.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Small floating dots */}
      <circle cx="145" cy="110" r="2" fill="currentColor" opacity="0.08" />
      <circle cx="50" cy="95" r="2.5" fill="currentColor" opacity="0.08" />
      <circle cx="70" cy="55" r="1.5" fill="currentColor" opacity="0.06" />
      <circle cx="140" cy="150" r="2" fill="currentColor" opacity="0.06" />
      
      {/* Wifi disconnected */}
      <path d="M40 160 C45 155 50 155 55 160" stroke="currentColor" strokeWidth="2" opacity="0.08" strokeLinecap="round" />
      <path d="M35 153 C45 145 50 145 60 153" stroke="currentColor" strokeWidth="2" opacity="0.06" strokeLinecap="round" />
      <line x1="47" y1="165" x2="47" y2="168" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.1" />
    </svg>
  );
}
