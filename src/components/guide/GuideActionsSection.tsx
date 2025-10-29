import { useState } from 'react';
import { FeedItem } from '@/hooks/useGuideState';
import { useGuideStore } from '@/stores/guideStore';
import { getGuideText } from '@/lib/guideTone';

interface GuideActionsSectionProps {
  items: FeedItem[];
  onToggle?: (id: string) => void;
  onReminder?: (id: string) => void;
}

export default function GuideActionsSection({ items, onToggle, onReminder }: GuideActionsSectionProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const { tone } = useGuideStore();

  if (items.length === 0) {
    return (
      <section className="rc-card" id="aktionen">
        <div className="rc-card-header">
          <span className="rc-kicker">Aktionen</span>
          <h2 className="rc-subheading">{getGuideText('actionsTitle', tone)}</h2>
          <p className="rc-microcopy">{getGuideText('actionsSubtitle', tone)}</p>
        </div>
        <div className="rc-subcard">
          <p className="rc-subcard__body">Noch keine Aktionen hinzugefügt.</p>
        </div>
      </section>
    );
  }

  const handleToggle = (id: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    onToggle?.(id);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(dateString));
  };

  return (
    <section className="rc-card" id="aktionen">
      <div className="rc-card-header">
        <span className="rc-kicker">Aktionen</span>
        <h2 className="rc-subheading">{getGuideText('actionsTitle', tone)}</h2>
        <p className="rc-microcopy">{getGuideText('actionsSubtitle', tone)}</p>
      </div>
      
      <div className="guide-actions-list">
        {items.map(item => {
          const isCompleted = completedItems.has(item.id);
          
          return (
            <div key={item.id} className={`guide-action-row ${isCompleted ? 'completed' : ''}`}>
              <label className="guide-action-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => handleToggle(item.id)}
                  className="guide-action-checkbox"
                />
                <span className="guide-action-checkmark" />
              </label>
              
              <div className="guide-action-content">
                <h3 className="guide-action-title">{item.title}</h3>
                <p className="guide-action-meta">{item.meta.join(' · ')}</p>
                {item.guide && (
                  <p className="guide-action-guide">{item.guide}</p>
                )}
                {item.chips && item.chips.length > 0 && (
                  <div className="guide-action-chips">
                    {item.chips.map((chip, idx) => (
                      <span key={idx} className="guide-chip">{chip}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="guide-action-actions">
                {onReminder && (
                  <button 
                    className="guide-btn guide-btn-ghost guide-btn-sm"
                    onClick={() => onReminder(item.id)}
                  >
                    Reminder
                  </button>
                )}
              </div>
              
              {item.addedAt && (
                <p className="guide-action-date">{formatDate(item.addedAt)}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}