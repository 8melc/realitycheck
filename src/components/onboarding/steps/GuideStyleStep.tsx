'use client'

import { AccessFormData } from '../AccessOnboarding'

interface GuideStyleStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

const answerStyles = [
  { value: 'short', label: 'Kurz', desc: 'Knappe, präzise Antworten (~250 Tokens)' },
  { value: 'medium', label: 'Medium', desc: 'Ausgewogene Länge (~450 Tokens)' },
  { value: 'long', label: 'Ausführlich', desc: 'Detaillierte, umfassende Antworten (~800 Tokens)' },
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
        {/* Answer Style */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>
            Antwort-Länge
          </label>
          <p className="step-subtitle" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            Wie ausführlich soll der Guide antworten?
          </p>
          <div className="goal-grid">
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
                  {style.desc}
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
          <div className="goal-grid">
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

