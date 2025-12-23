'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { AccessFormData } from '../AccessOnboarding'

interface BasicsStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

export default function BasicsStep({ formData, updateFormData }: BasicsStepProps) {
  // Load email from auth on mount
  useEffect(() => {
    const loadEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email && !formData.email) {
        updateFormData({ email: user.email })
      }
    }
    loadEmail()
  }, [])

  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input 
            type="text" 
            className="input-field"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Dein Name"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">E-Mail</label>
          <input 
            type="email" 
            className="input-field"
            value={formData.email}
            disabled
            placeholder="deine@email.com"
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
          <p className="form-hint" style={{ fontSize: '0.75rem', color: 'var(--rc-steel)', marginTop: '0.25rem' }}>
            E-Mail wird aus deinem Account übernommen
          </p>
        </div>
        <div className="form-group">
          <label className="form-label">Geburtsdatum</label>
          <input 
            type="date" 
            className="input-field"
            value={formData.birthDate}
            onChange={(e) => updateFormData({ birthDate: e.target.value })}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Zielalter</label>
          <input 
            type="number" 
            className="input-field"
            value={formData.targetAge}
            onChange={(e) => updateFormData({ targetAge: e.target.value })}
            placeholder="80" 
            min="18" 
            max="120"
            required
          />
          <p className="form-hint" style={{ fontSize: '0.75rem', color: 'var(--rc-steel)', marginTop: '0.25rem' }}>
            Bis zu welchem Alter möchtest du leben?
          </p>
        </div>
      </div>
    </div>
  )
}
