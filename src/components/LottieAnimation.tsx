'use client';

import { useEffect, useState } from 'react';

interface LottieAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({ 
  width = 24, 
  height = 24, 
  className = '' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add CSS for heartbeat animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes heartbeat {
        0% { transform: scale(1); }
        14% { transform: scale(1.1); }
        28% { transform: scale(1); }
        42% { transform: scale(1.1); }
        70% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (!mounted) {
    return (
      <span 
        className={`inline-block ${className}`}
        style={{
          width,
          height,
          fontSize: `${height * 0.8}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ❤️
      </span>
    );
  }

  return (
    <span 
      className={`inline-block ${className}`}
      style={{
        width,
        height,
        fontSize: `${height * 0.8}px`,
        animation: 'heartbeat 1.5s ease-in-out infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      ❤️
    </span>
  );
};

export default LottieAnimation;