'use client';

import { useState, useEffect } from 'react';
import { CoinsIcon, TrendingUpIcon, GiftIcon, ChevronDownIcon, ChevronUpIcon } from './icons';

interface CreditsWidgetProps {
  userId?: string;
  hideCTA?: boolean;
}

interface CreditsData {
  remaining: number;
  earned: number;
  creditValue: number; // in Euro
  lastEarned?: string;
}

const CreditsWidget = ({ userId, hideCTA = false }: CreditsWidgetProps) => {
  const [credits, setCredits] = useState<CreditsData>({
    remaining: 0,
    earned: 0,
    creditValue: 0.50, // 50 Cent pro Credit
    lastEarned: undefined,
  });
  const [isClient, setIsClient] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mock data - TODO: Replace with real API call
  useEffect(() => {
    if (!isClient) return;
    
    // Simulate loading credits data
    setCredits({
      remaining: 47,
      earned: 156,
      creditValue: 0.50,
      lastEarned: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    });
  }, [isClient]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);

  const formatTimestamp = (timestamp: string) => {
    if (!isClient) return 'Lade...';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'vor wenigen Minuten';
    } else if (diffInHours < 24) {
      return `vor ${diffInHours}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `vor ${days} Tagen`;
    }
  };

  return (
    <div className="fyf-card fyf-card--sidebar motion-fade-up" aria-label="Credits Übersicht">
      <div className="flex flex-col gap-4">
        {/* Header - Clickable */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-2 w-full text-left hover:bg-white/5 p-2 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <CoinsIcon className="h-5 w-5 text-fyf-mint" />
            <h3 className="text-lg font-semibold text-fyf-cream">Credits</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-fyf-mint font-bold">
              {isClient ? credits.remaining : '...'}
            </div>
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4 text-fyf-steel" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-fyf-steel" />
            )}
          </div>
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-white/10">
            {/* Remaining Credits */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-fyf-steel">Verbleibend</span>
                <span className="text-lg font-bold text-fyf-mint">
                  {isClient ? credits.remaining : '...'}
                </span>
              </div>
              <div className="text-xs text-fyf-steel">
                Wert: {isClient ? formatCurrency(credits.remaining * credits.creditValue) : '...'}
              </div>
            </div>

            {/* Credit Value Info */}
            <div className="rounded-lg bg-fyf-mint/10 border border-fyf-mint/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <GiftIcon className="h-4 w-4 text-fyf-mint" />
                <span className="text-sm font-medium text-fyf-cream">Credit-Wert</span>
              </div>
              <div className="text-sm text-fyf-steel">
                1 Credit = {isClient ? formatCurrency(credits.creditValue) : '...'}
              </div>
            </div>

            {/* Earned Credits */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-fyf-steel">Verdient</span>
                <span className="text-lg font-bold text-fyf-coral">
                  {isClient ? credits.earned : '...'}
                </span>
              </div>
              {credits.lastEarned && (
                <div className="text-xs text-fyf-steel">
                  Letztes: {formatTimestamp(credits.lastEarned)}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-fyf-steel">Gesamtfortschritt</span>
                <span className="text-xs text-fyf-steel">
                  {isClient ? `${credits.earned + credits.remaining}` : '...'} Credits
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-fyf-mint to-fyf-coral h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: isClient ? `${(credits.earned / (credits.earned + credits.remaining)) * 100}%` : '0%' 
                  }}
                />
              </div>
            </div>

            {/* Action Button - Only show if not hidden */}
            {!hideCTA && (
              <button className="fyf-btn fyf-btn-sm fyf-btn--outline w-full">
                <TrendingUpIcon className="h-4 w-4" />
                Credits verdienen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsWidget;
