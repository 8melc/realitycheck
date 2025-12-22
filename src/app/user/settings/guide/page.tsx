'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import GuideSettings from '@/components/GuideSettings';
import UsageLimitSettings from '@/components/profile/UsageLimitSettings';
import { SlotManager } from '@/components/profile/SlotManager';

export default function GuideSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

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
    } catch (error) {
      console.error('[Guide Settings] Error loading data:', error);
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
        <h1 className="settings-title">Guide-Einstellungen</h1>
        <p className="settings-subtitle">Personalisiere, wie dein Guide arbeitet</p>
      </div>

      {/* Guide Settings */}
      {userId && (
        <section id="guide-verhalten" className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Guide-Verhalten</h2>
            <p className="settings-section-description">Ton, Nudging und Antwort-Stil</p>
          </div>
          <GuideSettings userId={userId} />
        </section>
      )}

      {/* Filter / Slots Section */}
      <section id="filter" className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Content-Filter</h2>
          <p className="settings-section-description">Artikel, Podcasts und Zitate pro Tag</p>
        </div>
        <SlotManager />
      </section>

      {/* Usage Limit Section */}
      <section id="tageslimit" className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Tageslimit</h2>
          <p className="settings-section-description">Maximale Nutzungszeit pro Tag</p>
        </div>
        <UsageLimitSettings />
      </section>
    </div>
  );
}

