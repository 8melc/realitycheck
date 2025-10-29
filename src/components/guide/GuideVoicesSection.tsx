import { FeedItem } from '@/hooks/useGuideState';

interface GuideVoicesSectionProps {
  items: FeedItem[];
  onPlay?: (id: string) => void;
  onContact?: (id: string) => void;
}

export default function GuideVoicesSection({ items, onPlay, onContact }: GuideVoicesSectionProps) {
  if (items.length === 0) {
    return (
      <section className="guide-section" id="stimmen">
        <div className="guide-section-header">
          <span className="guide-kicker">Stimmen</span>
          <h2 className="guide-title">Menschen & Orte, die inspirieren</h2>
          <p className="guide-subtitle">Stimmen, die Freiheit nicht romantisieren, sondern gestalten.</p>
        </div>
        <div className="guide-empty-state">
          <p>Noch keine Stimmen hinzugefügt.</p>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(dateString));
  };

  return (
    <section className="guide-section" id="stimmen">
      <div className="guide-section-header">
        <span className="guide-kicker">Stimmen</span>
        <h2 className="guide-title">Menschen & Orte, die inspirieren</h2>
        <p className="guide-subtitle">Stimmen, die Freiheit nicht romantisieren, sondern gestalten.</p>
      </div>
      
      <div className="guide-voices-grid">
        {items.map(item => (
          <article key={item.id} className="guide-voice-card">
            {item.image && (
              <div 
                className="guide-voice-image" 
                style={{ backgroundImage: `url(${item.image})` }}
              />
            )}
            <div className="guide-voice-content">
              <span className="guide-voice-kicker">{item.kicker}</span>
              <h3 className="guide-voice-title">{item.title}</h3>
              {item.meta && item.meta.length > 0 && (
                <p className="guide-voice-meta">{item.meta.join(' · ')}</p>
              )}
              {item.guide && (
                <p className="guide-voice-guide">{item.guide}</p>
              )}
              {item.chips && item.chips.length > 0 && (
                <div className="guide-voice-chips">
                  {item.chips.map((chip, idx) => (
                    <span key={idx} className="guide-chip">{chip}</span>
                  ))}
                </div>
              )}
              {item.addedAt && (
                <p className="guide-voice-date">Hinzugefügt {formatDate(item.addedAt)}</p>
              )}
              <div className="guide-voice-actions">
                {onPlay && (
                  <button 
                    className="guide-btn guide-btn-primary guide-btn-sm"
                    onClick={() => onPlay(item.id)}
                  >
                    Play
                  </button>
                )}
                {onContact && (
                  <button 
                    className="guide-btn guide-btn-ghost guide-btn-sm"
                    onClick={() => onContact(item.id)}
                  >
                    Kontakt
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
