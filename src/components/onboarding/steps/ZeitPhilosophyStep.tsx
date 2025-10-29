'use client'

import { AccessFormData } from '../AccessOnboarding'

interface ZeitPhilosophyStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

const philosophyOptions = [
  { 
    value: 'dividende', 
    icon: '', 
    text: 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.' 
  },
  { 
    value: 'wirkung', 
    icon: '', 
    text: 'Für mich zählt Wirkung, nicht nur Erledigungen – meine Zeit soll Sinn stiften.' 
  },
  { 
    value: 'limitiert', 
    icon: '', 
    text: 'Jede Stunde ist limitiert – ich will sie bewusst gegen das eintauschen, was zählt.' 
  },
  { 
    value: 'balance', 
    icon: '', 
    text: 'Ich will mein Kalender-Depot so balancieren, dass Flow, Pause und Wachstum sich abwechseln.' 
  },
  { 
    value: 'no-waste', 
    icon: '', 
    text: 'Zeitverschwendung ist für mich das Einzige, was ich mir wirklich nie leisten will.' 
  }
]

export default function ZeitPhilosophyStep({ formData, updateFormData }: ZeitPhilosophyStepProps) {
  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <div className="philosophy-chips">
            {philosophyOptions.map(option => (
              <div
                key={option.value}
                className={`option-card ${formData.timePhilosophy === option.value ? 'selected' : ''}`}
                onClick={() => updateFormData({ timePhilosophy: option.value })}
              >
                <div className="option-card-icon">{option.icon}</div>
                <div className="option-card-text">{option.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
