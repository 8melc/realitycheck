'use client';

interface UsageBadgeProps {
  todayUsageMinutes: number;
  dailyLimitMinutes: number | null;
  limitReached: boolean;
  className?: string;
}

/**
 * UsageBadge - Zeigt die heutige Nutzungszeit und Limit-Status
 * 
 * Props:
 * - todayUsageMinutes: Verbrauchte Minuten heute
 * - dailyLimitMinutes: Tageslimit in Minuten (null = kein Limit)
 * - limitReached: Ob das Limit erreicht wurde
 */
export default function UsageBadge({
  todayUsageMinutes,
  dailyLimitMinutes,
  limitReached,
  className = '',
}: UsageBadgeProps) {
  // Format: "X / Y Min" oder nur "X Min" wenn kein Limit
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins} Min`;
    }
    return `${mins} Min`;
  };

  // Berechne Prozent für Warnung (> 80%)
  const percentage = dailyLimitMinutes 
    ? (todayUsageMinutes / dailyLimitMinutes) * 100 
    : 0;

  // Bestimme Farbe/Style basierend auf Status
  const getStatusStyle = () => {
    if (limitReached) {
      return {
        textColor: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        label: 'LIMIT ERREICHT',
      };
    }
    if (dailyLimitMinutes && percentage >= 80) {
      return {
        textColor: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        label: 'WARNUNG',
      };
    }
    return {
      textColor: 'text-rc-mint',
      bgColor: 'bg-rc-mint/10',
      borderColor: 'border-rc-mint/30',
      label: 'HEUTE',
    };
  };

  const status = getStatusStyle();

  // Wenn kein Limit gesetzt, zeige nur die Zeit
  if (!dailyLimitMinutes) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bgColor} ${status.borderColor} border ${className}`}>
        <span className={`text-sm font-medium ${status.textColor}`}>
          HEUTE: {formatTime(todayUsageMinutes)}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bgColor} ${status.borderColor} border ${className}`}>
      <span className={`text-xs font-semibold uppercase tracking-wide ${status.textColor}`}>
        {status.label}
      </span>
      <span className={`text-sm font-medium ${status.textColor}`}>
        {formatTime(todayUsageMinutes)} / {formatTime(dailyLimitMinutes)}
      </span>
      {limitReached && (
        <span className="text-xs text-red-500 font-bold">⚠️</span>
      )}
    </div>
  );
}
