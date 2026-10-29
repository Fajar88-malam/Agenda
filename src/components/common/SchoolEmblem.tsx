/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SchoolEmblemProps {
  className?: string;
  size?: number;
  customUrl?: string;
}

export const SchoolEmblem: React.FC<SchoolEmblemProps> = ({
  className = '',
  size = 72,
  customUrl
}) => {
  if (customUrl && customUrl.trim()) {
    return (
      <img
        src={customUrl}
        alt="Logo Sekolah"
        className={`object-contain ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Official Tut Wuri Handayani / Lambang Pendidikan Nasional Vector
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Golden/Navy Crest Shield */}
      <polygon
        points="50,4 92,26 84,78 50,96 16,78 8,26"
        fill="#1e3a8a"
        stroke="#d97706"
        strokeWidth="2.5"
      />
      <polygon
        points="50,9 87,29 80,74 50,90 20,74 13,29"
        fill="#1e40af"
      />
      {/* Golden Wings / Garis Sayap Pendidikan */}
      <path
        d="M50 20 C62 20 74 30 76 45 C65 42 55 46 50 52 C45 46 35 42 24 45 C26 30 38 20 50 20 Z"
        fill="#fbbf24"
      />
      {/* Buku Terbuka (Simbol Sumber Ilmu) */}
      <path
        d="M26 62 C38 56 46 59 50 64 C54 59 62 56 74 62 L74 72 C62 66 54 69 50 74 C46 69 38 66 26 72 Z"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="1.2"
      />
      {/* Api / Obor Menyala */}
      <path
        d="M50 30 C52 35 55 38 55 42 C55 46 52 48 50 48 C48 48 45 46 45 42 C45 38 48 35 50 30 Z"
        fill="#ef4444"
      />
      <circle cx="50" cy="42" r="2.5" fill="#facc15" />
      {/* Tulisan Tut Wuri Handayani Ribbon */}
      <rect x="22" y="78" width="56" height="8" rx="2" fill="#d97706" />
      <text
        x="50"
        y="84"
        textAnchor="middle"
        fontSize="4.5"
        fontWeight="bold"
        fill="#ffffff"
        fontFamily="sans-serif"
      >
        TUT WURI HANDAYANI
      </text>
    </svg>
  );
};

export const RegionalEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 72,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lambang Perisai Segilima Daerah */}
      <polygon
        points="50,4 94,36 78,92 22,92 6,36"
        fill="#047857"
        stroke="#f59e0b"
        strokeWidth="2.5"
      />
      <polygon
        points="50,9 89,38 75,87 25,87 11,38"
        fill="#065f46"
      />
      {/* Padi & Kapas */}
      <path
        d="M26 75 C20 55 28 35 45 25 C38 40 40 60 48 72"
        stroke="#facc15"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M74 75 C80 55 72 35 55 25 C62 40 60 60 52 72"
        stroke="#ffffff"
        strokeWidth="2"
        fill="none"
      />
      {/* Bintang Ketuhanan */}
      <polygon
        points="50,22 53,30 61,30 55,35 57,43 50,38 43,43 45,35 39,30 47,30"
        fill="#facc15"
      />
      {/* Gunung & Pita Kemakmuran */}
      <path d="M30 68 L50 48 L70 68 Z" fill="#ffffff" />
      <path d="M38 68 L50 56 L62 68 Z" fill="#047857" />
      <rect x="24" y="74" width="52" height="7" rx="2" fill="#b91c1c" />
      <text
        x="50"
        y="79.5"
        textAnchor="middle"
        fontSize="4.2"
        fontWeight="bold"
        fill="#ffffff"
        fontFamily="sans-serif"
      >
        GEMAH RIPAH REPIH RAPIH
      </text>
    </svg>
  );
};

export const OfficialStamp: React.FC<{
  schoolName: string;
  kotaKab: string;
  dinas: string;
  customUrl?: string;
}> = ({ schoolName, kotaKab, dinas, customUrl }) => {
  if (customUrl && customUrl.trim()) {
    return (
      <div className="relative w-28 h-28 flex items-center justify-center select-none pointer-events-none opacity-90 rotate-[-6deg]">
        <img
          src={customUrl}
          alt="Stempel Cap Resmi"
          className="w-full h-full object-contain mix-blend-multiply drop-shadow-xs"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className="relative w-28 h-28 flex items-center justify-center select-none pointer-events-none opacity-85 rotate-[-8deg]">
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full text-indigo-900 drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Ring Double */}
        <circle cx="70" cy="70" r="66" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="70" cy="70" r="62" stroke="currentColor" strokeWidth="1" />
        
        {/* Inner Circle Double */}
        <circle cx="70" cy="70" r="41" stroke="currentColor" strokeWidth="1" />
        <circle cx="70" cy="70" r="38" stroke="currentColor" strokeWidth="2" />

        {/* Curved Path for Upper Text */}
        <path
          id="upperCurve"
          d="M 16 70 A 54 54 0 0 1 124 70"
          fill="none"
        />
        <text
          fill="currentColor"
          fontSize="9.5"
          fontWeight="800"
          letterSpacing="1.2"
          className="uppercase"
        >
          <textPath href="#upperCurve" startOffset="50%" textAnchor="middle">
            {schoolName.length > 28 ? schoolName.slice(0, 28) : schoolName}
          </textPath>
        </text>

        {/* Curved Path for Lower Text */}
        <path
          id="lowerCurve"
          d="M 124 70 A 54 54 0 0 1 16 70"
          fill="none"
        />
        <text
          fill="currentColor"
          fontSize="9.5"
          fontWeight="800"
          letterSpacing="1.2"
          className="uppercase"
        >
          <textPath href="#lowerCurve" startOffset="50%" textAnchor="middle">
            ★ {kotaKab} ★
          </textPath>
        </text>

        {/* Center Star & Text */}
        <g transform="translate(70, 70)">
          <polygon
            points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3"
            fill="currentColor"
          />
          <text
            y="11"
            textAnchor="middle"
            fill="currentColor"
            fontSize="7"
            fontWeight="700"
            letterSpacing="0.5"
          >
            DISDIK
          </text>
        </g>
      </svg>
    </div>
  );
};

export const DigitalSignature: React.FC<{ signerName: string; customUrl?: string }> = ({
  signerName,
  customUrl
}) => {
  if (customUrl && customUrl.trim()) {
    return (
      <div className="relative w-36 h-16 flex items-center justify-center select-none pointer-events-none">
        <img
          src={customUrl}
          alt={`Tanda Tangan ${signerName}`}
          className="w-full h-full object-contain mix-blend-multiply"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className="relative w-36 h-16 flex items-center justify-center select-none pointer-events-none">
      <svg
        viewBox="0 0 180 80"
        className="w-full h-full text-blue-950 opacity-90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 55 C 35 25, 45 10, 60 30 C 70 45, 80 65, 85 40 C 90 20, 110 25, 120 50 C 130 70, 140 30, 160 45"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35 48 C 50 48, 85 52, 115 48 C 135 45, 165 42, 170 44"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M75 32 C 85 15, 95 18, 92 38 C 90 55, 105 60, 125 58"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="165" cy="46" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
};
