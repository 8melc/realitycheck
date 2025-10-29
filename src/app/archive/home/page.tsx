'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import LifeWeeksPage from '../../life-weeks/page'
import './landing.css'

export default function HomePage() {
  const [showLifeWeeks, setShowLifeWeeks] = useState(false)
  const lifeweeksSectionRef = useRef<HTMLElement>(null)

  const handleShowLifeWeeks = () => {
    setShowLifeWeeks(true)
    // Scroll to the section after it renders
    setTimeout(() => {
      lifeweeksSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  return (
    <main className="realitycheck-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-video-container">
          <video 
            className="hero-video" 
            autoPlay 
            muted 
            loop 
            playsInline
            aria-label="Sanduhr Video Background"
          >
            <source src="/docs/assets/Sanduhr_Video_Generiert.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content-container">
          <div className="hero-text-layer">
            <h1 className="hero-headline">
              ZEIT IST KEINE RESSOURCE.<br />
              SIE IST DEIN VERMÖGEN.
            </h1>
            
            <div className="hero-subline-box">
              <p className="hero-subline">
                Reality Check ist kein Tool. Kein Produkt.<br />
                Dein System, um Zeit als Vermögen zu verstehen – und bewusst einzusetzen.
              </p>
            </div>
            
            <p className="hero-claim">
              „Keine App. Keine Anleitung. Haltung pur."
            </p>
          </div>
        </div>
      </section>

      {/* Life-in-Weeks Section */}
      <section className="life-weeks" id="life-weeks">
        <div className="landing-section">
          <div className="life-weeks-content">
            <h2 className="life-weeks-title">LIFE IN WEEKS</h2>
            <p className="life-weeks-copy">
              Deine Zeit läuft. Lass uns das ändern. Visualisiere dein Leben in Wochen und verstehe die Kostbarkeit der Zeit.
            </p>
            <div className="weeks-grid" role="img" aria-label="Life in Weeks - 4000 weeks visualization">
              {Array.from({length: 4000}).map((_, i) => (
                <span 
                  key={i} 
                  className="week-dot" 
                  style={{
                    opacity: i < 2000 ? 0.8 : i < 3000 ? 0.4 : 0.1
                  }}
                />
              ))}
            </div>
            <button 
              className="ttg-button--solid"
              onClick={handleShowLifeWeeks}
            >
              Eigene Wochen anzeigen
            </button>
          </div>
        </div>
      </section>

      {/* Life Weeks Inline Section */}
      {showLifeWeeks && (
        <section ref={lifeweeksSectionRef} className="lifeweeks-inline-section">
          <button 
            className="lifeweeks-close-btn" 
            onClick={() => setShowLifeWeeks(false)}
            aria-label="Visualisierung schließen"
          >
            ×
          </button>
          <LifeWeeksPage />
        </section>
      )}
    </main>
  )
}
