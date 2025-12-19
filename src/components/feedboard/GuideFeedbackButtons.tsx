'use client';

import { useState } from 'react';

type FeedbackType = 'more' | 'less' | 'stumm' | 'tone_soft' | 'tone_direkt';

interface FeedbackButtonsProps {
  itemId?: string;
  cluster?: string;
}

const sendFeedback = async (payload: { type: FeedbackType; itemId?: string; cluster?: string }) => {
  await fetch('/api/guide/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export default function GuideFeedbackButtons({ itemId, cluster }: FeedbackButtonsProps) {
  const [pending, setPending] = useState<FeedbackType | null>(null);

  const handleClick = async (type: FeedbackType) => {
    try {
      setPending(type);
      await sendFeedback({ type, itemId, cluster });
    } catch (error) {
      console.error('Feedback failed', error);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="guidechat-feedback-buttons">
      <button
        type="button"
        onClick={() => handleClick('more')}
        disabled={pending !== null}
      >
        👍 Mehr davon
      </button>
      <button
        type="button"
        onClick={() => handleClick('less')}
        disabled={pending !== null}
      >
        👎 Weniger davon
      </button>
      <button
        type="button"
        onClick={() => handleClick('stumm')}
        disabled={pending !== null}
      >
        🤐 Stumm
      </button>
    </div>
  );
}
