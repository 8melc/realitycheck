'use client';

import type { CSSProperties } from 'react';
import type { RealityCheckEvent } from '../../data/realitycheckEvents';

type EventCardProps = {
  event: RealityCheckEvent;
  variant: 'hero' | 'standard';
};

export default function EventCard({ event, variant }: EventCardProps) {
  const cardClass = [
    'event-card',
    `event-card--${variant}`,
  ].join(' ');

  const handleClick = () => {
    window.location.href = `/access/${event.id}`;
  };

  const content = (
    <>
      <div
        className="event-card__visual"
        style={
          {
            '--event-card-visual': event.image ? `url(${event.image})` : 'none',
          } as CSSProperties
        }
        aria-hidden="true"
      />

      <div className="event-card__overlay" />

      <div className="event-card__body">
        <div className="event-card__format-badge">
          {event.format.map((format, index) => (
            <span 
              key={index} 
              className={format === "Featured Event" ? "featured-event-chip" : ""}
            >
              {format}
            </span>
          ))}
        </div>

        <div className="event-card__meta">
          <span className="event-card__date">{event.date}</span>
          <span className="event-card__location">{event.location}</span>
        </div>

        <h3 className="event-card__title">{event.title}</h3>

        <p className="event-card__pitch">{event.pitch}</p>

        <div className="event-card__why">
          <strong>{event.why_now}</strong>
        </div>

        <div className="event-card__people">
          {event.people.join(' · ')}
        </div>

        <div className="event-card__footer">
          <span className="event-card__restzeit">{event.restzeit_info}</span>
          <button 
            className="event-card__cta"
            onClick={handleClick}
          >
            {event.rsvp.limit} Plätze · RSVP
          </button>
        </div>
      </div>
    </>
  );

  return (
    <article className={cardClass}>
      {content}
    </article>
  );
}
