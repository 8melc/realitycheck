'use client'

import Link from 'next/link'
import { useState } from 'react'
import HeaderNav from '../../components/HeaderNav'
import LifeWeeksPage from '../life-weeks/page'
import './landing.css'

export default function HomePage() {
  const [showLifeWeeks, setShowLifeWeeks] = useState(false)

  return (
    <main className="fyf-landing">
      {/* Header */}
      <HeaderNav />

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
                FYF ist kein Tool. Kein Produkt.<br />
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
              onClick={() => setShowLifeWeeks(true)}
            >
              Eigene Wochen anzeigen
            </button>
          </div>
        </div>
      </section>

      {/* Life Weeks Inline Section */}
      {showLifeWeeks && (
        <section className="lifeweeks-inline-section">
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

      {/* Module Cards */}
      <section className="landing-modules">
        <div className="landing-section">
          <div className="modules-grid">
            <Link href="/onboarding?next=/feedboard" className="module-card">
              <div className="module-icon">🧭</div>
              <h3 className="module-title">Guide</h3>
              <p className="module-copy">Kein Algorithmus. Haltung.</p>
              <div className="module-bullets">
                <span>AI-gestützte Empfehlungen</span>
                <span>Kuratierte Inhalte</span>
                <span>Fokus statt Noise</span>
              </div>
            </Link>

            <Link href="/onboarding?next=/people" className="module-card">
              <div className="module-icon">👥</div>
              <h3 className="module-title">People</h3>
              <p className="module-copy">Menschen, die deine Zeitlogik teilen.</p>
              <div className="module-bullets">
                <span>Gemeinsame Werte</span>
                <span>Echte Verbindungen</span>
                <span>Zeitlogik-Matching</span>
              </div>
            </Link>

            <Link href="/onboarding?next=/access" className="module-card">
              <div className="module-icon">🔑</div>
              <h3 className="module-title">Access</h3>
              <p className="module-copy">Orte, die dich fokussieren statt betäuben.</p>
              <div className="module-bullets">
                <span>Fokus-Räume</span>
                <span>Community-Zugang</span>
                <span>Bewusste Umgebung</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-section">
          <div className="footer-content">
            <div className="footer-main">
              <Link href="/life-weeks" className="footer-link">
                Starte deine Zeitlogik
              </Link>
              <blockquote className="footer-quote">
                "Mach Zeit zu deiner strengsten Verbündeten."
              </blockquote>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-heading">FYF</h4>
                <Link href="/life-weeks" className="footer-link-item">Life Weeks</Link>
                <Link href="/people" className="footer-link-item">People</Link>
                <Link href="/access" className="footer-link-item">Access</Link>
                <Link href="/guide" className="footer-link-item">Guide</Link>
              </div>
              
              <div className="footer-column">
                <h4 className="footer-heading">Studio</h4>
                <Link href="/transparenz" className="footer-link-item">Transparenz</Link>
                <Link href="/credits" className="footer-link-item">Credits</Link>
                <a href="mailto:hello@fyf.studio" className="footer-link-item">Kontakt</a>
              </div>
              
              <div className="footer-column">
                <h4 className="footer-heading">Community</h4>
                <Link href="/events" className="footer-link-item">Events</Link>
                <Link href="/profile" className="footer-link-item">Profile</Link>
                <Link href="/feedboard" className="footer-link-item">Feedboard</Link>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p className="footer-copyright">
                © 2025 FYF Studio. Alle Rechte vorbehalten.
              </p>
              <div className="footer-social">
                <span className="footer-tagline">Zeit als Vermögen verstehen</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
