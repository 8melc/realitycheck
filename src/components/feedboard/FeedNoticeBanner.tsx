'use client';

import { GuideConversationTurn } from '@/types/feedboard';

interface FeedNoticeBannerProps {
  activeTurn: GuideConversationTurn;
}

export default function FeedNoticeBanner({ activeTurn }: FeedNoticeBannerProps) {
  return (
    <div className="feedboard-guide-notice" role="status" aria-live="polite">
      <div className="feedboard-guide-notice__content">
        <div className="feedboard-guide-notice__icon">🎯</div>
        <div className="feedboard-guide-notice__text">
          <strong>Feed wird vom Guide kuratiert</strong>
          <span className="feedboard-guide-notice__prompt">
            Prompt: {activeTurn.promptEcho} · {activeTurn.items.length} Items aus {activeTurn.items[0]?.clusterId || 'Mixed'}
          </span>
        </div>
      </div>
    </div>
  );
}
