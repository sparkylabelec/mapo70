import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
}

/**
 * "Simple Classic Soccer Ball" Logo
 * 
 * 가장 직관적이고 심플한 형태의 축구공 디자인입니다.
 * - 클래식한 축구공 패턴을 미니멀한 라인 아트로 표현했습니다.
 * - 마포70대 상비군의 신뢰감과 스포츠의 본질에 집중한 디자인입니다.
 */
const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", variant = 'color' }) => {
  const [hasError, setHasError] = useState(false);

  // 테마별 색상 설정
  const colors = {
    primary: variant === 'light' ? '#FFFFFF' : '#10b981',
    line: variant === 'light' ? 'rgba(255,255,255,0.4)' : '#059669',
    bg: variant === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.05)'
  };

  return (
    <div className={`relative group ${className} flex items-center justify-center transition-all duration-500`}>
      {/* 은은한 배경 원형 글로우 */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/5 blur-xl transition-all duration-700 pointer-events-none" />
      
      <div className="relative w-[90%] h-[90%] flex items-center justify-center transition-transform duration-700 group-hover:rotate-[20deg] group-hover:scale-110">
        {!hasError ? (
          <img 
            src="/logomapo.png" 
            alt="MAPO7 Soccer" 
            className={`w-full h-full object-contain ${variant === 'light' ? 'brightness-0 invert' : ''}`}
            onError={() => setHasError(true)}
          />
        ) : (
          /* 심플한 클래식 축구공 SVG */
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* 구체 베이스 */}
            <circle 
              cx="50" cy="50" r="45" 
              stroke={colors.primary} 
              strokeWidth="4" 
              fill={colors.bg}
            />

            {/* 축구공 패턴 (육각형 조각들) */}
            <g stroke={colors.primary} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
              {/* 중앙 조각 */}
              <path d="M50 32L65 42V58L50 68L35 58V42L50 32Z" fill={colors.primary} />
              
              {/* 연결선들 */}
              <path d="M50 32V10" />
              <path d="M65 42L85 35" />
              <path d="M65 58L85 65" />
              <path d="M50 68V90" />
              <path d="M35 58L15 65" />
              <path d="M35 42L15 35" />

              {/* 주변 조각 경계선 (옵션) */}
              <path d="M85 35L95 50L85 65" strokeOpacity="0.5" />
              <path d="M15 35L5 50L15 65" strokeOpacity="0.5" />
              <path d="M35 15L50 10L65 15" strokeOpacity="0.5" />
              <path d="M35 85L50 90L65 85" strokeOpacity="0.5" />
            </g>
            
            {/* 장식적 디테일 (빛 반사 느낌) */}
            <path 
              d="M30 25C35 20 45 20 50 25" 
              stroke={variant === 'light' ? '#FFFFFF' : '#34d399'} 
              strokeWidth="2" 
              strokeLinecap="round" 
              className="opacity-40"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default Logo;