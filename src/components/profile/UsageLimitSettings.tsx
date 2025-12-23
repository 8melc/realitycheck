import { useState, useEffect, useRef } from 'react';
import { useUsageStore } from '@/stores/usageStore';
import { PenSquareIcon } from './icons';
import { sessionTracker } from '@/lib/session-tracker';
import { createClient } from '@/lib/supabase/client';

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

  // Initialize session tracking when component mounts
  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          // User nicht eingeloggt - keine Session starten
          return;
        }

        if (mounted) {
          // Starte Session für eingeloggten User
          await sessionTracker.startSession(user.id);
          console.log('[UsageLimitSettings] Session tracking initialized');
        }
      } catch (error) {
        console.error('[UsageLimitSettings] Error initializing session:', error);
      }
    };

    // Initialisiere Session beim Mount
    initializeSession();

    // Cleanup: Beende Session beim Unmount (nur wenn diese Komponente unmountet)
    // Note: Session läuft weiter, auch wenn Komponente nicht sichtbar ist
    return () => {
      mounted = false;
      // Session wird nicht beendet, da sie global laufen soll
      // Nur beim Tab-Close oder App-Unmount wird sie beendet
    };
  }, []);

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
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <h3 className="settings-section-title" style={{ marginBottom: '0.5rem' }}>
          Tageslimit
        </h3>
        <p className="settings-section-description">
          Setze ein tägliches Zeitlimit für deine RealityCheck-Nutzung. Änderungen werden erst nach erneutem Anmelden aktiv.
        </p>
      </header>

        {/* Toggle */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="limit-toggle"
              checked={isEnabled}
              onChange={(e) => handleToggleChange(e.target.checked)}
              disabled={isLoading || requiresReauth}
              ref={toggleRef}
              className="form-checkbox"
            />
            <label htmlFor="limit-toggle" className="form-checkbox-label">
              Tageslimit aktivieren
            </label>
          </div>
        </div>

        {/* Limit Selector */}
        {isEnabled && (
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="limit-select" className="form-label">
              Maximale Nutzungszeit pro Tag
            </label>
            <select
              id="limit-select"
              value={selectedMinutes || ''}
              onChange={(e) => handleMinutesChange(parseInt(e.target.value))}
              disabled={isLoading || requiresReauth}
              className="form-select"
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
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--rc-steel, #9ca3af)' }}>Heute verbraucht:</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rc-mint, #4ecdc4)' }}>
              {Math.floor(todayUsageMinutes / 60)}h {todayUsageMinutes % 60}m
            </span>
          </div>
        </div>

        {/* Reauth Warning */}
        {requiresReauth && (
          <div style={{ 
            background: 'rgba(78, 205, 196, 0.06)',
            border: '1px solid var(--rc-mint, #4ecdc4)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: 'var(--rc-coral, #ff6b6b)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: 'var(--rc-noir, #06090b)', fontSize: '0.75rem', fontWeight: 700 }}>!</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--rc-cream, #f3efe8)', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  Re-Anmeldung erforderlich
                </p>
                <p style={{ color: 'var(--rc-steel, #9ca3af)', fontSize: '0.8125rem' }}>
                  Melde dich neu an, um das Limit zu ändern.
                </p>
              </div>
              <button
                onClick={handleReauth}
                className="btn btn-secondary"
                style={{ flexShrink: 0 }}
              >
                Neu anmelden
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="form-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="form-success" style={{ marginBottom: '1.5rem' }}>
            ✓ Limit aktualisiert. Melde dich neu an, um es zu aktivieren.
          </div>
        )}

        {/* Save Button */}
        <div className="form-actions">
          <button
            onClick={handleSave}
            disabled={isLoading || requiresReauth || (isEnabled && selectedMinutes === null)}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {isLoading ? 'Speichern...' : 'Speichern'}
          </button>
        </div>

        {/* Help Text */}
        <div className="form-hint" style={{ marginTop: '1rem' }}>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            • Limit wird täglich um Mitternacht zurückgesetzt<br/>
            • Änderungen werden erst nach erneutem Anmelden wirksam<br/>
            • Bei Erreichen des Limits wirst du automatisch abgemeldet
          </p>
        </div>
    </div>
  );
};

export default UsageLimitSettings;
