import { useState, useEffect } from 'react';
import { GuidePromptHistory } from '@/hooks/useGuideState';
import { useGuideStore } from '@/stores/guideStore';
import { getGuideText } from '@/lib/guideTone';

interface GuideConversationSectionProps {
  prompts: GuidePromptHistory[];
}

export default function GuideConversationSection({ prompts }: GuideConversationSectionProps) {
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
  const { tone } = useGuideStore();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Format dates only on client side to prevent hydration mismatch
  useEffect(() => {
    if (!isClient) return;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return `vor ${diffInHours}h`;
      } else if (diffInHours < 48) {
        return 'gestern';
      } else {
        const days = Math.floor(diffInHours / 24);
        return `vor ${days} Tagen`;
      }
    };

    const formatted = prompts.reduce((acc, item) => {
      acc[item.createdAt] = formatDate(item.createdAt);
      return acc;
    }, {} as Record<string, string>);

    setFormattedDates(formatted);
  }, [prompts, isClient]);

  if (prompts.length === 0) {
    return (
      <section className="rc-card" id="guide">
        <div className="rc-card-header">
          <span className="rc-kicker">Guide Gespräche</span>
          <h2 className="rc-subheading">{getGuideText('conversationTitle', tone)}</h2>
          <p className="rc-microcopy">{getGuideText('conversationSubtitle', tone)}</p>
        </div>
        <div className="rc-subcard">
          <p className="rc-subcard__body">Noch keine Gespräche mit dem Guide geführt.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rc-card" id="guide">
      <div className="rc-card-header">
        <span className="rc-kicker">Guide Gespräche</span>
        <h2 className="rc-subheading">{getGuideText('conversationTitle', tone)}</h2>
        <p className="rc-microcopy">{getGuideText('conversationSubtitle', tone)}</p>
      </div>
      
      <div className="guide-conversation-list">
        {prompts.map((item, idx) => (
          <div key={idx} className="guide-conversation-item">
            <div className="guide-conversation-user">
              <span className="guide-conversation-label">Du</span>
              <div className="guide-conversation-bubble guide-conversation-bubble-user">
                <p>{item.prompt}</p>
              </div>
            </div>
            
            <div className="guide-conversation-guide">
              <span className="guide-conversation-label">Guide</span>
              <div className="guide-conversation-bubble guide-conversation-bubble-guide">
                <p>{item.response}</p>
              </div>
            </div>
            
            <div className="guide-conversation-time">
              {isClient ? (
                <time dateTime={item.createdAt}>
                  {formattedDates[item.createdAt] || 'Lade...'}
                </time>
              ) : (
                <span>Lade...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}