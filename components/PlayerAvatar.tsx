import React, { useMemo } from 'react';

interface PlayerAvatarProps {
  seed: number;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e',
  '#0ea5e9', '#d97706', '#be185d'
];

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ seed, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const { bgColor, eyes, mouth, accessory } = useMemo(() => {
    // Simple pseudo-random number generator
    let s = seed;
    const rand = () => {
      const x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };

    const bgColor = COLORS[Math.floor(rand() * COLORS.length)];
    const eyes = Math.floor(rand() * 4); 
    const mouth = Math.floor(rand() * 4);
    const accessory = Math.floor(rand() * 4); // 0: none, 1: glasses, 2: blush, 3: stubble

    return { bgColor, eyes, mouth, accessory };
  }, [seed]);

  return (
    <div 
      className={`rounded-full overflow-hidden flex-shrink-0 relative shadow-inner border border-black/10 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
       <svg viewBox="0 0 100 100" className="w-full h-full text-white/90 transform transition-transform hover:scale-105 duration-300">
          {/* Base Head Shape (implied by circle container) */}
          
          {/* Eyes */}
          <g transform="translate(0, 5)">
            {eyes === 0 && (
                <g>
                <circle cx="35" cy="40" r="5" fill="currentColor" />
                <circle cx="65" cy="40" r="5" fill="currentColor" />
                </g>
            )}
            {eyes === 1 && (
                <g>
                <rect x="30" y="38" width="10" height="4" rx="2" fill="currentColor" />
                <rect x="60" y="38" width="10" height="4" rx="2" fill="currentColor" />
                </g>
            )}
            {eyes === 2 && (
                <g>
                <path d="M 30 42 Q 35 35 40 42" stroke="currentColor" strokeWidth="3" fill="none" />
                <path d="M 60 42 Q 65 35 70 42" stroke="currentColor" strokeWidth="3" fill="none" />
                </g>
            )}
            {eyes === 3 && (
                <g>
                <circle cx="35" cy="40" r="3" fill="currentColor" />
                <circle cx="65" cy="40" r="6" fill="currentColor" />
                </g>
            )}
          </g>

          {/* Accessory - Glasses */}
          {accessory === 1 && (
            <g transform="translate(0, 5)" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8">
               <circle cx="35" cy="40" r="11" />
               <line x1="46" y1="40" x2="54" y2="40" />
               <circle cx="65" cy="40" r="11" />
            </g>
          )}

          {/* Mouth */}
          <g transform="translate(0, 5)">
            {mouth === 0 && (
                <path d="M 35 70 Q 50 80 65 70" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            {mouth === 1 && (
                <rect x="42" y="70" width="16" height="4" rx="2" fill="currentColor" />
            )}
            {mouth === 2 && (
                <circle cx="50" cy="72" r="5" fill="currentColor" />
            )}
            {mouth === 3 && (
                <path d="M 35 75 Q 50 65 65 75" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
          </g>

          {/* Accessory - Blush */}
          {accessory === 2 && (
             <g fill="white" opacity="0.3">
               <circle cx="25" cy="55" r="4" />
               <circle cx="75" cy="55" r="4" />
             </g>
          )}
          
          {/* Accessory - Stubble */}
          {accessory === 3 && (
             <g fill="currentColor" opacity="0.2">
                 <circle cx="50" cy="85" r="1" />
                 <circle cx="45" cy="83" r="1" />
                 <circle cx="55" cy="83" r="1" />
                 <circle cx="40" cy="80" r="1" />
                 <circle cx="60" cy="80" r="1" />
             </g>
          )}
       </svg>
       {/* Initials overlay for quick ID */}
       <div className="absolute inset-0 flex items-center justify-center text-white/30 font-black text-[50%] select-none pointer-events-none uppercase mix-blend-overlay">
          {name.substring(0, 1)}
       </div>
    </div>
  );
};