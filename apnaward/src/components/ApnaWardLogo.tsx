interface ApnaWardLogoProps {
  size?: number;
  className?: string;
}

/**
 * Minimal, scalable ApnaWard emblem:
 * Combines a civic location pin with a warm neighbourhood roofline & doorway.
 */
export function ApnaWardLogo({ size = 36, className = '' }: ApnaWardLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="apnaward-pin-grad" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="55%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      {/* Location Pin Silhouette */}
      <path
        d="M32 5C19.297 5 9 15.297 9 28c0 15.65 20.12 29.55 21.14 30.24a3.25 3.25 0 0 0 3.72 0C34.88 57.55 55 43.65 55 28 55 15.297 44.703 5 32 5Z"
        fill="url(#apnaward-pin-grad)"
      />
      {/* Neighbourhood Home Shape */}
      <path
        d="M19.5 27.2 32 17.5l12.5 9.7v11.3a2.2 2.2 0 0 1-2.2 2.2H21.7a2.2 2.2 0 0 1-2.2-2.2V27.2Z"
        fill="#FFFFFF"
      />
      {/* Community Arch / Doorway */}
      <path
        d="M28 40.7V33a4 4 0 0 1 8 0v7.7h-8Z"
        fill="#0EA5E9"
      />
    </svg>
  );
}
