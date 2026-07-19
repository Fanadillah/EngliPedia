interface IllustrationProps {
  className?: string;
}

export function CardsEmptyIllustration({ className = "w-48 h-48" }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Card 1 - back, slightly rotated */}
      <g opacity="0.08">
        <rect x="55" y="40" width="70" height="95" rx="8" fill="currentColor" transform="rotate(-8 90 87)" />
      </g>
      
      {/* Card 2 - middle, slightly rotated */}
      <g opacity="0.12">
        <rect x="62" y="42" width="70" height="95" rx="8" fill="currentColor" transform="rotate(-3 97 89)" />
      </g>
      
      {/* Card 3 - front */}
      <rect x="65" y="40" width="70" height="95" rx="8" fill="currentColor" opacity="0.18" />
      
      {/* Card lines */}
      <rect x="78" y="55" width="44" height="4" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="78" y="65" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.06" />
      <rect x="78" y="75" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.06" />
      
      {/* Plus icon */}
      <circle cx="100" cy="165" r="12" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <line x1="100" y1="158" x2="100" y2="172" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.2" />
      <line x1="93" y1="165" x2="107" y2="165" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}
