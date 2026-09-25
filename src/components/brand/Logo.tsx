// Original KuyayPet logo: a dog and a cat peeking over a sign; the "A" of Kuyay is a paw print.

interface LogoProps {
  className?: string;
  withTagline?: boolean;
}

export function PawIcon({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill={color}>
        <ellipse cx="16" cy="21" rx="7" ry="6" />
        <ellipse cx="7" cy="13.5" rx="3" ry="3.8" />
        <ellipse cx="25" cy="13.5" rx="3" ry="3.8" />
        <ellipse cx="11.5" cy="7.5" rx="3" ry="3.8" />
        <ellipse cx="20.5" cy="7.5" rx="3" ry="3.8" />
      </g>
    </svg>
  );
}

export function LogoMark({ className = '' }: { className?: string }) {
  const ink = '#4A2E22';
  return (
    <svg viewBox="0 0 200 120" className={className} role="img" aria-label="KuyayPet">
      {/* dog */}
      <g stroke={ink} strokeWidth="3" strokeLinejoin="round">
        <ellipse cx="78" cy="58" rx="30" ry="28" fill="#F4D3A6" />
        <path d="M52 40c-12 2-18 18-12 34 3 7 10 6 12 0l4-24z" fill="#8A5A3C" />
        <path d="M104 40c12 2 18 18 12 34-3 7-10 6-12 0l-4-24z" fill="#8A5A3C" />
        <ellipse cx="80" cy="70" rx="14" ry="10" fill="#FFF3E2" />
      </g>
      <circle cx="68" cy="56" r="3.6" fill={ink} />
      <circle cx="90" cy="56" r="3.6" fill={ink} />
      <circle cx="69.2" cy="54.8" r="1.1" fill="#fff" />
      <circle cx="91.2" cy="54.8" r="1.1" fill="#fff" />
      <ellipse cx="80" cy="66" rx="5" ry="3.6" fill={ink} />
      <path d="M74 71q6 5 12 0" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M78 73q2 9 6 0" fill="#E4555F" stroke={ink} strokeWidth="2" />
      {/* cat */}
      <g stroke={ink} strokeWidth="3" strokeLinejoin="round">
        <path d="M118 44l-4-24 18 12z" fill="#E9A23B" />
        <path d="M162 44l4-24-18 12z" fill="#E9A23B" />
        <ellipse cx="140" cy="60" rx="26" ry="23" fill="#F1B868" />
      </g>
      <path d="M121 30l2 9 6-4z M159 30l-2 9-6-4z" fill="#F8E1D8" />
      <path d="M128 58q4-4 8 0 M144 58q4-4 8 0" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M137 65l3 3 3-3z" fill="#E4555F" stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M140 68q-3 4-6 2 M140 68q3 4 6 2" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M118 64h-12 M118 68l-11 3 M162 64h12 M162 68l11 3" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="129" cy="66" rx="3.5" ry="2" fill="#E4555F" opacity=".35" />
      <ellipse cx="151" cy="66" rx="3.5" ry="2" fill="#E4555F" opacity=".35" />
      {/* heart */}
      <path d="M112 16c-4-3-7-5-7-8a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1c0 3-3 5-7 8z" fill="#E4555F" />
      {/* sign board */}
      <rect x="14" y="80" width="172" height="36" rx="18" fill="#FFF8EE" stroke={ink} strokeWidth="3" />
      {/* paws over the board */}
      <g fill="#F4D3A6" stroke={ink} strokeWidth="2.5">
        <ellipse cx="62" cy="82" rx="9" ry="6" />
        <ellipse cx="94" cy="82" rx="9" ry="6" />
      </g>
      <g fill="#F1B868" stroke={ink} strokeWidth="2.5">
        <ellipse cx="127" cy="82" rx="8" ry="5.5" />
        <ellipse cx="153" cy="82" rx="8" ry="5.5" />
      </g>
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fontFamily="'Baloo 2', system-ui, sans-serif"
        fontWeight="800"
        fontSize="26"
        fill={ink}
        letterSpacing="1"
      >
        <tspan>KUY</tspan>
        <tspan fill="transparent">A</tspan>
        <tspan>Y</tspan>
        <tspan fill="#B5553A">PET</tspan>
      </text>
      {/* paw replacing the "A" */}
      <g transform="translate(85 88.5) scale(0.62)">
        <g fill="#B5553A">
          <ellipse cx="16" cy="21" rx="7" ry="6" />
          <ellipse cx="7" cy="13.5" rx="3" ry="3.8" />
          <ellipse cx="25" cy="13.5" rx="3" ry="3.8" />
          <ellipse cx="11.5" cy="7.5" rx="3" ry="3.8" />
          <ellipse cx="20.5" cy="7.5" rx="3" ry="3.8" />
        </g>
      </g>
    </svg>
  );
}

export function Logo({ className = '', withTagline = true }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <LogoMark className="w-full" />
      {withTagline && (
        <p className="mt-1 flex items-center gap-1.5 font-display text-sm font-semibold text-cocoa-700">
          <span className="text-coral">♥</span> Conecta · Comparte · Socializa <span className="text-coral">♥</span>
        </p>
      )}
    </div>
  );
}
