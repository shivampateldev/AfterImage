import React, { useState } from 'react';

interface SMPLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const SMPLogo: React.FC<SMPLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const dimMap = {
    sm: 'w-24 h-12',
    md: 'w-36 h-20',
    lg: 'w-52 h-28',
    xl: 'w-72 h-40',
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {!imgError ? (
        <img
          src="/assets/branding/smp-logo.png"
          alt="SMP - 1% CHANCE. 99% FAITH."
          className={`object-contain transition-transform duration-300 ${dimMap[size]}`}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Procedural Metallic Gold Vector Fallback */
        <div className="relative flex flex-col items-center justify-center">
          <svg
            viewBox="0 0 280 90"
            className={`${dimMap[size]} filter drop-shadow-[0_0_12px_rgba(212,165,44,0.45)]`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="smpGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2A3" />
                <stop offset="35%" stopColor="#D4A52C" />
                <stop offset="70%" stopColor="#8F6415" />
                <stop offset="100%" stopColor="#F5D061" />
              </linearGradient>
              <linearGradient id="smpCircuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38D9FF" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#D4A52C" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#9875FF" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Futuristic Star & Circuit Background */}
            <path
              d="M 20 45 L 80 45 M 200 45 L 260 45 M 140 10 L 140 25 M 140 65 L 140 80"
              stroke="url(#smpCircuitGrad)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Star Emblem Accent */}
            <polygon
              points="140,4 144,14 154,16 146,23 148,33 140,27 132,33 134,23 126,16 136,14"
              fill="url(#smpGoldGrad)"
              opacity="0.85"
            />

            {/* Bold SMP Lettering */}
            <text
              x="140"
              y="58"
              textAnchor="middle"
              fill="url(#smpGoldGrad)"
              fontFamily="'Rajdhani', -apple-system, sans-serif"
              fontWeight="900"
              fontSize="48"
              letterSpacing="8"
            >
              SMP
            </text>

            {/* Subtle Silhouette node */}
            <circle cx="140" cy="22" r="3" fill="#38D9FF" opacity="0.9" />
          </svg>
        </div>
      )}

      {showTagline && (
        <div className="mt-1 flex items-center space-x-2">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#D4A52C]" />
          <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.25em] text-[#D4A52C] uppercase drop-shadow-[0_0_8px_rgba(212,165,44,0.4)]">
            1% CHANCE. 99% FAITH.
          </span>
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#D4A52C]" />
        </div>
      )}
    </div>
  );
};

