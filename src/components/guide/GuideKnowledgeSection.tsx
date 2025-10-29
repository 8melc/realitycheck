import { FeedItem } from '@/hooks/useGuideState';

interface GuideKnowledgeSectionProps {
  items: FeedItem[];
  onSave?: (item: FeedItem) => void;
  onRemove?: (id: string) => void;
}

export default function GuideKnowledgeSection({ items, onSave, onRemove }: GuideKnowledgeSectionProps) {
  if (items.length === 0) {
    return (
      <section className="guide-section" id="wissen">
        <div className="guide-section-header">
          <span className="guide-kicker">Wissen</span>
          <h2 className="guide-title">Deine Wissenssammlung</h2>
          <p className="guide-subtitle">Essays, Artikel und Content, die dein Verständnis vertiefen.</p>
        </div>
        <div className="guide-empty-state">
          <p>Noch kein Wissen gespeichert.</p>
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
    <section className="guide-section" id="wissen">
      <div className="guide-section-header">
        <span className="guide-kicker">Wissen</span>
        <h2 className="guide-title">Deine Wissenssammlung</h2>
        <p className="guide-subtitle">Essays, Artikel und Content, die dein Verständnis vertiefen.</p>
      </div>
      
      <div className="guide-knowledge-grid">
        {items.map(item => (
          <article key={item.id} className="guide-knowledge-card">
            {item.image && (
              <div 
                className="guide-knowledge-image" 
                style={{ backgroundImage: `url(${item.image})` }}
              />
            )}
            <div className="guide-knowledge-content">
              <span className="guide-knowledge-kicker">{item.kicker}</span>
              <h3 className="guide-knowledge-title">{item.title}</h3>
              {item.meta && item.meta.length > 0 && (
                <p className="guide-knowledge-meta">{item.meta.join(' · ')}</p>
              )}
              {item.guide && (
                <p className="guide-knowledge-guide">{item.guide}</p>
              )}
              {item.chips && item.chips.length > 0 && (
                <div className="guide-knowledge-chips">
                  {item.chips.map((chip, idx) => (
                    <span key={idx} className="guide-chip">{chip}</span>
                  ))}
                </div>
              )}
              {item.addedAt && (
                <p className="guide-knowledge-date">Gespeichert {formatDate(item.addedAt)}</p>
              )}
              <div className="guide-knowledge-actions">
                {onSave && (
                  <button 
                    className="guide-btn guide-btn-primary guide-btn-sm"
                    onClick={() => onSave(item)}
                  >
                    Speichern
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
