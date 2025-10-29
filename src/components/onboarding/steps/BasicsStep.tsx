'use client'

import { AccessFormData } from '../AccessOnboarding'

interface BasicsStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

export default function BasicsStep({ formData, updateFormData }: BasicsStepProps) {
  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <input 
            type="text" 
            className="input-field"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Dein Name"
          />
        </div>
        <div className="form-group">
          <input 
            type="email" 
            className="input-field"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="deine@email.com"
          />
        </div>
        <div className="form-group">
          <input 
            type="date" 
            className="input-field"
            value={formData.birthDate}
            onChange={(e) => updateFormData({ birthDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <input 
            type="number" 
            className="input-field"
            value={formData.targetAge}
            onChange={(e) => updateFormData({ targetAge: e.target.value })}
            placeholder="Wunsch-Zielalter (optional)" 
            min="18" 
            max="120"
          />
        </div>
      </div>
    </div>
  )
}
