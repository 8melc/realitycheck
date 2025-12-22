'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import CreditHistory from '@/components/credits/CreditHistory';
import CreditsTable from '@/components/credits/CreditsTable';
import CreditsPurchaseFlow from '@/components/credits/CreditsPurchaseFlow';

export default function CreditsSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Load credits
      const creditsRes = await fetch('/api/profile/credits');
      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        setCredits(creditsData.credits || 0);
      }
    } catch (error) {
      console.error('[Credits Settings] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-main-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--rc-mint)] mx-auto"></div>
        <p style={{ color: '#B8BCC8', marginTop: '10px' }}>Lade Daten...</p>
      </div>
    );
  }

  return (
    <div className="settings-main-content">
      <div className="settings-header">
        <h1 className="settings-title">Credits</h1>
        <p className="settings-subtitle">Verwalte deine Credits und Transaktionen</p>
      </div>

      {/* Current Credits */}
      <section id="aktueller-stand" className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Aktueller Stand</h2>
          <p className="settings-section-description">Deine verfügbaren Credits</p>
        </div>
        <div style={{
          background: 'rgba(78, 205, 196, 0.1)',
          border: '1px solid rgba(78, 205, 196, 0.3)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: 'var(--rc-mint, #4ecdc4)',
            marginBottom: '0.5rem',
          }}>
            {credits}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--rc-steel, #9ca3af)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Credits verfügbar
          </div>
        </div>
      </section>

      {/* Credit History */}
      {userId && (
        <section id="transaktionen" className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Transaktions-Historie</h2>
            <p className="settings-section-description">Alle deine Credit-Transaktionen</p>
          </div>
          <CreditHistory userId={userId} limit={50} />
        </section>
      )}

      {/* Credits Table */}
      <section id="credits-system" className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Credits-System</h2>
          <p className="settings-section-description">Wie Credits funktionieren</p>
        </div>
        <CreditsTable />
      </section>

      {/* Purchase Flow */}
      <section id="credits-kaufen" className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Credits kaufen</h2>
          <p className="settings-section-description">Erweitere dein Credit-Guthaben</p>
        </div>
        <CreditsPurchaseFlow />
      </section>
    </div>
  );
}

