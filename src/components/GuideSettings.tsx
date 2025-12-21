'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

const ANSWER_STYLES = [
  { value: 'short', label: 'Kurz', tokens: '~250 Tokens', desc: 'Knappe, präzise Antworten' },
  { value: 'medium', label: 'Medium', tokens: '~450 Tokens', desc: 'Ausgewogene Länge' },
  { value: 'long', label: 'Ausführlich', tokens: '~800 Tokens', desc: 'Detaillierte, umfassende Antworten' }
] as const;

const GUIDE_TONES = [
  { value: 'Soft Touch', label: 'Soft Touch', desc: 'Sanft und ermutigend' },
  { value: 'Straight', label: 'Straight', desc: 'Direkt und ehrlich' },
  { value: 'Hard Truth', label: 'Hard Truth', desc: 'Ungefiltert und klar' }
] as const;

const FOCUS_WINDOWS = [
  { value: 'morning', label: 'Morgen', desc: '6:00 - 12:00 Uhr', icon: '🌅' },
  { value: 'afternoon', label: 'Nachmittag', desc: '12:00 - 18:00 Uhr', icon: '☀️' },
  { value: 'evening', label: 'Abend', desc: '18:00 - 22:00 Uhr', icon: '🌆' },
  { value: 'late_night', label: 'Spät', desc: '22:00 - 6:00 Uhr', icon: '🌙' }
] as const;

type AnswerStyle = typeof ANSWER_STYLES[number]['value'];
type GuideTone = typeof GUIDE_TONES[number]['value'];
type FocusWindow = typeof FOCUS_WINDOWS[number]['value'];

interface GuideSettingsProps {
  userId: string;
}

export default function GuideSettings({ userId }: GuideSettingsProps) {
  const [answerStyle, setAnswerStyle] = useState<AnswerStyle>('medium');
  const [guideTone, setGuideTone] = useState<GuideTone>('Straight');
  const [focusWindow, setFocusWindow] = useState<FocusWindow>('evening');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('answer_style, guide_tone, focus_window')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (fetchError) {
          console.error('[GuideSettings] Error fetching settings:', fetchError);
          return;
        }
        
        if (data) {
          // Normalize values: DB might have lowercase 'straight', but we want 'Straight'
          const normalizedAnswerStyle = (data.answer_style || 'medium') as AnswerStyle;
          const normalizedGuideTone = data.guide_tone 
            ? (data.guide_tone === 'straight' ? 'Straight' : data.guide_tone as GuideTone)
            : 'Straight';
          const normalizedFocusWindow = (data.focus_window || 'evening') as FocusWindow;
          
          // Validate values
          if (ANSWER_STYLES.some(s => s.value === normalizedAnswerStyle)) {
            setAnswerStyle(normalizedAnswerStyle);
          }
          if (GUIDE_TONES.some(t => t.value === normalizedGuideTone)) {
            setGuideTone(normalizedGuideTone);
          }
          if (FOCUS_WINDOWS.some(w => w.value === normalizedFocusWindow)) {
            setFocusWindow(normalizedFocusWindow);
          }
        }
      } catch (err) {
        console.error('[GuideSettings] Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          answer_style: answerStyle,
          guide_tone: guideTone,
          focus_window: focusWindow
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(updateError.message || 'Fehler beim Speichern');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('[GuideSettings] Error updating settings:', err);
      setError(err.message || 'Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-form">
        <p style={{ color: '#B8BCC8', textAlign: 'center' }}>Lade Guide-Einstellungen...</p>
      </div>
    );
  }

  return (
    <div className="settings-form">
      {/* Answer Style Section */}
      <div className="form-group">
        <label className="form-label">Antwort-Länge</label>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>
          Bestimmt, wie ausführlich der Guide antwortet
        </p>
        <div 
          className="guide-settings-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem'
          }}
        >
          {ANSWER_STYLES.map(style => (
            <button
              key={style.value}
              type="button"
              onClick={() => setAnswerStyle(style.value)}
              className={`btn ${answerStyle === style.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                border: answerStyle === style.value ? '2px solid var(--rc-mint, #00D9FF)' : '2px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: answerStyle === style.value ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--rc-cream, #f3efe8)'
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{style.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--rc-steel, #9ca3af)' }}>{style.tokens}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--rc-steel, #9ca3af)', marginTop: '0.25rem' }}>{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Guide Tone Section */}
      <div className="form-group" style={{ marginTop: '2rem' }}>
        <label className="form-label">Guide-Ton</label>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>
          Bestimmt den Kommunikationsstil des Guides
        </p>
        <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {GUIDE_TONES.map(tone => (
            <button
              key={tone.value}
              type="button"
              onClick={() => setGuideTone(tone.value)}
              className={`btn ${guideTone === tone.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: guideTone === tone.value ? '2px solid var(--rc-mint, #00D9FF)' : '2px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: guideTone === tone.value ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--rc-cream, #f3efe8)'
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{tone.label}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--rc-steel, #9ca3af)' }}>{tone.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Focus Window Section */}
      <div className="form-group" style={{ marginTop: '2rem' }}>
        <label className="form-label">Fokus-Zeit</label>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>
          Wann möchtest du bevorzugt Content-Empfehlungen erhalten?
        </p>
        <div 
          className="guide-settings-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem'
          }}
        >
          {FOCUS_WINDOWS.map(window => (
            <button
              key={window.value}
              type="button"
              onClick={() => setFocusWindow(window.value)}
              className={`btn ${focusWindow === window.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                border: focusWindow === window.value ? '2px solid var(--rc-mint, #00D9FF)' : '2px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: focusWindow === window.value ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                cursor: 'pointer',
                textAlign: 'center',
                color: 'var(--rc-cream, #f3efe8)'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{window.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{window.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--rc-steel, #9ca3af)' }}>{window.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="form-error" style={{ 
          padding: '0.75rem', 
          backgroundColor: 'rgba(220, 38, 38, 0.1)', 
          color: '#FCA5A5', 
          borderRadius: '0.5rem',
          marginTop: '1rem',
          border: '1px solid rgba(220, 38, 38, 0.3)'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div className="form-success" style={{ 
          padding: '0.75rem', 
          backgroundColor: 'rgba(5, 150, 105, 0.1)', 
          color: '#6EE7B7', 
          borderRadius: '0.5rem',
          marginTop: '1rem',
          border: '1px solid rgba(5, 150, 105, 0.3)'
        }}>
          ✓ Einstellungen erfolgreich gespeichert
        </div>
      )}

      {/* Save Button */}
      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: saving ? 'rgba(156, 163, 175, 0.3)' : 'var(--rc-mint, #00D9FF)',
            color: saving ? 'var(--rc-steel, #9ca3af)' : '#000',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            border: 'none'
          }}
        >
          {saving ? 'Speichern...' : 'Einstellungen speichern'}
        </button>
      </div>
    </div>
  );
}

