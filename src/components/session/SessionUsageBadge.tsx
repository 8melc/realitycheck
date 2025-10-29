import { useUsageStore } from '@/stores/usageStore';

interface SessionUsageBadgeProps {
  elapsedMinutes: number;
  remainingMinutes: number;
  limitMinutes: number | null;
  limitReached: boolean;
  isActive: boolean;
}

const SessionUsageBadge = ({
  elapsedMinutes,
  remainingMinutes,
  limitMinutes,
  limitReached,
  isActive,
}: SessionUsageBadgeProps) => {
  const { todayUsageMinutes } = useUsageStore();

  if (!limitMinutes) {
    return null; // Don't show badge if no limit is set
  }

  const percentage = (elapsedMinutes / limitMinutes) * 100;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  // Format time display
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}m`;
  };

  // Calculate progress for the ring
  const progress = Math.min(percentage, 100);
  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="session-badge">
      <div className="flex items-center gap-3 p-3 rounded-lg border border-realitycheck-steel bg-realitycheck-noir/80 backdrop-blur-sm">
        {/* Progress Ring */}
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="var(--realitycheck-steel)"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            {/* Progress circle */}
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke={isCritical ? 'var(--realitycheck-coral)' : isWarning ? 'var(--realitycheck-coral)' : 'var(--realitycheck-mint)'}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          {/* Warning icon */}
          {isWarning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-realitycheck-coral"
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
          )}
        </div>

        {/* Time Display */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-realitycheck-steel text-xs">Verbraucht:</span>
            <span className={`text-sm font-semibold ${
              isCritical ? 'text-realitycheck-coral' : isWarning ? 'text-realitycheck-coral' : 'text-realitycheck-mint'
            }`}>
              {formatTime(elapsedMinutes)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-realitycheck-steel text-xs">Limit:</span>
            <span className="text-realitycheck-cream text-sm font-medium">
              {formatTime(limitMinutes)}
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-end">
          {limitReached ? (
            <span className="text-realitycheck-coral text-xs font-medium">Limit erreicht</span>
          ) : isCritical ? (
            <span className="text-realitycheck-coral text-xs font-medium">Kritisch</span>
          ) : isWarning ? (
            <span className="text-realitycheck-coral text-xs font-medium">Warnung</span>
          ) : (
            <span className="text-realitycheck-mint text-xs font-medium">Aktiv</span>
          )}
          
          {!isActive && !limitReached && (
            <span className="text-realitycheck-steel text-xs">Pausiert</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionUsageBadge;
