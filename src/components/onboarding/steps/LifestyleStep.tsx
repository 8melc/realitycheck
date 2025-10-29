'use client'

import { AccessFormData } from '../AccessOnboarding'

interface LifestyleStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

const lifestyleOptions = [
  { value: 'digital-nomad', label: 'Digital Nomad', description: 'Arbeite, wo du gerade bist.', icon: '' },
  { value: 'remote-worker', label: 'Remote Worker', description: 'Homeoffice ist mein Orbit.', icon: '' },
  { value: 'office-player', label: 'Office Player', description: '9-to-5, aber meinen Regeln.', icon: '' },
  { value: 'hybrid', label: 'Hybrid', description: 'Stadt und Rückzug im Wechsel.', icon: '' },
  { value: 'creator', label: 'Creator', description: 'Ich kreiere, Fokus ist fluide.', icon: '' },
  { value: 'sidepreneur', label: 'Sidepreneur', description: 'Mehrere Projekte, voller Drive.', icon: '' },
  { value: 'explorer', label: 'Explorer', description: 'Ich teste ständig neue Routinen.', icon: '' },
  { value: 'caretaker', label: 'Caretaker', description: 'Ich halte andere am Laufen.', icon: '' },
  { value: 'teamplayer', label: 'Teamplayer', description: 'Ich tanke Energie im Miteinander.', icon: '' },
  { value: 'rebel', label: 'Rebel', description: 'Kein klassisches Lebensmodell.', icon: '' },
  { value: 'family-flow', label: 'Family Flow', description: 'Familie ist mein Taktgeber.', icon: '' },
  { value: 'minimalist', label: 'Minimalist', description: 'Weniger Zeug, mehr Fokus.', icon: '' },
  { value: 'old-school', label: 'Old School', description: 'Feste Strukturen, klare Slots.', icon: '' }
]

export default function LifestyleStep({ formData, updateFormData }: LifestyleStepProps) {
  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <div className="lifestyle-chips">
            {lifestyleOptions.map(option => (
              <div
                key={option.value}
                className={`option-card ${formData.lifestyle === option.value ? 'selected' : ''}`}
                onClick={() => updateFormData({ lifestyle: option.value })}
                title={option.description}
              >
                <div className="option-card-icon">{option.icon}</div>
                <div className="option-card-text">
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{option.label}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{option.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
