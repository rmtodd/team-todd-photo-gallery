'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

      const data = await response.json();

      if (response.ok) {
        // Start the animation - go straight to "Team Todd ❤️"
        setShowAnimation(true);
        
        // After a brief animation, navigate
        setTimeout(() => {
          router.refresh();
          const from = searchParams.get('from');
          router.push(from ? `/${from}` : '/');
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
    if (showAnimation) {
      return 'TEAM TODD ❤️';
    }
    if (showError) {
      return '❌';
    }
    return password;
  };

  const getInputType = () => {
    if (showAnimation || showError) {
      return 'text'; // Show "TEAM TODD ❤️" or "❌" as plain text
    }
    return 'password';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-xs">
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
              showAnimation 
                ? 'text-black font-semibold border-0' 
                : showError
                ? 'text-red-500 font-semibold border-2 border-red-300'
                : 'text-gray-900 border-2 border-gray-300 focus:border-gray-300 transition-all duration-300'
            }`}
            placeholder=""
            disabled={loading || showAnimation || showError}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
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