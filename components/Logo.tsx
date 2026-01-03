import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", variant = 'color' }) => {
  const primaryColor = variant === 'light' ? '#ffffff' : '#059669';
  const secondaryColor = variant === 'light' ? 'rgba(255,255,255,0.8)' : '#18181b';
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Outer Rings */}
      <circle cx="50" cy="50" r="48" stroke={secondaryColor} strokeWidth="1" />
      <circle cx="50" cy="50" r="45" stroke={secondaryColor} strokeWidth="4" />
      
      {/* Inner Fill for White Variant */}
      {variant === 'color' && <circle cx="50" cy="50" r="43" fill="white" />}
      
      {/* Circular Text Path */}
      <defs>
        <path id="logoTextPath" d="M 18,50 A 32,32 0 1,1 82,50" />
        <path id="logoTextPathBottom" d="M 25,65 A 30,30 0 0,0 75,65" />
      </defs>
      
      <text fill={secondaryColor} fontSize="7" fontWeight="900" letterSpacing="0.1em">
        <textPath xlinkHref="#logoTextPath" startOffset="50%" textAnchor="middle">
          MAPO SENIOR FOOTBALL CLUB
        </textPath>
      </text>

      <text fill={secondaryColor} fontSize="6" fontWeight="900" letterSpacing="0.5em">
        <textPath xlinkHref="#logoTextPathBottom" startOffset="50%" textAnchor="middle">
          SEOUL
        </textPath>
      </text>

      {/* Decorative Dividers */}
      <circle cx="15" cy="50" r="1.5" fill={primaryColor} />
      <circle cx="85" cy="50" r="1.5" fill={primaryColor} />

      {/* Center Motif - Bridge & 70 */}
      <g transform="translate(25, 30)">
        {/* Bridge Silhouette (Simplified Mapo Bridge) */}
        <path 
          d="M 5,25 L 45,25 M 10,25 L 10,15 M 20,25 L 20,10 M 30,25 L 30,10 M 40,25 L 40,15 M 5,25 Q 25,5 45,25" 
          stroke={secondaryColor} 
          strokeWidth="1.5" 
          fill="none" 
        />
        
        {/* Number 70 */}
        <text x="25" y="18" textAnchor="middle" fill={secondaryColor} fontSize="14" fontWeight="900" style={{ fontStyle: 'italic' }}>
          70
        </text>
      </g>

      {/* Soccer Ball Element at bottom */}
      <g transform="translate(38, 55)">
        <circle cx="12" cy="12" r="10" stroke={secondaryColor} strokeWidth="1.5" fill="white" />
        <path d="M 12,2 L 7,6 L 9,11 L 15,11 L 17,6 Z" fill={secondaryColor} />
        <path d="M 7,6 L 2,5" stroke={secondaryColor} strokeWidth="1" />
        <path d="M 17,6 L 22,5" stroke={secondaryColor} strokeWidth="1" />
        <path d="M 9,11 L 7,16" stroke={secondaryColor} strokeWidth="1" />
        <path d="M 15,11 L 17,16" stroke={secondaryColor} strokeWidth="1" />
        <path d="M 12,2 L 12,0" stroke={secondaryColor} strokeWidth="1" />
      </g>
    </svg>
  );
};

export default Logo;