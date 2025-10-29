'use client'

import { realitycheckPillars, FYFPillar } from '../../data/realitycheckPillars'
import { useRouter } from 'next/navigation'

export default function FYFColumns() {
  const router = useRouter()

  const handlePillarClick = (pillar: FYFPillar) => {
    router.push(pillar.link)
  }

  const getIcon = (key: string) => {
    switch (key) {
      case 'guide':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
          </svg>
        )
      case 'people':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        )
      case 'access':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        )
      default:
        return '◯'
    }
  }

  return (
    <div className="fyf-columns">
      <div className="columns-grid">
        {realitycheckPillars.map((pillar) => (
          <div
            key={pillar.key}
            className="column-card"
            onClick={() => handlePillarClick(pillar)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handlePillarClick(pillar)
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Gehe zu ${pillar.title}`}
          >
            <div className="column-icon">
              {getIcon(pillar.key)}
            </div>
            <h3 className="column-title">{pillar.title}</h3>
            <p className="column-description">{pillar.text}</p>
            <div className="column-cta">{pillar.action}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
