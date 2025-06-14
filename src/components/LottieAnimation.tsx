'use client';

import { useEffect, useState } from 'react';

interface LottieAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({ 
  width = 56, 
  height = 56, 
  className = '' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add CSS for checkmark animation
    const style = document.createElement('style');
    style.textContent = `
      .checkmark__circle {
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        stroke-width: 2;
        stroke-miterlimit: 10;
        stroke: #7ac142;
        fill: none;
        animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) forwards;
      }
      
      .checkmark {
        width: ${width}px;
        height: ${height}px;
        border-radius: 50%;
        display: block;
        stroke-width: 2;
        stroke: #fff;
        stroke-miterlimit: 10;
        box-shadow: inset 0px 0px 0px #7ac142;
        animation: fill .2s ease-in-out .2s forwards, scale .2s ease-in-out .5s both;
      }
      
      .checkmark__check {
        transform-origin: 50% 50%;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        animation: stroke 0.2s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
      }
      
      @keyframes stroke {
        100% {
          stroke-dashoffset: 0;
        }
      }
      
      @keyframes scale {
        0%, 100% {
          transform: none;
        }
        50% {
          transform: scale3d(1.1, 1.1, 1);
        }
      }
      
      @keyframes fill {
        100% {
          box-shadow: inset 0px 0px 0px 30px #7ac142;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [width, height]);

  if (!mounted) {
    return (
      <div 
        className={`inline-block ${className}`}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width={width} height={height} viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="25" fill="none" stroke="#7ac142" strokeWidth="2"/>
          <path fill="none" stroke="#7ac142" strokeWidth="2" d="M14,27 L22,35 L38,19"/>
        </svg>
      </div>
    );
  }

  return (
    <div 
      className={`inline-block ${className}`}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg className="checkmark" width={width} height={height} viewBox="0 0 52 52">
        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
        <path className="checkmark__check" fill="none" stroke="#fff" strokeWidth="2" d="M14,27 L22,35 L38,19"/>
      </svg>
    </div>
  );
};

export default LottieAnimation;