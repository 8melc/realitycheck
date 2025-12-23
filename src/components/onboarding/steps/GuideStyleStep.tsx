'use client'

import { AccessFormData } from '../AccessOnboarding'

interface GuideStyleStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

const answerStyles = [
  { value: 'short', label: 'Kurz', desc: 'Knappe, präzise Antworten' },
  { value: 'medium', label: 'Medium', desc: 'Ausgewogene Länge' },
  { value: 'long', label: 'Ausführlich', desc: 'Detaillierte, umfassende Antworten' },
] as const

const guideTones = [
  { value: 'soft', label: 'Soft Touch', desc: 'Sanft und ermutigend' },
  { value: 'straight', label: 'Straight', desc: 'Direkt und ehrlich' },
  { value: 'hard', label: 'Hard Truth', desc: 'Ungefiltert und klar' },
] as const

export default function GuideStyleStep({ formData, updateFormData }: GuideStyleStepProps) {
  return (
    <div className="step-content">
      <div className="form-content">
        {/* Erklärung OBERHALB */}
        <div style={{ 
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'rgba(78, 205, 196, 0.05)',
          border: '1px solid rgba(78, 205, 196, 0.2)',
          borderRadius: '12px'
        }}>
          <p style={{ 
            fontSize: '1rem', 
            lineHeight: '1.6',
            color: 'var(--rc-cream, #f3efe8)',
            margin: 0
          }}>
            <strong>Wer ist der Guide?</strong><br />
            Der Guide ist dein persönlicher Beobachter.<br />
            Er erinnert dich an dein Ziel, stellt unbequeme Fragen<br />
            und lenkt deine Aufmerksamkeit zurück auf das, was zählt.
          </p>
        </div>

        {/* Answer Style */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>
            Antwort-Länge
          </label>
          <p className="step-subtitle" style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--rc-steel, #9ca3af)' }}>
            Wie ausführlich dein Guide denkt und antwortet.
          </p>
          <div className="goal-grid" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {answerStyles.map(style => (
              <div
                key={style.value}
                className={`option-card ${formData.answerStyle === style.value ? 'selected' : ''}`}
                onClick={() => updateFormData({ answerStyle: style.value })}
              >
                <div className="option-card-text" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {style.label}
                </div>
                <div className="option-card-text" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {style.desc.replace(/\(~.*?\)/g, '').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guide Tone */}
        <div className="form-group">
          <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>
            Guide-Ton
          </label>
          <p className="step-subtitle" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            Wie soll der Guide mit dir kommunizieren?
          </p>
          <div className="goal-grid" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {guideTones.map(tone => (
              <div
                key={tone.value}
                className={`option-card ${formData.guideTone === tone.value ? 'selected' : ''}`}
                onClick={() => updateFormData({ guideTone: tone.value })}
              >
                <div className="option-card-text" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {tone.label}
                </div>
                <div className="option-card-text" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {tone.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

