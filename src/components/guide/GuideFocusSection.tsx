import { FeedItem } from '@/hooks/useGuideState';

interface GuideFocusSectionProps {
  items: FeedItem[];
  onActivate?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export default function GuideFocusSection({ items, onActivate, onRemove }: GuideFocusSectionProps) {
  if (items.length === 0) {
    return (
      <section className="guide-section" id="fokus">
        <div className="guide-section-header">
          <span className="guide-kicker">Fokus</span>
          <h2 className="guide-title">Deine Fokusblöcke</h2>
          <p className="guide-subtitle">Kuratiert für Klarheit statt Overload.</p>
        </div>
        <div className="guide-empty-state">
          <p>Noch keine Fokusblöcke aktiviert.</p>
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
    <section className="guide-section" id="fokus">
      <div className="guide-section-header">
        <span className="guide-kicker">Fokus</span>
        <h2 className="guide-title">Deine Fokusblöcke</h2>
        <p className="guide-subtitle">Kuratiert für Klarheit statt Overload.</p>
      </div>
      
      <div className="guide-focus-slider">
        {items.map(item => (
          <article key={item.id} className="guide-focus-card">
            <div 
              className="guide-focus-image" 
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="guide-focus-content">
              <span className="guide-focus-kicker">{item.kicker}</span>
              <h3 className="guide-focus-title">{item.title}</h3>
              {item.meta && item.meta.length > 0 && (
                <p className="guide-focus-meta">{item.meta.join(' · ')}</p>
              )}
              {item.guide && (
                <p className="guide-focus-guide">{item.guide}</p>
              )}
              {item.chips && item.chips.length > 0 && (
                <div className="guide-focus-chips">
                  {item.chips.map((chip, idx) => (
                    <span key={idx} className="guide-chip">{chip}</span>
                  ))}
                </div>
              )}
              {item.addedAt && (
                <p className="guide-focus-date">Hinzugefügt {formatDate(item.addedAt)}</p>
              )}
              <div className="guide-focus-actions">
                {onActivate && (
                  <button 
                    className="guide-btn guide-btn-primary guide-btn-sm"
                    onClick={() => onActivate(item.id)}
                  >
                    Aktivieren
                  </button>
                )}
                {onRemove && (
                  <button 
                    className="guide-btn guide-btn-ghost guide-btn-sm"
                    onClick={() => onRemove(item.id)}
                  >
                    Entfernen
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
