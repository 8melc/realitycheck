'use client'

import SystemIntro from './SystemIntro'
import FYFColumns from './FYFColumns'
// import SystemOutro from './SystemOutro' // commented out

export default function OnboardingDone() {
  // Mock data für die Demo
  const mockFormData = {
    goals: ['Freiheit spüren, bevor ich 50 bin', 'Etwas bauen, das bleibt'],
    goal: 'Mein eigenes Unternehmen gründen und dabei Zeit für Familie haben'
  }

  return (
    <div className="system-complete">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>
      
      <SystemIntro formData={mockFormData} />
      
      {/* Animated Divider */}
      <div className="system-divider"></div>
      
      <FYFColumns />
      {/* SystemOutro component commented out */}
    </div>
  )
}
