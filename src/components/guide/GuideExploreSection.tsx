import { ThemeItem } from '@/hooks/useGuideState';

interface GuideExploreSectionProps {
  themes: ThemeItem[];
  onExplore?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export default function GuideExploreSection({ themes, onExplore, onRemove }: GuideExploreSectionProps) {
  if (themes.length === 0) {
    return (
      <section className="guide-section" id="explore">
        <div className="guide-section-header">
          <span className="guide-kicker">Explore</span>
          <h2 className="guide-title">Erforschte Welten</h2>
          <p className="guide-subtitle">Welten, die du bereits erkundet hast.</p>
        </div>
        <div className="guide-empty-state">
          <p>Noch keine Welten erkundet.</p>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  return (
    <section className="guide-section" id="explore">
      <div className="guide-section-header">
        <span className="guide-kicker">Explore</span>
        <h2 className="guide-title">Erforschte Welten</h2>
        <p className="guide-subtitle">Welten, die du bereits erkundet hast.</p>
      </div>
      
      <div className="guide-theme-grid">
        {themes.map(theme => (
          <article key={theme.id} className="guide-theme-tile">
            <div 
              className="guide-theme-image" 
              style={{ backgroundImage: `url(${theme.image})` }}
            />
            <div className="guide-theme-overlay">
              <h3 className="guide-theme-title">{theme.title}</h3>
              <p className="guide-theme-subtitle">{theme.subtitle}</p>
              <div className="guide-theme-actions">
                <button 
                  className="guide-btn guide-btn-primary"
                  onClick={() => onExplore?.(theme.id)}
                >
                  {theme.action}
                </button>
                {onRemove && (
                  <button 
                    className="guide-btn guide-btn-ghost"
                    onClick={() => onRemove(theme.id)}
                  >
                    Entfernen
                  </button>
                )}
              </div>
              <p className="guide-theme-date">Erkundet {formatDate(theme.addedAt)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
