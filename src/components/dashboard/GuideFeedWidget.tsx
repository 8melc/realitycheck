'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Impulse {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface GuideFeedData {
  success: boolean;
  impulses: Impulse[];
  userContext?: {
    interests: string[];
    goal: string | null;
    tone: string;
  };
  message?: string;
  error?: string;
}

export default function GuideFeedWidget() {
  const [feedData, setFeedData] = useState<GuideFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGuideFeed() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/guide/feed');
        const data: GuideFeedData = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch guide feed');
        }
        
        setFeedData(data);
      } catch (err: any) {
        console.error('[GuideFeedWidget] Error:', err);
        setError(err.message || 'Konnte Guide-Feed nicht laden');
      } finally {
        setLoading(false);
      }
    }

    fetchGuideFeed();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/guide/feed');
      const data: GuideFeedData = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch guide feed');
      }
      
      setFeedData(data);
    } catch (err: any) {
      console.error('[GuideFeedWidget] Refresh error:', err);
      setError(err.message || 'Konnte Guide-Feed nicht laden');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="guide-section" id="guide-feed">
        <div className="rc-card rc-card--hero p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="guide-kicker">Dein Guide heute</span>
              <h3 className="rc-heading text-2xl">Personalisiert für dich</h3>
              <p className="rc-microcopy mt-2">Lade Impulse...</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--rc-mint)]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="guide-section" id="guide-feed">
        <div className="rc-card rc-card--hero p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="guide-kicker">Dein Guide heute</span>
              <h3 className="rc-heading text-2xl">Personalisiert für dich</h3>
            </div>
          </div>
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 text-sm text-[var(--rc-mint)] hover:underline"
            >
              Erneut versuchen →
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!feedData || feedData.impulses.length === 0) {
    const isEmpty = !feedData?.userContext?.goal || feedData?.userContext?.goal === 'Noch nicht gesetzt';
    
    return (
      <section className="guide-section" id="guide-feed">
        <div className="rc-card rc-card--hero p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="guide-kicker">Dein Guide heute</span>
              <h3 className="rc-heading text-2xl">Personalisiert für dich</h3>
              <p className="rc-microcopy mt-2">
                {feedData?.message || 'Setze dein Ziel und füge Interessen hinzu, um personalisierte Impulse zu erhalten.'}
              </p>
            </div>
          </div>
          
          {isEmpty && (
            <div className="mt-6">
              <Link 
                href="/user/settings#profil-daten"
                className="text-[var(--rc-mint)] hover:underline text-sm uppercase font-bold inline-flex items-center gap-2"
              >
                Ziel setzen →
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="guide-section" id="guide-feed">
      <div className="rc-card rc-card--hero p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="guide-kicker">Dein Guide heute</span>
            <h3 className="rc-heading text-2xl">Personalisiert für dich</h3>
            <p className="rc-microcopy mt-2">
              Basierend auf deinen Interessen und deinem Ziel
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {feedData.impulses.map((impulse) => (
            <div
              key={impulse.id}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[var(--rc-mint)]/30 transition-colors"
            >
              <h4 className="text-lg font-semibold text-[var(--rc-cream)] mb-2">
                {impulse.title}
              </h4>
              <p className="text-sm text-[var(--rc-steel)] leading-relaxed">
                {impulse.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={handleRefresh}
            className="text-[var(--rc-mint)] hover:underline text-xs uppercase font-bold inline-flex items-center gap-2"
            disabled={loading}
          >
            🔄 Neue Impulse generieren
          </button>
        </div>
      </div>
    </section>
  );
}


