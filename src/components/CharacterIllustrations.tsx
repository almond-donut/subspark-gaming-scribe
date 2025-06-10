
import React from 'react';

interface CharacterIllustrationsProps {
  className?: string;
}

const CharacterIllustrations: React.FC<CharacterIllustrationsProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Gamer Character */}
      <div className="absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 opacity-20 lg:opacity-30 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-float">
          {/* Gamer with headphones */}
          <circle cx="100" cy="80" r="30" fill="#4F46E5" opacity="0.8" />
          <rect x="85" y="50" width="30" height="10" rx="5" fill="#1F2937" />
          <circle cx="92" cy="75" r="2" fill="#FFFFFF" />
          <circle cx="108" cy="75" r="2" fill="#FFFFFF" />
          <path d="M90 85 Q100 90 110 85" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          
          {/* Headphones */}
          <rect x="70" y="65" width="12" height="20" rx="6" fill="#1F2937" />
          <rect x="118" y="65" width="12" height="20" rx="6" fill="#1F2937" />
          <path d="M82 65 Q100 45 118 65" stroke="#1F2937" strokeWidth="4" fill="none" />
          
          {/* Body */}
          <rect x="85" y="110" width="30" height="50" rx="15" fill="#4F46E5" opacity="0.6" />
          
          {/* Arms in excited pose */}
          <rect x="60" y="120" width="20" height="8" rx="4" fill="#4F46E5" opacity="0.6" transform="rotate(-20 70 124)" />
          <rect x="120" y="120" width="20" height="8" rx="4" fill="#4F46E5" opacity="0.6" transform="rotate(20 130 124)" />
          
          {/* Gaming controller */}
          <rect x="95" y="140" width="10" height="6" rx="2" fill="#1F2937" />
        </svg>
      </div>

      {/* Female Vlogger */}
      <div className="absolute bottom-0 left-0 w-28 h-28 lg:w-40 lg:h-40 opacity-20 lg:opacity-30 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-float" style={{ animationDelay: '1s' }}>
          {/* Female vlogger */}
          <circle cx="100" cy="80" r="30" fill="#EC4899" opacity="0.8" />
          <path d="M85 60 Q100 50 115 60 Q110 65 100 65 Q90 65 85 60" fill="#8B5CF6" />
          <circle cx="92" cy="75" r="2" fill="#FFFFFF" />
          <circle cx="108" cy="75" r="2" fill="#FFFFFF" />
          <path d="M90 85 Q100 90 110 85" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          
          {/* Body */}
          <rect x="85" y="110" width="30" height="50" rx="15" fill="#EC4899" opacity="0.6" />
          
          {/* Arms */}
          <rect x="65" y="125" width="15" height="8" rx="4" fill="#EC4899" opacity="0.6" />
          <rect x="120" y="125" width="15" height="8" rx="4" fill="#EC4899" opacity="0.6" />
          
          {/* Camera/phone */}
          <rect x="60" y="120" width="8" height="6" rx="1" fill="#1F2937" />
          <circle cx="64" cy="123" r="1" fill="#EF4444" />
        </svg>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-6 h-6 opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute top-3/4 right-1/4 w-4 h-4 opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};

export default CharacterIllustrations;
