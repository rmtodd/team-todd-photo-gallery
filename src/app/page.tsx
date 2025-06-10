'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LottieAnimation from '@/components/LottieAnimation';

// Force dynamic rendering to prevent caching issues with middleware authentication
export const dynamic = 'force-dynamic';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Start the animation - go straight to "Team Todd ❤️"
        setShowAnimation(true);
        
        // After a brief animation, navigate to gallery
        setTimeout(() => {
          const from = searchParams.get('from');
          // Use window.location for a full page reload to ensure cookies are read
          window.location.href = from === 'upload' ? '/upload' : '/gallery';
        }, 1500); // 1.5 seconds total
      } else {
        setLoading(false);
        // Show error animation
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
          setPassword('');
          // Refocus the input after clearing with a small delay to ensure it works
          setTimeout(() => {
            const input = document.querySelector('input');
            if (input) {
              input.focus();
              input.click(); // Ensure cursor is visible and blinking
            }
          }, 50);
        }, 500); // Show error for 0.5 seconds
      }
    } catch {
      setLoading(false);
      // Show error animation
      setShowError(true);
             setTimeout(() => {
         setShowError(false);
         setPassword('');
         // Refocus the input after clearing with a small delay to ensure it works
         setTimeout(() => {
           const input = document.querySelector('input');
           if (input) {
             input.focus();
             input.click(); // Ensure cursor is visible and blinking
           }
         }, 50);
       }, 500); // Show error for 0.5 seconds
    }
  };

  const getDisplayText = () => {
    if (showError) {
      return '❌';
    }
    return password;
  };

  const getInputType = () => {
    if (showAnimation || showError) {
      return 'text'; // Show animation or "❌" as plain text
    }
    return 'password';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-xs">
        {showAnimation ? (
          <div className="flex items-center justify-center space-x-2">
            <span className="text-base font-mono font-semibold text-black">TEAM TODD</span>
            <LottieAnimation width={24} height={24} />
          </div>
        ) : (
            <form onSubmit={handleSubmit}>
              <input
                type={getInputType()}
                value={getDisplayText()}
                onChange={(e) => {
                  if (!showAnimation && !showError) {
                    setPassword(e.target.value);
                  }
                }}
                className={`w-full px-3 py-2 text-base focus:outline-none text-center font-mono ${
                  showError
                    ? 'text-red-500 font-semibold border-2 border-red-300'
                    : 'text-gray-900 border-2 border-gray-300 focus:border-gray-300 transition-all duration-300'
                }`}
                placeholder=""
                disabled={loading || showAnimation || showError}
                autoFocus
              />
            </form>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
