'use client'

import { AccessFormData } from '../AccessOnboarding'

interface InterestsStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

const interests = [
  { value: 'krypto', label: 'Krypto & Blockchain', icon: '' },
  { value: 'nachhaltigkeit', label: 'Nachhaltigkeit', icon: '' },
  { value: 'kunst', label: 'Kunst & Design', icon: '' },
  { value: 'technologie', label: 'Technologie', icon: '' },
  { value: 'philosophie', label: 'Philosophie', icon: '' },
  { value: 'reisen', label: 'Reisen', icon: '' },
  { value: 'fitness', label: 'Fitness & Gesundheit', icon: '' },
  { value: 'musik', label: 'Musik', icon: '' },
  { value: 'buecher', label: 'Bücher & Lesen', icon: '' },
  { value: 'entrepreneurship', label: 'Entrepreneurship', icon: '' },
  { value: 'social', label: 'Social Impact', icon: '' },
  { value: 'kreativitaet', label: 'Kreativität', icon: '' }
]

export default function InterestsStep({ formData, updateFormData }: InterestsStepProps) {
  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest]
    
    updateFormData({ interests: newInterests })
  }

  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <div className="interests-grid">
            {interests.map(interest => (
              <div
                key={interest.value}
                className={`option-card ${formData.interests.includes(interest.value) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest.value)}
              >
                <div className="option-card-icon">{interest.icon}</div>
                <div className="option-card-text">{interest.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
