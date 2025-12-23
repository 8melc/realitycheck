'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

type SlotsState = {
  article: number;
  podcast: number;
  quote: number;
};

const MAX_SLOTS = 12;

export function SlotManager() {
  const supabase = createClient();
  const [slots, setSlots] = useState<SlotsState>({
    article: 3,
    podcast: 2,
    quote: 4,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const total = useMemo(
    () => slots.article + slots.podcast + slots.quote,
    [slots]
  );

  const overLimit = total > MAX_SLOTS;

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('Kein User gefunden. Log dich neu ein.');
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('slots_article, slots_podcast, slots_quote')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        setError('Profil konnte nicht geladen werden.');
      } else if (data) {
        setSlots({
          article: data.slots_article ?? 3,
          podcast: data.slots_podcast ?? 2,
          quote: data.slots_quote ?? 4,
        });
      }
      setLoading(false);
    };

    fetchSlots();
  }, [supabase]);

  const updateSlot = (key: keyof SlotsState, value: number) => {
    setSlots((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(MAX_SLOTS, value)),
    }));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveMessage(null);

    if (total > MAX_SLOTS) {
      setError(
        'Du planst mehr Content als du Leben hast. Kürz auf 12 Slots runter.'
      );
      setSaving(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Kein User gefunden. Log dich neu ein.');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        slots_article: slots.article,
        slots_podcast: slots.podcast,
        slots_quote: slots.quote,
      })
      .eq('user_id', user.id);

    if (updateError) {
      setError('Konnte deine Slots nicht speichern.');
    } else {
      setSaveMessage(
        'Okay. Der Guide hält dir den Spiegel, nicht die Tüte Snacks hin.'
      );
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--rc-steel, #9ca3af)' }}>
        Lade deine Slots …
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h3 className="settings-section-title" style={{ marginBottom: '0.5rem' }}>
          Fokus. 12 Slots. Null Ausreden.
        </h3>
        <p className="settings-section-description">
          Stell ein, wie viel Input dein Tag aushält – nicht, wie viel dein Dopamin will.
        </p>
      </header>

      <div className="mb-6 flex items-baseline justify-between" style={{ fontSize: '0.875rem', color: 'var(--rc-steel, #9ca3af)' }}>
        <span>Gesamt-Slots pro Tag</span>
        <span style={{ color: overLimit ? 'var(--rc-coral, #ff6b6b)' : 'var(--rc-mint, #4ecdc4)', fontWeight: 600 }}>
          {total} / {MAX_SLOTS}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Artikel */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Artikel pro Tag</label>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rc-cream, #f3efe8)' }}>
              {slots.article}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_SLOTS}
            value={slots.article}
            onChange={(e) => updateSlot('article', Number(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255, 255, 255, 0.1)',
              outline: 'none',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            }}
            className="slider-input"
          />
          <p className="form-hint">
            Für Tiefgang, nicht für Scrollen.
          </p>
        </div>

        {/* Podcasts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Podcasts pro Tag</label>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rc-cream, #f3efe8)' }}>
              {slots.podcast}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_SLOTS}
            value={slots.podcast}
            onChange={(e) => updateSlot('podcast', Number(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255, 255, 255, 0.1)',
              outline: 'none',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            }}
            className="slider-input"
          />
          <p className="form-hint">
            Für unterwegs. Kein Nebenbei-Gedudel.
          </p>
        </div>

        {/* Zitate */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Zitate pro Tag</label>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rc-cream, #f3efe8)' }}>
              {slots.quote}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_SLOTS}
            value={slots.quote}
            onChange={(e) => updateSlot('quote', Number(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255, 255, 255, 0.1)',
              outline: 'none',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            }}
            className="slider-input"
          />
          <p className="form-hint">
            Kleine Hiebe statt Kalendersprüche.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {overLimit && !error && (
        <div className="form-error" style={{ marginTop: '1rem' }}>
          Du bist bei {total}. Du hast aber nur 12 Slots. Streichen gehört dazu.
        </div>
      )}

      {saveMessage && !error && (
        <div className="form-success" style={{ marginTop: '1rem' }}>
          {saveMessage}
        </div>
      )}

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {saving ? 'Speichere …' : 'Festnageln'}
        </button>
      </div>
    </div>
  );
}



