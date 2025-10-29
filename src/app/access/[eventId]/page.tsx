'use client';

import { useEffect, useState, use } from 'react';
import { realitycheckEvents } from '../../../data/realitycheckEvents';
import type { RealityCheckEvent } from '../../../data/realitycheckEvents';
import './event-detail.css';

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [event, setEvent] = useState<RealityCheckEvent | null>(null);
  const [birthdate, setBirthdate] = useState<string>('');
  const [targetAge, setTargetAge] = useState<string>('80');
  const [restzeit, setRestzeit] = useState<number>(0);

  useEffect(() => {
    const foundEvent = realitycheckEvents.find(e => e.id === eventId);
    setEvent(foundEvent || null);
  }, [eventId]);

  useEffect(() => {
    const now = new Date();
    const yearEnd = new Date(now.getFullYear(), 11, 31);
    
    let saturdays = 0;
    const tempDate = new Date(now);
    while (tempDate <= yearEnd) {
      if (tempDate.getDay() === 6) {
        saturdays++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
    setRestzeit(saturdays);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Danke! Deine Bewerbung ist eingegangen.');
  };

  if (!event) {
    return (
      <div className="event-detail-page">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1>Event nicht gefunden</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page" style={{ marginTop: '60px' }}>

      {/* Hero Section */}
      <section className="event-hero-section" style={{ paddingTop: '40px' }}>
        <div className="event-hero-container">
          <div className="event-hero-content">
            <div className="event-hero-badge">
              <span className="badge-dot"></span>
              <span>LIVE EVENT · KÖLN</span>
            </div>

            <h1 className="event-hero-title">
              {event.title}
            </h1>

            <p className="event-hero-subtitle">
              {event.pitch}
            </p>

            <div className="event-hero-meta">
              <div className="event-meta-item">
                <div className="event-meta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <path d="M3 9H21M8 2V6M16 2V6"/>
                  </svg>
                </div>
                <div className="event-meta-content">
                  <span className="event-meta-label">WANN</span>
                  <span className="event-meta-value">{event.date}</span>
                </div>
              </div>

              <div className="event-meta-item">
                <div className="event-meta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="event-meta-content">
                  <span className="event-meta-label">WO</span>
                  <span className="event-meta-value">{event.location}</span>
                </div>
              </div>

              <div className="event-meta-item">
                <div className="event-meta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6V12L16 14"/>
                  </svg>
                </div>
                <div className="event-meta-content">
                  <span className="event-meta-label">START</span>
                  <span className="event-meta-value">18:30 Uhr</span>
                </div>
              </div>

              <div className="event-meta-item">
                <div className="event-meta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="9" r="2"/>
                    <circle cx="15" cy="9" r="2"/>
                    <circle cx="9" cy="15" r="2"/>
                    <circle cx="15" cy="15" r="2"/>
                  </svg>
                </div>
                <div className="event-meta-content">
                  <span className="event-meta-label">LIMIT</span>
                  <span className="event-meta-value">{event.rsvp.limit} Plätze</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restzeit Section */}
      <section className="event-restzeit-section">
        <div className="event-restzeit-container">
          <h2 className="event-restzeit-title">Wie viel Autopilot steckt in deinem Leben?</h2>
          <p className="event-restzeit-subtitle">Der Reality Check für dein Zeit-Vermögen</p>
          
          <div className="event-restzeit-content">
            <div className="event-restzeit-text">
              <p>
                Wir reden nicht über dein Bankkonto. Wir reden über dein <strong>Zeit-Konto</strong>. 
                Dein einziges. Der Saldo sinkt jeden Tag. Sommer vergehen, Wochenenden verschwinden.
              </p>
              
              <div className="event-restzeit-highlight">
                <strong>Für deine Zukunft gibt es keinen Kredit.</strong> Finde heraus, wo du überziehst.
              </div>

              <p>
                <strong>Balance Check: FYF Edition</strong> ist kein Seminar. Es ist eine Abrechnung. 
                Drei Stunden voller klarer Impulse und harter Fragen zu deiner persönlichen Bilanz: 
                Zeit, Geld und Kultur.
              </p>
            </div>

            <div className="event-restzeit-sidebar">
              <div className="event-countdown-box">
                <div className="event-countdown-number">{restzeit}</div>
                <div className="event-countdown-label">Samstage bis Silvester</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Form Section */}
      <section className="event-rsvp-section" id="rsvp">
        <div className="event-rsvp-container">
          <h2 className="event-rsvp-title">Dein Platz wartet</h2>
          
          <div className="event-rsvp-card">
            <form onSubmit={handleSubmit} className="event-rsvp-form">
              <div className="event-form-grid">
                <div className="event-form-group">
                  <label className="event-form-label">Vorname</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    className="event-form-input" 
                    placeholder="z.B. Lina" 
                    required 
                  />
                </div>
                <div className="event-form-group">
                  <label className="event-form-label">Nachname</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    className="event-form-input" 
                    placeholder="z.B. König" 
                    required 
                  />
                </div>
                <div className="event-form-group event-form-group--full">
                  <label className="event-form-label">E-Mail</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="event-form-input" 
                    placeholder="du@beispiel.de" 
                    required 
                  />
                </div>
                <div className="event-form-group event-form-group--full">
                  <label className="event-form-label">{event.rsvp.application_hint}</label>
                  <textarea 
                    name="motivation" 
                    className="event-form-textarea" 
                    placeholder="Ein Satz. Kein Bullshit." 
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="event-submit-button">
                Request your Ticket
              </button>
              
              <p className="event-rsvp-note">
                Persönlich ausgewählt. Authentizität schlägt Lebenslauf.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="event-footer">
        <div className="event-footer-content">
          <p>© 2025 Fuck...Your Future · hello@fyf.de</p>
          <div className="event-footer-links">
            <a href="#">Impressum</a>
            <a href="#">Datenschutz</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
