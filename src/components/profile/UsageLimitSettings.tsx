import { useState, useEffect, useRef } from 'react';
import { useUsageStore } from '@/stores/usageStore';
import { PenSquareIcon } from './icons';

interface UsageLimitSettingsProps {
  onEdit?: () => void;
}

const UsageLimitSettings = ({ onEdit }: UsageLimitSettingsProps) => {
  const {
    dailyLimitMinutes,
    todayUsageMinutes,
    requiresReauth,
    isLoading,
    error,
    setLimit,
    fetchUsageData,
    clearError,
  } = useUsageStore();

  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const toggleRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  // Update local state when store changes
  useEffect(() => {
    if (dailyLimitMinutes !== null) {
      setIsEnabled(true);
      setSelectedMinutes(dailyLimitMinutes);
    }
  }, [dailyLimitMinutes]);

  // Generate 15-minute increment options
  const limitOptions = Array.from({ length: 32 }, (_, i) => (i + 1) * 15); // 15 to 480 minutes

  const handleToggleChange = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      setSelectedMinutes(null);
    } else if (selectedMinutes === null) {
      setSelectedMinutes(60); // Default to 1 hour
    }
  };

  const handleMinutesChange = (minutes: number) => {
    setSelectedMinutes(minutes);
    clearError();
  };

  const handleSave = async () => {
    let result = false;
    
    if (!isEnabled) {
      result = await setLimit(null);
    } else if (selectedMinutes !== null) {
      result = await setLimit(selectedMinutes);
    }

    if (result) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleReauth = () => {
    // In a real app, this would trigger logout/login flow
    window.location.href = '/login?reauth=1';
  };

  return (
    <div id="tageslimit" className="fyf-card motion-fade-up">
      <div className="flex flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="fyf-subheading mb-2">Tageslimit</h3>
            <p className="fyf-microcopy">
              Setze ein tägliches Zeitlimit für deine FYF-Nutzung. Änderungen werden erst nach erneutem Anmelden aktiv.
            </p>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit();
                toggleRef.current?.focus();
              }}
              className="fyf-btn fyf-btn--ghost inline-flex items-center gap-2"
            >
              <PenSquareIcon className="h-4 w-4" aria-hidden="true" />
              Bearbeiten
            </button>
          )}
        </header>

        {/* Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="limit-toggle"
            checked={isEnabled}
            onChange={(e) => handleToggleChange(e.target.checked)}
            disabled={isLoading || requiresReauth}
            ref={toggleRef}
            className="w-5 h-5 rounded border-2 border-fyf-mint bg-transparent text-fyf-mint focus:ring-2 focus:ring-fyf-mint focus:ring-offset-2 focus:ring-offset-fyf-noir"
          />
          <label htmlFor="limit-toggle" className="text-fyf-cream font-medium">
            Tageslimit aktivieren
          </label>
        </div>

        {/* Limit Selector */}
        {isEnabled && (
          <div className="flex flex-col gap-3">
            <label htmlFor="limit-select" className="text-fyf-cream font-medium">
              Maximale Nutzungszeit pro Tag
            </label>
            <select
              id="limit-select"
              value={selectedMinutes || ''}
              onChange={(e) => handleMinutesChange(parseInt(e.target.value))}
              disabled={isLoading || requiresReauth}
              className="w-full p-3 rounded-lg border border-fyf-steel bg-fyf-noir text-fyf-cream focus:border-fyf-mint focus:ring-2 focus:ring-fyf-mint focus:ring-offset-2 focus:ring-offset-fyf-noir"
            >
              <option value="">Wähle ein Limit</option>
              {limitOptions.map((minutes) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                const displayText = hours > 0 
                  ? `${hours} Stunde${hours > 1 ? 'n' : ''}${mins > 0 ? ` ${mins} Min` : ''}`
                  : `${minutes} Minuten`;
                return (
                  <option key={minutes} value={minutes}>
                    {displayText}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Today's Usage Display */}
        <div className="fyf-subcard">
          <div className="flex items-center justify-between">
            <span className="text-fyf-steel">Heute verbraucht:</span>
            <span className="text-fyf-mint font-semibold">
              {Math.floor(todayUsageMinutes / 60)}h {todayUsageMinutes % 60}m
            </span>
          </div>
        </div>

        {/* Reauth Warning */}
        {requiresReauth && (
          <div className="fyf-subcard fyf-subcard--accent">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-fyf-coral flex items-center justify-center">
                <span className="text-fyf-noir text-sm font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-fyf-cream font-medium mb-1">
                  Re-Anmeldung erforderlich
                </p>
                <p className="text-fyf-steel text-sm">
                  Melde dich neu an, um das Limit zu ändern.
                </p>
              </div>
              <button
                onClick={handleReauth}
                className="fyf-btn fyf-btn--outline"
              >
                Neu anmelden
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="fyf-subcard" style={{ borderColor: 'var(--fyf-coral)' }}>
            <p className="text-fyf-coral text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="fyf-subcard" style={{ borderColor: 'var(--fyf-mint)' }}>
            <p className="text-fyf-mint text-sm">
              ✓ Limit aktualisiert. Melde dich neu an, um es zu aktivieren.
            </p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isLoading || requiresReauth || (isEnabled && selectedMinutes === null)}
          className="fyf-btn fyf-btn--primary w-full"
        >
          {isLoading ? 'Speichern...' : 'Speichern'}
        </button>

        {/* Help Text */}
        <div className="text-xs text-fyf-steel">
          <p>
            • Limit wird täglich um Mitternacht zurückgesetzt<br/>
            • Änderungen werden erst nach erneutem Anmelden wirksam<br/>
            • Bei Erreichen des Limits wirst du automatisch abgemeldet
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitSettings;
