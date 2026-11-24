/**
 * Editorial SVG visual scenes for ApnaWard showcasing welcoming Indian
 * neighbourhood streets, community participation, and civic infrastructure.
 * Used reliably offline/sandboxed with zero broken external image dependencies.
 */

export function NeighbourhoodHeroScene({
  caption,
  badgeText,
}: {
  caption: string;
  badgeText: string;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-sky-50 via-white to-slate-50 shadow-sm h-full flex flex-col justify-between">
      <div className="relative flex-1 min-h-[260px] sm:min-h-[320px] overflow-hidden">
        <svg
          viewBox="0 0 640 420"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={caption}
        >
          <defs>
            <linearGradient id="sky-morning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="55%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>
            <linearGradient id="sun-glow" cx="78%" cy="22%" r="28%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Morning Sky */}
          <rect width="640" height="420" fill="url(#sky-morning)" />
          <circle cx="505" cy="88" r="92" fill="url(#sun-glow)" />
          <circle cx="505" cy="88" r="28" fill="#FDE047" fillOpacity="0.85" />

          {/* Distant City Apartments & Terraces */}
          <rect x="28" y="132" width="110" height="178" rx="6" fill="#E2E8F0" />
          <rect x="44" y="152" width="22" height="24" rx="3" fill="#93C5FD" />
          <rect x="78" y="152" width="22" height="24" rx="3" fill="#93C5FD" />
          <rect x="44" y="190" width="22" height="24" rx="3" fill="#BAE6FD" />
          <rect x="78" y="190" width="22" height="24" rx="3" fill="#BAE6FD" />
          <rect x="34" y="124" width="98" height="8" rx="3" fill="#94A3B8" />

          {/* Warm Terracotta-Tinted Neighbourhood Homes & Shops */}
          <rect x="150" y="154" width="142" height="156" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M144 156 L221 112 L298 156 Z" fill="#1D4ED8" />
          <rect x="168" y="176" width="38" height="30" rx="4" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.5" />
          <rect x="234" y="176" width="38" height="30" rx="4" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.5" />
          {/* Shop awning */}
          <path d="M158 242 L284 242 L290 258 L152 258 Z" fill="#0EA5E9" />
          <rect x="172" y="258" width="44" height="52" rx="3" fill="#0B1B36" />
          <rect x="230" y="264" width="38" height="28" rx="4" fill="#BAE6FD" />

          {/* Right Side Neighbourhood Apartment Block */}
          <rect x="366" y="116" width="154" height="194" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="360" y="108" width="166" height="10" rx="4" fill="#0B1B36" />
          <rect x="386" y="138" width="44" height="28" rx="4" fill="#DBEAFE" />
          <rect x="454" y="138" width="44" height="28" rx="4" fill="#DBEAFE" />
          <rect x="386" y="182" width="44" height="28" rx="4" fill="#E0F2FE" />
          <rect x="454" y="182" width="44" height="28" rx="4" fill="#E0F2FE" />
          {/* Balconies */}
          <line x1="382" y1="210" x2="434" y2="210" stroke="#1E3A8A" strokeWidth="3" />
          <line x1="450" y1="210" x2="502" y2="210" stroke="#1E3A8A" strokeWidth="3" />
          <rect x="424" y="246" width="38" height="64" rx="4" fill="#1D4ED8" />

          {/* Green Avenue Trees */}
          <rect x="326" y="220" width="10" height="90" rx="4" fill="#78350F" />
          <circle cx="331" cy="196" r="34" fill="#10B981" />
          <circle cx="312" cy="208" r="24" fill="#059669" />
          <circle cx="350" cy="206" r="24" fill="#34D399" />

          <rect x="556" y="226" width="10" height="84" rx="4" fill="#78350F" />
          <circle cx="561" cy="202" r="32" fill="#059669" />
          <circle cx="582" cy="214" r="22" fill="#10B981" />

          {/* Municipal Streetlight */}
          <path d="M124 310 L124 148 Q124 134 138 134 L162 134" stroke="#334155" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="162" cy="137" rx="10" ry="4" fill="#FBBF24" />

          {/* Clean Sidewalk & Road */}
          <rect x="0" y="308" width="640" height="28" fill="#E2E8F0" />
          <line x1="0" y1="308" x2="640" y2="308" stroke="#94A3B8" strokeWidth="2" />
          <rect x="0" y="336" width="640" height="84" fill="#1E293B" />
          {/* Crosswalk Stripes */}
          <rect x="260" y="346" width="24" height="62" rx="2" fill="#F8FAFC" fillOpacity="0.9" />
          <rect x="300" y="346" width="24" height="62" rx="2" fill="#F8FAFC" fillOpacity="0.9" />
          <rect x="340" y="346" width="24" height="62" rx="2" fill="#F8FAFC" fillOpacity="0.9" />

          {/* Friendly Residents Walking & Discussing */}
          {/* Person 1 */}
          <circle cx="204" cy="272" r="10" fill="#92400E" />
          <path d="M190 290 C190 282 218 282 218 290 L220 326 L188 326 Z" fill="#0EA5E9" />
          <rect x="195" y="326" width="7" height="22" rx="3" fill="#0F172A" />
          <rect x="206" y="326" width="7" height="22" rx="3" fill="#0F172A" />

          {/* Person 2 */}
          <circle cx="242" cy="275" r="9.5" fill="#78350F" />
          <path d="M229 292 C229 284 255 284 255 292 L256 326 L228 326 Z" fill="#F59E0B" />
          <rect x="233" y="326" width="6.5" height="21" rx="3" fill="#1E293B" />
          <rect x="244" y="326" width="6.5" height="21" rx="3" fill="#1E293B" />

          {/* Subtle ApnaWard Pin Marker Highlight over Street Corner */}
          <g transform="translate(476, 266)">
            <circle cx="0" cy="0" r="24" fill="#06B6D4" fillOpacity="0.22" />
            <path d="M0 -20c-8.8 0-16 7.2-16 16 0 10.6 14 20 14.8 20.5a2 2 0 0 0 2.4 0C2 16 16 6.6 16 -4c0-8.8-7.2-16-16-16Z" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="0" cy="-4" r="5" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-700 truncate">{caption}</p>
        <span className="text-[11px] font-mono font-semibold text-blue-700 whitespace-nowrap shrink-0">
          {badgeText}
        </span>
      </div>
    </div>
  );
}

export function CommunityParticipationVisual({ label }: { label: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
      <svg viewBox="0 0 360 190" className="w-full h-44" role="img" aria-label={label}>
        {/* Soft Park Backdrop */}
        <rect width="360" height="190" rx="14" fill="#F0F9FF" />
        <path d="M0 140 Q90 120 180 135 T360 128 L360 190 L0 190 Z" fill="#D1FAE5" />
        <rect x="0" y="148" width="360" height="42" fill="#E2E8F0" />

        {/* Neighbourhood Tree */}
        <rect x="38" y="88" width="8" height="62" rx="3" fill="#78350F" />
        <circle cx="42" cy="70" r="26" fill="#10B981" />
        <circle cx="58" cy="80" r="18" fill="#059669" />

        {/* Three Neighbours Collaborating */}
        {/* Resident 1 holding smartphone report */}
        <circle cx="132" cy="82" r="13" fill="#92400E" />
        <path d="M112 104 C112 94 152 94 152 104 L154 148 L110 148 Z" fill="#1D4ED8" />
        <rect x="148" y="108" width="16" height="24" rx="3" fill="#0B1B36" stroke="#FFFFFF" strokeWidth="1.5" />
        <rect x="151" y="112" width="10" height="12" rx="1.5" fill="#38BDF8" />

        {/* Resident 2 pointing / discussing */}
        <circle cx="192" cy="78" r="13" fill="#78350F" />
        <path d="M172 100 C172 90 212 90 212 100 L214 148 L170 148 Z" fill="#0EA5E9" />

        {/* Resident 3 with clipboard */}
        <circle cx="252" cy="84" r="12.5" fill="#B45309" />
        <path d="M233 105 C233 95 271 95 271 105 L273 148 L231 148 Z" fill="#059669" />

        {/* Checkmark speech bubble */}
        <rect x="274" y="34" width="62" height="36" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="293" cy="52" r="10" fill="#DCFCE7" />
        <path d="M288 52 L292 56 L299 48" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="309" y="47" width="18" height="4" rx="2" fill="#94A3B8" />
        <rect x="309" y="54" width="13" height="3.5" rx="1.75" fill="#CBD5E1" />
      </svg>
    </div>
  );
}
