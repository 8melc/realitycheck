'use client'

import { AccessFormData } from '../AccessOnboarding'

interface GoalStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

const goalChips = [
  'Freiheit spüren, bevor ich 50 bin',
  'Nie wieder zurück ins Hamsterrad',
  'Aussteigen und etwas hinterlassen',
  'Ein Jahr kein Bullshit-Meeting',
  'Etwas bauen, das bleibt',
  'Mehr sehen als Insta mir zeigt'
]

const goalDirections = [
  { value: 'freedom', label: 'Freiheit' },
  { value: 'clarity', label: 'Klarheit' },
  { value: 'growth', label: 'Wachstum' },
  { value: 'balance', label: 'Balance' },
  { value: 'meaning', label: 'Sinn' },
] as const

export default function GoalStep({ formData, updateFormData }: GoalStepProps) {
  const selectGoalChip = (goalText: string) => {
    const newGoals = formData.goals.includes(goalText)
      ? formData.goals.filter(g => g !== goalText)
      : [...formData.goals, goalText]
    
    updateFormData({ goals: newGoals })
  }

  const updateGoal = (value: string) => {
    updateFormData({ goal: value })
  }

  const selectGoalDirection = (direction: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning') => {
    updateFormData({ 
      goalDirection: formData.goalDirection === direction ? null : direction 
    })
  }

  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <p className="step-subtitle">
            Schreib auf, was du wirklich willst, nicht was andere erwarten.
          </p>
          
          <textarea 
            className="input-field"
            value={formData.goal}
            onChange={(e) => updateGoal(e.target.value)}
            placeholder="Was würdest du tun, wenn du niemandem etwas beweisen müsstest?" 
            rows={4}
            style={{ resize: 'vertical', minHeight: '120px' }}
          />
          
          <div className="goal-grid">
            {goalChips.map(goal => (
              <div
                key={goal}
                className={`option-card ${formData.goals.includes(goal) ? 'selected' : ''}`}
                onClick={() => selectGoalChip(goal)}
              >
                <div className="option-card-text">{goal}</div>
              </div>
            ))}
            <div
              className="option-card"
              onClick={() => document.querySelector('textarea')?.focus()}
              style={{ borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <div className="option-card-text">+ Eigenes Ziel</div>
            </div>
          </div>
          
          <p className="step-subtitle" style={{ marginTop: '2rem' }}>
            Setz ein Ziel, das für dich mehr wert ist als jede Ausrede.
          </p>
          <p className="step-subtitle" style={{ color: 'var(--fyf-mint)', fontWeight: 600 }}>
            Dein Fokus = dein Vermögen. Mehr Ownership gibt's nicht.
          </p>

          {/* Goal Direction Selection */}
          <div style={{ marginTop: '2rem' }}>
            <p className="step-subtitle" style={{ marginBottom: '1rem' }}>
              Welche Richtung beschreibt dein Ziel am besten?
            </p>
            <div className="goal-grid">
              {goalDirections.map(direction => (
                <div
                  key={direction.value}
                  className={`option-card ${formData.goalDirection === direction.value ? 'selected' : ''}`}
                  onClick={() => selectGoalDirection(direction.value)}
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
