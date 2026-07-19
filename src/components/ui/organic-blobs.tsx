interface OrganicBlobsProps {
  className?: string;
  variant?: "hero" | "subtle" | "accent";
}

export function OrganicBlobs({ className = "", variant = "hero" }: OrganicBlobsProps) {
  const variants = {
    hero: {
      color1: "rgba(139,92,246,0.08)",
      color2: "rgba(167,139,250,0.05)",
      color3: "rgba(245,158,11,0.04)",
    },
    subtle: {
      color1: "rgba(139,92,246,0.04)",
      color2: "rgba(167,139,250,0.03)",
      color3: "rgba(245,158,11,0.02)",
    },
    accent: {
      color1: "rgba(139,92,246,0.12)",
      color2: "rgba(167,139,250,0.08)",
      color3: "rgba(245,158,11,0.06)",
    },
  };

  const c = variants[variant];

  return (
    <svg
      className={className}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Large blob top-right */}
      <path
        d="M1000 100 C1100 50 1200 150 1150 300 C1100 450 950 400 900 300 C850 200 900 150 1000 100Z"
        fill={c.color1}
      />
      {/* Medium blob bottom-left */}
      <path
        d="M100 500 C50 550 0 650 100 700 C200 750 300 650 250 550 C200 450 150 450 100 500Z"
        fill={c.color1}
      />
      {/* Small blob center */}
      <path
        d="M500 400 C550 350 650 380 600 450 C550 520 450 500 450 450 C450 400 450 450 500 400Z"
        fill={c.color2}
      />
      {/* Tiny blob accent */}
      <path
        d="M750 550 C780 520 830 530 810 570 C790 610 730 600 740 570 C750 540 720 580 750 550Z"
        fill={c.color3}
      />
      {/* Extra large blob left */}
      <path
        d="M-50 200 C50 100 200 150 150 300 C100 450 -50 400 -50 300Z"
        fill={c.color2}
      />
      {/* Medium blob bottom-right */}
      <path
        d="M1050 550 C1150 500 1250 600 1150 700 C1050 800 950 700 1000 600 C1020 550 950 600 1050 550Z"
        fill={c.color2}
      />
    </svg>
  );
}

export function GradientMesh({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mesh1" cx="20%" cy="20%" r="60%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="mesh2" cx="80%" cy="30%" r="50%">
          <stop offset="0%" stopColor="rgba(167,139,250,0.04)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="mesh3" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="rgba(245,158,11,0.03)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#mesh1)" />
      <rect width="1200" height="800" fill="url(#mesh2)" />
      <rect width="1200" height="800" fill="url(#mesh3)" />
    </svg>
  );
}

export function LayeredWaves({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 200 C360 280 720 120 1440 220 L1440 320 L0 320Z"
        fill="rgba(139,92,246,0.04)"
      />
      <path
        d="M0 240 C360 200 720 280 1440 180 L1440 320 L0 320Z"
        fill="rgba(167,139,250,0.03)"
      />
      <path
        d="M0 280 C480 240 960 300 1440 230 L1440 320 L0 320Z"
        fill="rgba(245,158,11,0.02)"
      />
    </svg>
  );
}
