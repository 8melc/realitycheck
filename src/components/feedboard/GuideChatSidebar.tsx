'use client';

import { useEffect, useRef, useState } from 'react';
import { GuideConversationTurn } from '@/types/feedboard';
import { getClusterConfig } from '@/lib/guideChatEngine';

interface GuideChatSidebarProps {
  isOpen: boolean;
  turns: GuideConversationTurn[];
  activeTurn: GuideConversationTurn | null;
  prompt: string;
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: (prompt: string) => void;
  onFollowUpSelect: (text: string) => void;
  onReset: () => void;
}

export default function GuideChatSidebar({
  isOpen,
  turns,
  activeTurn,
  prompt,
  isLoading,
  onPromptChange,
  onSubmit,
  onFollowUpSelect,
  onReset
}: GuideChatSidebarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-focus composer when sidebar opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // ESC key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onReset();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onReset]);

  // Auto-scroll to bottom when new turn is added
  useEffect(() => {
    if (historyRef.current && turns.length > 0) {
      historyRef.current.scrollTo({
        top: historyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [turns.length]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ⌘+Enter or Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        onSubmit(prompt);
      }
    }
  };

  const handleFollowUpClick = (followUpText: string) => {
    onFollowUpSelect(followUpText);
  };

  return (
    <aside
      className={`guidechat-sidebar ${isOpen ? 'is-open' : ''}`}
      aria-labelledby="guidechat-title"
      role="complementary"
    >
      {/* Header */}
      <div className="guidechat-sidebar__header">
        <div className="guidechat-sidebar__title-row">
          <h2 id="guidechat-title" className="guidechat-sidebar__title">
            Guide
          </h2>
          <div className="guidechat-sidebar__title-actions">
            <span className="guidechat-sidebar__status">Live</span>
            <button
              type="button"
              className="guidechat-sidebar__close"
              onClick={onReset}
              aria-label="Sidebar schließen"
            >
              ×
            </button>
          </div>
        </div>
        <button
          type="button"
          className="guidechat-sidebar__reset"
          onClick={onReset}
          disabled={turns.length === 0}
        >
          Reset Feed
        </button>
      </div>

      {/* Conversation History */}
      <div 
        ref={historyRef}
        className="guidechat-sidebar__history"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {turns.length === 0 && (
          <div className="guidechat-sidebar__empty">
            <p>Stell eine Frage, um deinen Feed zu kuratieren.</p>
            <p className="guidechat-sidebar__hint">
              Beispiel: "Was killt meinen Fokus?"
            </p>
          </div>
        )}

        {turns.map((turn) => {
          const clusterConfig = getClusterConfig(turn.items[0]?.clusterId || 'Fokus & Flow');
          
          return (
            <div key={turn.id} className="guidechat-sidebar__turn">
              {/* User Prompt */}
              <div className="guidechat-sidebar__user">
                <div className="guidechat-sidebar__user-bubble">
                  {turn.prompt}
                </div>
              </div>

              {/* Bot Response */}
              <div className="guidechat-sidebar__bot">
                <blockquote className="guidechat-sidebar__comment">
                  {turn.comment}
                </blockquote>

                {/* Follow-up Question */}
                {turn.followUp && (
                  <div className="guidechat-sidebar__followup">
                    <p className="guidechat-sidebar__followup-label">
                      Guide fragt:
                    </p>
                    <button
                      type="button"
                      className="guidechat-sidebar__followup-chip"
                      onClick={() => handleFollowUpClick(turn.followUp!)}
                    >
                      {turn.followUp}
                    </button>
                  </div>
                )}

                {/* Items with "Why this?" */}
                {turn.items.length > 0 && (
                  <ul className="guidechat-sidebar__items">
                    {turn.items.map((item, index) => {
                      const matchReason = turn.matchReasons.find(mr => mr.itemId === item.id);
                      
                      return (
                        <li 
                          key={item.id} 
                          className="guidechat-sidebar__item"
                          style={{ '--cluster-accent': clusterConfig?.color } as React.CSSProperties}
                        >
                          <div className="guidechat-sidebar__item-header">
                            <span className="guidechat-sidebar__item-format">
                              {item.format}
                            </span>
                            <span className="guidechat-sidebar__item-cluster">
                              {item.clusterId}
                            </span>
                          </div>
                          
                          <h4 className="guidechat-sidebar__item-title">
                            {item.title}
                          </h4>
                          
                          {matchReason && (
                            <p className="guidechat-sidebar__item-why">
                              <strong>Warum?</strong> {matchReason.reason}
                            </p>
                          )}
                          
                          {item.link && item.link !== '#' && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="guidechat-sidebar__item-link"
                            >
                              Ansehen →
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="guidechat-sidebar__loading">
            <div className="guidechat-sidebar__loading-spinner" />
            <span>Guide denkt nach...</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <form 
        className="guidechat-sidebar__composer"
        onSubmit={handleSubmit}
      >
        <div className="guidechat-sidebar__composer-wrapper">
          <textarea
            ref={textareaRef}
            className="guidechat-sidebar__textarea"
            placeholder="Frag den Guide..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            rows={1}
            aria-label="Guide-Prompt eingeben"
          />
          
          <button
            type="submit"
            className="guidechat-sidebar__send"
            disabled={!prompt.trim() || isLoading}
            aria-label="Absenden"
          >
            {isLoading ? '...' : 'Senden'}
          </button>
        </div>
        
        <p className="guidechat-sidebar__hint">
          ⌘+Enter zum Senden
        </p>
      </form>
    </aside>
  );
}

