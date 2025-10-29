'use client'

import { realitycheckPillars } from '../../../data/realitycheckPillars'
import { useRouter } from 'next/navigation'

export default function SystemOutro() {
  const router = useRouter()

  const handlePillarClick = (link: string) => {
    router.push(link)
  }

  return (
    <div className="system-outro">
      <div className="outro-content">
        <div className="system-motto">
          <p className="motto-text">
            FYF denkt Zeit neu – nicht in Stunden, sondern in Haltung.
            <br />
            Wo beginnst du?
          </p>
        </div>
        
        <div className="outro-actions">
          {realitycheckPillars.map((pillar) => (
            <button
              key={pillar.key}
              className={`outro-btn outro-btn--${pillar.accent}`}
              onClick={() => handlePillarClick(pillar.link)}
            >
              {pillar.title}
            </button>
          ))}
        </div>
        
      </div>
    </div>
  )
}
