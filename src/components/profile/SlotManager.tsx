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
      <div className="rounded-xl bg-neutral-900 p-6 text-sm text-neutral-300">
        Lade deine Slots …
      </div>
    );
  }

  return (
    <section className="rounded-xl bg-neutral-900 p-6 text-neutral-100 shadow-lg">
      <header className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-red-500">
          Fokus. 12 Slots. Null Ausreden.
        </h2>
        <p className="text-sm text-neutral-300">
          Stell ein, wie viel Input dein Tag aushält – nicht, wie viel dein Dopamin will.
        </p>
      </header>

      <div className="mb-4 flex items-baseline justify-between text-sm text-neutral-300">
        <span>Gesamt-Slots pro Tag</span>
        <span className={overLimit ? 'text-red-400' : 'text-green-400'}>
          {total} / {MAX_SLOTS}
        </span>
      </div>

      <div className="space-y-4">
        {/* Artikel */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium">Artikel pro Tag</label>
            <span className="tabular-nums text-neutral-200">
              {slots.article}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_SLOTS}
            value={slots.article}
            onChange={(e) => updateSlot('article', Number(e.target.value))}
            className="mt-2 w-full accent-red-500"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Für Tiefgang, nicht für Scrollen.
          </p>
        </div>

        {/* Podcasts */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium">Podcasts pro Tag</label>
            <span className="tabular-nums text-neutral-200">
              {slots.podcast}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_SLOTS}
            value={slots.podcast}
            onChange={(e) => updateSlot('podcast', Number(e.target.value))}
            className="mt-2 w-full accent-red-500"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Für unterwegs. Kein Nebenbei-Gedudel.
          </p>
        </div>

        {/* Zitate */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium">Zitate pro Tag</label>
            <span className="tabular-nums text-neutral-200">
              {slots.quote}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_SLOTS}
            value={slots.quote}
            onChange={(e) => updateSlot('quote', Number(e.target.value))}
            className="mt-2 w-full accent-red-500"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Kleine Hiebe statt Kalendersprüche.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-400">
          {error}
        </p>
      )}

      {overLimit && !error && (
        <p className="mt-4 text-xs text-red-300">
          Du bist bei {total}. Du hast aber nur 12 Slots. Streichen gehört dazu.
        </p>
      )}

      {saveMessage && !error && (
        <p className="mt-4 text-xs text-green-400">
          {saveMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-5 w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-800"
      >
        {saving ? 'Speichere …' : 'Festnageln'}
      </button>
    </section>
  );
}


