'use client'

interface SystemIntroProps {
  formData: {
    goals: string[]
    goal: string
  }
}

export default function SystemIntro({ formData }: SystemIntroProps) {
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
    <div className="system-intro">
      <p className="system-subhead">
        Keine App. Kein Tool.<br />
        Dein System, um Zeit als Vermögen zu verstehen –<br />
        und bewusst einzusetzen.
      </p>
      
      <h1 className="system-title">Willkommen bei FYF.</h1>
      
      <div className="system-statement">
        <p className="statement-text">
          Du hast dein Profil eingerichtet.<br />
          Jetzt beginnt das, was Zeit wirklich wertvoll macht –<br />
          Begegnung, Haltung, Bewusstsein.
        </p>
        
        {goalText && (
          <div className="goal-reminder">
            <div className="goal-badge-large">
              Dein Ziel: {goalText}
            </div>
            <p className="goal-microcopy">
              Alles, was du ab jetzt in FYF siehst,<br />
              ist darauf ausgerichtet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
