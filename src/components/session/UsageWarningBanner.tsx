import { useState, useEffect } from 'react';

interface UsageWarningBannerProps {
  isVisible: boolean;
  percentage: number;
  remainingMinutes: number;
  onDismiss: () => void;
}

const UsageWarningBanner = ({
  isVisible,
  percentage,
  remainingMinutes,
  onDismiss,
}: UsageWarningBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isCritical = percentage >= 95;
  const isWarning = percentage >= 80;

  // Reset dismissed state when percentage changes significantly
  useEffect(() => {
    if (percentage < 75) {
      setIsDismissed(false);
    }
  }, [percentage]);

  // Handle animation
  useEffect(() => {
    if (isVisible && !isDismissed) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 220);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  if (!isVisible || isDismissed || (!isWarning && !isCritical)) {
    return null;
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} Minuten`;
  };

  return (
    <div
      className={`usage-warning-banner ${
        isAnimating ? 'animate-fade-in' : ''
      }`}
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: isCritical 
          ? 'rgba(255, 107, 107, 0.12)' 
          : 'rgba(78, 205, 196, 0.12)',
        borderColor: isCritical 
          ? 'var(--realitycheck-coral)' 
          : 'var(--realitycheck-mint)',
      }}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCritical ? 'bg-realitycheck-coral' : 'bg-realitycheck-mint'
        }`}>
          <svg
            className={`w-5 h-5 ${
              isCritical ? 'text-realitycheck-noir' : 'text-realitycheck-noir'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-semibold text-sm mb-1 ${
            isCritical ? 'text-realitycheck-coral' : 'text-realitycheck-mint'
          }`}>
            {isCritical ? 'Reality Check stoppt gleich!' : 'Zeitlimit-Warnung'}
          </h3>
          <p className="text-realitycheck-cream text-sm">
            {isCritical 
              ? `Du hast nur noch ${formatTime(remainingMinutes)} übrig.`
              : `Du hast ${formatTime(remainingMinutes)} von deinem Tageslimit übrig.`
            }
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Warnung schließen"
        >
          <svg
            className="w-5 h-5 text-realitycheck-steel"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UsageWarningBanner;
