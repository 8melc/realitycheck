'use client';

import { useState, useEffect } from 'react';

type NudgeType = 'session_limit' | 'goal_drift' | 'daily_checkin';

interface Nudge {
  id: string;
  type: NudgeType;
  message: string;
  cta: string;
  dismissible: boolean;
}

interface NudgePopupProps {
  onDismiss?: (action: string) => void;
}

export default function NudgePopup({ onDismiss }: NudgePopupProps) {
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // Check for nudges on mount and periodically
  useEffect(() => {
    const checkNudges = async () => {
      try {
        const response = await fetch('/api/nudges/check');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data.shouldNudge && data.nudge) {
          setNudge(data.nudge);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('[NudgePopup] Error checking nudges:', error);
      }
    };

    // Check immediately
    checkNudges();

    // Check every 5 minutes
    const interval = setInterval(checkNudges, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (action: string) => {
    if (!nudge || isDismissing) return;

    setIsDismissing(true);

    try {
      const response = await fetch('/api/nudges/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nudge_id: nudge.id,
          action,
        }),
      });

      if (response.ok) {
        setIsVisible(false);
        setNudge(null);
        if (onDismiss) {
          onDismiss(action);
        }
      }
    } catch (error) {
      console.error('[NudgePopup] Error dismissing nudge:', error);
    } finally {
      setIsDismissing(false);
    }
  };

  if (!isVisible || !nudge) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 w-96 bg-gray-900 border border-cyan-500 rounded-lg p-4 shadow-2xl z-50 animate-slide-up"
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Header with Icon */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">🎯</div>
        <div className="text-sm text-gray-400 uppercase tracking-wide">
          Reality Check
        </div>
      </div>

      {/* Message (AI-generated) */}
      <p className="text-white mb-4 text-sm leading-relaxed">{nudge.message}</p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleDismiss('dismissed')}
          disabled={isDismissing}
          className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {nudge.cta}
        </button>
        <button
          onClick={() => handleDismiss('halt_die_fresse')}
          disabled={isDismissing}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="24h stumm schalten"
        >
          🔇
        </button>
      </div>

      {/* Transparency */}
      <button
        onClick={() => {
          // TODO: Show explanation modal
          alert(
            'Nudges helfen dir, bewusster mit deiner Zeit umzugehen. Sie erscheinen basierend auf deinem Nutzungsverhalten und deinen Zielen.'
          );
        }}
        className="text-xs text-gray-500 mt-3 hover:text-cyan-400 transition-colors"
      >
        Warum sehe ich das?
      </button>
    </div>
  );
}


