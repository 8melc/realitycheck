'use client'

import { AccessFormData } from './AccessOnboarding'

interface StepHeaderProps {
  step: {
    id: string
    heading: string
    microcopy: string
  }
  formData: AccessFormData
  showGoalBadge: boolean
}

export default function StepHeader({ step, formData, showGoalBadge }: StepHeaderProps) {
  const getGoalText = () => {
    const hasSelectedGoals = formData.goals && formData.goals.length > 0
    const hasTextGoal = formData.goal && formData.goal.trim() !== ''
    
    if (hasSelectedGoals) {
      const shortened = formData.goals.map(g => {
        if (g.includes('Freiheit spüren')) return 'Freiheit spüren'
        if (g.includes('Hamsterrad')) return 'Kein Hamsterrad'
        if (g.includes('Aussteigen')) return 'Aussteigen'
        if (g.includes('Bullshit-Meeting')) return 'Kein Bullshit'
        if (g.includes('bauen')) return 'Etwas bauen'
        if (g.includes('Insta')) return 'Mehr sehen'
        return g
      })
      return shortened.join(', ')
    } else if (hasTextGoal) {
      return formData.goal
    }
    return ''
  }

  const goalText = getGoalText()

  return (
    <div className="step-header">
      {showGoalBadge && goalText && (
        <div className="goal-badge-container">
          <div className="goal-badge">
            Ziel: {goalText}
          </div>
        </div>
      )}
      <h1 className="step-title">{step.heading}</h1>
      <p className="step-subtitle">{step.microcopy}</p>
    </div>
  )
}
