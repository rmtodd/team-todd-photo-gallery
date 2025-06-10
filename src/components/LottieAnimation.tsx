'use client';

import { useEffect, useState } from 'react';

// Extend Window interface for dotLottie player
declare global {
  interface Window {
    customElements: CustomElementRegistry;
  }
}

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load the dotLottie player script dynamically
    const loadScript = () => {
      if (typeof window !== 'undefined' && !window.customElements.get('dotlottie-player')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';
        script.type = 'module';
        script.onload = () => setIsLoaded(true);
        script.onerror = () => {
          console.error('Failed to load dotLottie player');
          setIsLoaded(false);
        };
        document.head.appendChild(script);
      } else if (window.customElements.get('dotlottie-player')) {
        setIsLoaded(true);
      }
    };

    loadScript();
  }, []);

  if (!isLoaded) {
    // Fallback to heart emoji while loading or if script fails
    return (
      <span 
        className={`inline-block ${className}`} 
        style={{ 
          width, 
          height, 
          fontSize: `${height * 0.8}px`, 
          lineHeight: 1,
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
    <div 
      className={className} 
      style={{ width, height }}
      dangerouslySetInnerHTML={{
        __html: `<dotlottie-player 
          src="https://lottie.host/e0224a5a-c027-4ede-a84b-187b4da4b985/zBSe3reYyy.lottie" 
          background="transparent" 
          speed="1" 
          style="width: 100%; height: 100%;" 
          loop 
          autoplay>
        </dotlottie-player>`
      }}
    />
  );
};

export default LottieAnimation; 