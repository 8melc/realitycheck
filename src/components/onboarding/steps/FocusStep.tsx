'use client'

import { AccessFormData } from '../AccessOnboarding'

interface FocusStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

export default function FocusStep({ formData, updateFormData }: FocusStepProps) {
  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Was ist dein aktueller Fokus?
          </label>
          <input 
            type="text" 
            className="input-field"
            value={formData.focusTopic}
            onChange={(e) => updateFormData({ focusTopic: e.target.value })}
            placeholder="Z.B. Digital Nomad Lifestyle, Entrepreneurship..."
          />
          <p className="mt-2 text-xs text-rc-steel/60">
            Ein kurzer Satz oder ein Thema, das dich gerade antreibt.
          </p>
        </div>
      </div>
    </div>
  )
}
