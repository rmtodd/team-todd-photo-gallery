'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <span>❤️</span>
});

interface LottieAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

// Simple CSS animation as fallback
const HeartBeat = ({ width = 24, height = 24, className = '' }: LottieAnimationProps) => {
  return (
    <span 
      className={`inline-block ${className}`}
      style={{
        width,
        height,
        fontSize: `${height * 0.8}px`,
        animation: 'heartbeat 1.2s ease-in-out infinite'
      }}
    >
      ❤️
    </span>
  );
};

// Embedded heart animation data
const heartAnimationData = {
  "v": "5.5.7",
  "fr": 60,
  "ip": 0,
  "op": 120,
  "w": 100,
  "h": 100,
  "nm": "Heart Beat",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Heart",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 0, "k": 0 },
        "p": { "a": 0, "k": [50, 50, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": {
          "a": 1,
          "k": [
            {
              "i": { "x": [0.667], "y": [1] },
              "o": { "x": [0.333], "y": [0] },
              "t": 0,
              "s": [100, 100, 100]
            },
            {
              "i": { "x": [0.667], "y": [1] },
              "o": { "x": [0.333], "y": [0] },
              "t": 30,
              "s": [120, 120, 100]
            },
            {
              "i": { "x": [0.667], "y": [1] },
              "o": { "x": [0.333], "y": [0] },
              "t": 60,
              "s": [100, 100, 100]
            },
            {
              "i": { "x": [0.667], "y": [1] },
              "o": { "x": [0.333], "y": [0] },
              "t": 90,
              "s": [110, 110, 100]
            },
            {
              "t": 120,
              "s": [100, 100, 100]
            }
          ]
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "sh",
              "it": [
                {
                  "ind": 0,
                  "ty": "sh",
                  "ks": {
                    "a": 0,
                    "k": {
                      "i": [[0, 0], [-8.284, 0], [0, -8.284], [0, 0], [0, 0], [0, 8.284], [-8.284, 0], [0, 0]],
                      "o": [[0, -8.284], [8.284, 0], [0, 0], [0, 0], [-8.284, 0], [0, -8.284], [0, 0], [0, 0]],
                      "v": [[0, -30], [15, -45], [30, -30], [30, -15], [0, 15], [-30, -15], [-30, -30], [-15, -45]],
                      "c": true
                    }
                  }
                }
              ],
              "nm": "Path 1"
            },
            {
              "ty": "fl",
              "c": { "a": 0, "k": [1, 0.2, 0.2, 1] },
              "o": { "a": 0, "k": 100 },
              "r": 1,
              "bm": 0,
              "nm": "Fill 1"
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0] },
              "a": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [100, 100] },
              "r": { "a": 0, "k": 0 },
              "o": { "a": 0, "k": 100 },
              "sk": { "a": 0, "k": 0 },
              "sa": { "a": 0, "k": 0 },
              "nm": "Transform"
            }
          ],
          "nm": "Heart Shape",
          "bm": 0
        }
      ],
      "ip": 0,
      "op": 120,
      "st": 0,
      "bm": 0
    }
  ]
};

const LottieAnimation: React.FC<LottieAnimationProps> = ({ 
  width = 24, 
  height = 24, 
  className = '' 
}) => {
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add CSS for heartbeat animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes heartbeat {
        0% { transform: scale(1); }
        25% { transform: scale(1.1); }
        50% { transform: scale(1); }
        75% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Use CSS animation fallback if there's an error or not mounted
  if (!mounted || error) {
    return <HeartBeat width={width} height={height} className={className} />;
  }

  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        animationData={heartAnimationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
        onError={() => setError(true)}
      />
    </div>
  );
};

export default LottieAnimation;