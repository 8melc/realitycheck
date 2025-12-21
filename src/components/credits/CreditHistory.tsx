'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

interface CreditHistoryEntry {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  meta: Record<string, any> | null;
  created_at: string;
}

interface CreditHistoryProps {
  userId?: string;
  limit?: number;
}

/**
 * Component to display user's credit transaction history
 */
export default function CreditHistory({ userId, limit = 20 }: CreditHistoryProps) {
  const [history, setHistory] = useState<CreditHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/credits/history?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch credit history');
        }

        const data = await response.json();
        setHistory(data.history || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Fehler beim Laden der Historie');
        console.error('[CreditHistory] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, limit]);

  const formatReason = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      extend_session: 'Session verlängert',
      guide_message: 'Guide-Nachricht',
      content_open: 'Content geöffnet',
      purchase: 'Credits gekauft',
      earned: 'Credits verdient',
    };
    return reasonMap[reason] || reason;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'vor wenigen Minuten';
    } else if (diffHours < 24) {
      return `vor ${diffHours}h`;
    } else if (diffDays < 7) {
      return `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`;
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <div className="rc-card">
        <h3 className="text-lg font-semibold text-rc-cream mb-4">Credit-Historie</h3>
        <p className="text-rc-steel">Lade Historie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rc-card">
        <h3 className="text-lg font-semibold text-rc-cream mb-4">Credit-Historie</h3>
        <p className="text-rc-coral">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rc-card">
        <h3 className="text-lg font-semibold text-rc-cream mb-4">Credit-Historie</h3>
        <p className="text-rc-steel">Noch keine Transaktionen.</p>
      </div>
    );
  }

  return (
    <div className="rc-card">
      <h3 className="text-lg font-semibold text-rc-cream mb-4">Credit-Historie</h3>
      
      <div className="space-y-2">
        {history.map((entry) => {
          const isPositive = entry.amount > 0;
          
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Icon */}
                <div className={`flex-shrink-0 ${isPositive ? 'text-rc-mint' : 'text-rc-coral'}`}>
                  {isPositive ? (
                    <ArrowUpIcon className="h-5 w-5" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-rc-cream truncate">
                    {formatReason(entry.reason)}
                  </p>
                  <p className="text-xs text-rc-steel">
                    {formatDate(entry.created_at)}
                  </p>
                </div>

                {/* Amount & Balance */}
                <div className="flex-shrink-0 text-right">
                  <p className={`text-sm font-semibold ${isPositive ? 'text-rc-mint' : 'text-rc-coral'}`}>
                    {isPositive ? '+' : ''}{entry.amount}
                  </p>
                  <p className="text-xs text-rc-steel">
                    Stand: {entry.balance_after}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
