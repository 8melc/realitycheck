'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CreditToastProps {
  cost: number;
  newBalance: number;
  message?: string;
  onClose: () => void;
  duration?: number; // milliseconds
}

/**
 * Toast notification for successful credit deduction
 * Auto-dismisses after duration (default 4 seconds)
 */
export default function CreditToast({
  cost,
  newBalance,
  message,
  onClose,
  duration = 4000,
}: CreditToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 motion-fade-up">
      <div className="rc-card bg-rc-mint/10 border border-rc-mint/30 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <CheckCircleIcon className="h-5 w-5 text-rc-mint" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-rc-cream font-medium">
              {message || `FYF hat für diese Aktion ${cost} Credit${cost !== 1 ? 's' : ''} genutzt.`}
            </p>
            <p className="text-xs text-rc-steel mt-1">
              Neuer Stand: <span className="font-semibold text-rc-mint">{newBalance} Credits</span>
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-rc-steel hover:text-rc-cream transition-colors"
            aria-label="Schließen"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


