import { Profile } from '@/types/profile';
import { GaugeIcon } from './icons';

interface StatusMeterProps {
  progress: Profile['progress'];
}

const STATUS_DEFINITIONS = [
  { id: 'sparflamme', label: 'Sparflamme', min: 0, max: 2, nextThreshold: 3 },
  { id: 'warming-up', label: 'Warming Up', min: 3, max: 5, nextThreshold: 6 },
  { id: 'on-track', label: 'On Track', min: 6, max: 10, nextThreshold: 11 },
  { id: 'on-fire', label: 'On Fire', min: 11, max: Number.POSITIVE_INFINITY, nextThreshold: null },
] as const;

const getStatusDefinition = (actionCount: number) => {
  return (
    STATUS_DEFINITIONS.find((status) => actionCount >= status.min && actionCount <= status.max) ??
    STATUS_DEFINITIONS[0]
  );
};

const StatusMeter = ({ progress }: StatusMeterProps) => {
  const { actionCount } = progress;
  const status = getStatusDefinition(actionCount);

  const getStatusMessage = () => {
    if (status.nextThreshold === null) {
      return 'Halte das Tempo. Du setzt dein Ziel konsequent um.';
    }

    const remaining = status.nextThreshold - actionCount;
    if (remaining <= 0) {
      return 'Du bist kurz davor, die nächste Stufe zu knacken.';
    }

    return `Noch ${remaining} Aktion${remaining === 1 ? '' : 'en'} bis zur nächsten Stufe.`;
  };

  const progressPercentage = (() => {
    const capped = Math.min(actionCount, 12);
    return (capped / 12) * 100;
  })();

  return (
    <div className="fyf-status-meter">
      <div className="flex items-center gap-2">
        <GaugeIcon className="h-4 w-4 text-fyf-mint" />
        <span className="text-sm font-semibold uppercase tracking-wide text-fyf-mint">{status.label}</span>
      </div>
      <div
        className="fyf-status-meter__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={12}
        aria-valuenow={Math.min(actionCount, 12)}
      >
        <div className="fyf-status-meter__fill" style={{ width: `${progressPercentage}%` }} />
      </div>
      <p className="text-xs text-fyf-steel">{getStatusMessage()}</p>
    </div>
  );
};

export default StatusMeter;
