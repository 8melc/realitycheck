'use client'

import { AccessFormData } from '../AccessOnboarding'

interface BioStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

export default function BioStep({ formData, updateFormData }: BioStepProps) {
  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Kurzer Steckbrief über dich
          </label>
          <textarea 
            className="input-field min-h-[120px] resize-none"
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            placeholder="Wer bist du? Was machst du? Was suchst du?"
            maxLength={280}
          />
          <div className="mt-2 flex justify-between items-center text-xs text-rc-steel/60">
            <span>Kurz und knackig für die People-Liste.</span>
            <span>{formData.bio.length}/280</span>
          </div>
        </div>
      </div>
    </div>
  )
}


