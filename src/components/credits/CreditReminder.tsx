'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCredits } from '@/contexts/CreditContext';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DISMISS_KEY = 'credit-reminder-dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function CreditReminder() {
  const { credits } = useCredits();
  const pathname = usePathname();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if dismissed in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      const timeSinceDismiss = now - dismissedTime;
      
      // If dismissed less than 24h ago, keep dismissed
      if (timeSinceDismiss < DISMISS_DURATION) {
        setIsDismissed(true);
        return;
      } else {
        // Expired, remove from localStorage
        localStorage.removeItem(DISMISS_KEY);
      }
    }
  }, []);

  // Show/hide based on credits and pathname
  useEffect(() => {
    if (!credits) return;
    
    // Don't show on credits page
    if (pathname?.includes('/credits')) {
      setIsVisible(false);
      return;
    }
    
    // Show if should show reminder and not dismissed
    if (credits.shouldShowReminder && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [credits, isDismissed, pathname]);

  // Auto-dismiss LOW_CREDITS after 10 seconds (but not NO_CREDITS)
  useEffect(() => {
    if (!isVisible || !credits) return;
    
    if (credits.hasLowCredits && !credits.hasNoCredits) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, credits]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }
  };

  if (!isVisible || !credits) return null;

  const isNoCredits = credits.hasNoCredits;
  const isLowCredits = credits.hasLowCredits && !credits.hasNoCredits;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-transform duration-300 ease-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div
        className={`
          px-4 py-3
          ${isNoCredits ? 'bg-red-600' : 'bg-yellow-500'}
          text-white
          shadow-lg
        `}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {isNoCredits ? '⚠️' : '⏰'}
              </span>
              <p className="font-medium text-sm sm:text-base flex-1">
                {isNoCredits
                  ? 'Deine Credits sind aufgebraucht! Hole dir neue Credits, um fortzufahren.'
                  : `Nur noch ${credits.balance} Credits verfügbar. Bald aufstocken?`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/credits#purchase"
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm
                  transition-colors
                  ${isNoCredits
                    ? 'bg-white text-red-600 hover:bg-gray-100'
                    : 'bg-white text-yellow-700 hover:bg-gray-100'
                  }
                `}
                onClick={(e) => {
                  // Don't dismiss when clicking the button
                  e.stopPropagation();
                }}
              >
                {isNoCredits ? 'Credits kaufen' : 'Credits ansehen'}
              </Link>
              
              <button
                onClick={handleDismiss}
                className="
                  p-2 rounded-lg
                  hover:bg-white/20
                  transition-colors
                  flex-shrink-0
                "
                aria-label="Hinweis schließen"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

