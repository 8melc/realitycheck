'use client';

import { useState, useMemo } from 'react';
import { realitycheckEvents } from '../../data/realitycheckEvents';
import EventCard from '../../components/access/EventCard';
import HeroEventCard from '../../components/access/HeroEventCard';
import RestzeitDisplay from '../../components/access/RestzeitDisplay';
import './access.css';

export default function AccessPage() {
  const [activeFormat, setActiveFormat] = useState<string>('Alle');

  // Get all unique formats
  const formatOptions = useMemo(() => {
    const formats = new Set<string>();
    realitycheckEvents.forEach(event => {
      event.format.forEach(format => formats.add(format));
    });
    return ['Alle', ...Array.from(formats).sort()];
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (activeFormat === 'Alle') {
      return realitycheckEvents;
    }
    return realitycheckEvents.filter(event => event.format.includes(activeFormat));
  }, [activeFormat]);

  // Separate highlight and regular events
  const highlightEvents = useMemo(() => {
    return filteredEvents.filter(event => event.isHighlight);
  }, [filteredEvents]);

  const regularEvents = useMemo(() => {
    return filteredEvents.filter(event => !event.isHighlight);
  }, [filteredEvents]);

  return (
    <div className="access-page">
      {/* Title */}
      <h1 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 'clamp(4rem, 8vw, 7rem)',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        ACCESS
      </h1>

      {/* Editorial Intro */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '700',
          color: '#FFF8E7',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Zeit wird Raum. ACCESS ist Erlebnis.
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: '#B8BCC8',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Hier findest du Möglichkeiten, Zeit zu fühlen.<br />
          Limitiert, stur, jenseits von Kalender und FOMO.
        </p>
      </div>

      {/* Hero Event - Balance Check */}
      {highlightEvents.length > 0 && (
        <div className="access-hero-event">
          {highlightEvents.map(event => (
            <HeroEventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Compact Restzeit Display */}
      <div className="access-restzeit">
        <RestzeitDisplay />
      </div>

      {/* Filter Controls */}
      <div className="access-controls">
        <div className="access-format-chips">
          {formatOptions.map(format => (
            <button
              key={format}
              type="button"
              className={`access-chip ${activeFormat === format ? 'is-active' : ''}`}
              onClick={() => setActiveFormat(format)}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Regular Events Grid */}
      <div className="access-grid">
        {regularEvents.map(event => (
          <EventCard key={event.id} event={event} variant="standard" />
        ))}

        {filteredEvents.length === 0 && (
          <div className="access-empty">
            <p>Keine Events für dieses Format. Wähle ein anderes Terrain.</p>
          </div>
        )}
      </div>
    </div>
  );
}