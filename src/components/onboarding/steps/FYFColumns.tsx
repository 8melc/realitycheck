'use client'

import { realitycheckPillars, FYFPillar } from '../../../data/realitycheckPillars'
import { useRouter } from 'next/navigation'

export default function FYFColumns() {
  const router = useRouter()

  const handlePillarClick = (pillar: FYFPillar) => {
    router.push(pillar.link)
  }

  return (
    <div className="fyf-columns">
      <div className="columns-container">
        {realitycheckPillars.map((pillar, index) => (
          <div
            key={pillar.key}
            className={`pillar-card pillar-card--${pillar.accent}`}
            onClick={() => handlePillarClick(pillar)}
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className="pillar-visual">
              <div className={`pillar-icon pillar-icon--${pillar.visual}`}>
                {pillar.visual === 'guide' && (
                  <div className="guide-cube">
                    <div className="cube-face cube-face--front"></div>
                    <div className="cube-face cube-face--back"></div>
                    <div className="cube-face cube-face--right"></div>
                    <div className="cube-face cube-face--left"></div>
                    <div className="cube-face cube-face--top"></div>
                    <div className="cube-face cube-face--bottom"></div>
                  </div>
                )}
                {pillar.visual === 'people' && (
                  <div className="people-faces">
                    <div className="face face--1"></div>
                    <div className="face face--2"></div>
                    <div className="face face--3"></div>
                  </div>
                )}
                {pillar.visual === 'access' && (
                  <div className="access-light">
                    <div className="light-beam"></div>
                    <div className="light-source"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pillar-content">
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-subtitle">{pillar.subtitle}</p>
              <p className="pillar-text">{pillar.text}</p>
              
              <div className="pillar-action">
                <span className="action-text">{pillar.action}</span>
                <div className="action-arrow">→</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
