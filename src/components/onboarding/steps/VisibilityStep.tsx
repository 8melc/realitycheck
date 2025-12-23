'use client'

import { AccessFormData } from '../AccessOnboarding'

interface VisibilityStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

export default function VisibilityStep({ formData, updateFormData }: VisibilityStepProps) {
  const isPublic = formData.isPublic ?? true;

  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          {/* Kurze Erklärung oben */}
          <p className="step-subtitle" style={{ marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.6' }}>
            Entscheide, ob du im People-Bereich sichtbar sein möchtest.
          </p>

          {/* Klare Auswahl: 2 Cards */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '1rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div
              className={`option-card ${isPublic ? 'selected' : ''}`}
              onClick={() => updateFormData({ isPublic: true } as any)}
              style={{
                flex: '1',
                minWidth: '200px',
                maxWidth: '300px',
                cursor: 'pointer'
              }}
            >
              <div className="option-card-text" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                Sichtbar
              </div>
              <div className="option-card-text" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Andere sehen deinen Namen und deine Bio im People-Bereich
              </div>
            </div>

            <div
              className={`option-card ${!isPublic ? 'selected' : ''}`}
              onClick={() => updateFormData({ isPublic: false } as any)}
              style={{
                flex: '1',
                minWidth: '200px',
                maxWidth: '300px',
                cursor: 'pointer'
              }}
            >
              <div className="option-card-text" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                Privat
              </div>
              <div className="option-card-text" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Du bleibst unsichtbar im People-Bereich
              </div>
            </div>
          </div>

          {/* Info-Accordion (sekundär) */}
          <details style={{ 
            marginBottom: '2rem',
            padding: '1rem',
            background: 'rgba(78, 205, 196, 0.05)',
            border: '1px solid rgba(78, 205, 196, 0.2)',
            borderRadius: '12px',
            cursor: 'pointer'
          }}>
            <summary style={{ 
              fontSize: '0.875rem', 
              fontWeight: 600,
              color: 'var(--rc-cream, #f3efe8)',
              listStyle: 'none',
              cursor: 'pointer'
            }}>
              ℹ️ Mehr erfahren
            </summary>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--rc-cream, #f3efe8)' }}>
              <p style={{ marginBottom: '0.75rem' }}>
                RealityCheck ist kein soziales Netzwerk. Der People-Bereich ist ein öffentlicher Denkraum.
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                Wenn du sichtbar bist: andere sehen <strong>dass</strong> du hier bist – nicht <em>was</em> du denkst. Dein Ziel bleibt privat, deine Gespräche bleiben privat.
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--rc-steel, #9ca3af)', fontStyle: 'italic' }}>
                Diese Entscheidung ist keine Verpflichtung. Du kannst sie jederzeit ändern.
              </p>
            </div>
          </details>

          {/* Optional: Bio (nur wenn sichtbar) */}
          {isPublic && (
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Kurze Selbstbeschreibung (optional)
              </label>
              <textarea 
                className="input-field"
                value={(formData as any).bio || ''}
                onChange={(e) => updateFormData({ bio: e.target.value } as any)}
                placeholder="Ich arbeite gerade daran, meinen Fokus zurückzuholen und bewusster mit meiner Zeit umzugehen." 
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px', width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

