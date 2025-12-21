'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  required: number;
  onUpgrade?: () => void;
}

/**
 * Modal that displays when user doesn't have enough credits for an action
 */
export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  balance,
  required,
  onUpgrade,
}: InsufficientCreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rc-card max-w-md w-full mx-4 motion-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-rc-cream">
            Nicht genug Credits
          </h2>
          <button
            onClick={onClose}
            className="text-rc-steel hover:text-rc-cream transition-colors"
            aria-label="Schließen"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-rc-steel">
            Du hast nicht genug Credits für diese Aktion.
          </p>

          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-rc-steel">Aktueller Stand:</span>
              <span className="font-semibold text-rc-mint">{balance} Credit{balance !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-rc-steel">Benötigt:</span>
              <span className="font-semibold text-rc-coral">{required} Credit{required !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-sm text-rc-steel">Fehlend:</span>
              <span className="font-semibold text-rc-coral">
                {required - balance} Credit{(required - balance) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <p className="text-sm text-rc-steel">
            Credits kannst du verdienen oder kaufen, um diese Aktion auszuführen.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="rc-btn rc-btn--primary flex-1"
            >
              Credits aufladen
            </button>
          )}
          <button
            onClick={onClose}
            className="rc-btn rc-btn--outline flex-1"
          >
            Später
          </button>
        </div>
      </div>
    </div>
  );
}
