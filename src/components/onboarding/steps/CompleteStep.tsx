'use client'

import { AccessFormData } from '../AccessOnboarding'
import SystemIntro from './SystemIntro'
import FYFColumns from './FYFColumns'
import SystemOutro from './SystemOutro'

interface CompleteStepProps {
  formData: AccessFormData
}

export default function CompleteStep({ formData }: CompleteStepProps) {
  return (
    <div className="system-complete">
      <SystemIntro formData={formData} />
      <FYFColumns />
      <SystemOutro />
    </div>
  )
}
