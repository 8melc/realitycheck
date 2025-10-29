'use client';

import type { CSSProperties } from 'react';
import type { RealityCheckEvent } from '../../data/realitycheckEvents';

type HeroEventCardProps = {
  event: RealityCheckEvent;
};

export default function HeroEventCard({ event }: HeroEventCardProps) {
  const handleClick = () => {
    window.location.href = `/access/${event.id}`;
  };

  return (
    <article className="hero-event-card">
      <div
        className="hero-event-card__image"
        style={
          {
            '--hero-event-visual': event.image ? `url(${event.image})` : 'none',
          } as CSSProperties
        }
      />
      <div className="hero-event-card__overlay" />
      <div className="hero-event-card__content">
        <div className="hero-event-card__badge">LIVE EVENT · KÖLN</div>
        
        <h2 className="hero-event-card__title">{event.title}</h2>
        
        <p className="hero-event-card__pitch">{event.pitch}</p>
        
        <div className="hero-event-card__meta">
          <div className="hero-meta-item">
            <span className="hero-meta-label">Wann</span>
            <span className="hero-meta-value">{event.date}</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Wo</span>
            <span className="hero-meta-value">{event.location}</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Limit</span>
            <span className="hero-meta-value">{event.rsvp.limit} Plätze</span>
          </div>
        </div>

        <div className="hero-event-card__people">
          <strong>Speaker:</strong> {event.people.join(' · ')}
        </div>

        <div className="hero-event-card__restzeit">
          {event.restzeit_info}
        </div>

        <button 
          className="hero-event-card__cta"
          onClick={handleClick}
        >
          Zum Event →
        </button>
      </div>
    </article>
  );
}
