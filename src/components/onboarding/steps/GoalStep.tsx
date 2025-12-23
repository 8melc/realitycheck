'use client'

import { AccessFormData } from '../AccessOnboarding'

interface GoalStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

const goalDirections = [
  { value: 'freedom', label: 'Freiheit' },
  { value: 'clarity', label: 'Klarheit' },
  { value: 'growth', label: 'Wachstum' },
  { value: 'balance', label: 'Balance' },
  { value: 'meaning', label: 'Sinn' },
] as const

export default function GoalStep({ formData, updateFormData }: GoalStepProps) {
  const updateGoal = (value: string) => {
    // Wenn Text eingegeben wird, goalDirection zurücksetzen
    updateFormData({ goal: value, goalDirection: value.trim() ? null : formData.goalDirection })
  }

  const selectGoalDirection = (direction: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning') => {
    // Wenn Richtung gewählt wird, goal zurücksetzen
    updateFormData({ 
      goalDirection: formData.goalDirection === direction ? null : direction,
      goal: formData.goalDirection === direction ? formData.goal : ''
    })
  }

  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <p className="step-subtitle" style={{ marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
            Dein Ziel gibt deinem Guide Orientierung. Es entscheidet, worauf er dich aufmerksam macht.
          </p>
          
          {/* Option 1: Freier Text */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Dein Ziel (freier Text)
            </label>
            <textarea 
              className="input-field"
              value={formData.goal}
              onChange={(e) => updateGoal(e.target.value)}
              placeholder="Beispiel: Ich will meine Zeit wieder selbst bestimmen und aufhören, mich ständig abzulenken." 
              rows={4}
              style={{ resize: 'vertical', minHeight: '120px', width: '100%' }}
              disabled={!!formData.goalDirection}
            />
            <p style={{ 
              marginTop: '0.75rem', 
              fontSize: '0.875rem', 
              color: 'var(--rc-steel, #9ca3af)',
              lineHeight: '1.5'
            }}>
              Dieses Ziel nutzt nur dein Guide.<br />
              Es ist keine Verpflichtung, kein Profil-Statement und nicht öffentlich.
            </p>
          </div>

          {/* Divider */}
          <div style={{ 
            textAlign: 'center', 
            margin: '2rem 0',
            color: 'var(--rc-steel)',
            fontSize: '0.875rem'
          }}>
            ODER
          </div>

          {/* Option 2: Ziel-Richtung */}
          <div>
            <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>
              Ziel-Richtung
            </label>
            <div className="goal-grid">
              {goalDirections.map(direction => (
                <div
                  key={direction.value}
                  className={`option-card ${formData.goalDirection === direction.value ? 'selected' : ''}`}
                  onClick={() => selectGoalDirection(direction.value)}
                  style={{ 
                    opacity: formData.goal.trim() ? 0.5 : 1,
                    cursor: formData.goal.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="option-card-text">{direction.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
