'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GuideConversationTurn } from '@/types/feedboard';
import { getClusterConfig } from '@/lib/guideChatEngine';
import GuideFeedbackButtons from './GuideFeedbackButtons';
import { buildWhyText } from '@/utils/whyText';
import { CLUSTER_LABELS } from '@/constants/clusterMapping';

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
  const [whyOpenItems, setWhyOpenItems] = useState<Set<string>>(new Set());

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

        {turns.map((turn, turnIndex) => {
          const clusterConfig = getClusterConfig(turn.items[0]?.clusterId || 'Fokus & Flow');
          // Ensure unique key: use turn.id if available, otherwise fallback to index
          const turnKey = turn.id || `turn-${turnIndex}`;
          
          return (
            <div key={turnKey} className="guidechat-sidebar__turn">
              {/* User Prompt */}
              <div className="guidechat-sidebar__user">
                <div className="guidechat-sidebar__user-bubble">
                  {turn.prompt}
                </div>
              </div>

              {/* Bot Response */}
              <div className="guidechat-sidebar__bot">
                <div className={`guidechat-sidebar__comment ${turn.isFallback ? 'guidechat-sidebar__comment--fallback' : ''}`}>
                  <ReactMarkdown>
                    {turn.comment}
                  </ReactMarkdown>
                  {turn.isFallback && (
                    <div className="guidechat-sidebar__fallback-badge">
                      Offline-Modus aktiv
                    </div>
                  )}
                </div>

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

                {/* FYF Architektur: 1 kuratiertes Item im Chat */}
                {turn.items.length > 0 && (
                  <div className="guidechat-sidebar__curated-item">
                    {(() => {
                      const item = turn.items[0]; // Nur das erste Item (sollte nur 1 sein)
                      const matchReason = turn.matchReasons.find(mr => mr.itemId === item.id);
                      // Nutze buildWhyText Helper für saubere, vollständige Sätze
                      const whyText = buildWhyText({
                        matchReason: matchReason?.reason ?? null,
                        guideWhy: item?.guideWhy ?? null,
                        lastUserMessage: turn?.prompt ?? null,
                        clusterCode: item?.clusterId ?? null,
                      });
                      
                      // Cluster-Label Mapping (keine internen Keys im UI)
                      const clusterLabel = item.clusterId ? (CLUSTER_LABELS[item.clusterId] || item.clusterId) : null;
                      
                      // Toggle State für "Warum sehe ich das?" (pro Item)
                      const isWhyOpen = whyOpenItems.has(item.id);
                      const toggleWhy = () => {
                        setWhyOpenItems(prev => {
                          const next = new Set(prev);
                          if (next.has(item.id)) {
                            next.delete(item.id);
                          } else {
                            next.add(item.id);
                          }
                          return next;
                        });
                      };
                      
                      return (
                        <div 
                          className="guidechat-sidebar__item"
                          style={{ '--cluster-accent': clusterConfig?.color } as React.CSSProperties}
                        >
                          {/* Thumbnail (wenn verfügbar) */}
                          {item.thumbnail_url && (
                            <div 
                              className="guidechat-sidebar__item-thumbnail"
                              style={{
                                backgroundImage: `url(${item.thumbnail_url})`,
                              } as React.CSSProperties}
                              aria-hidden="true"
                            />
                          )}
                          
                          {/* Header: Format (links) + Dauer (rechts) */}
                          <div className="guidechat-sidebar__item-header">
                            <div className="guidechat-sidebar__item-meta">
                              <span className="guidechat-sidebar__item-format">
                                {item.format}
                              </span>
                              {clusterLabel && (
                                <span className="guidechat-sidebar__pill">
                                  {clusterLabel}
                                </span>
                              )}
                            </div>
                            {item.read_time_minutes && (
                              <span className="guidechat-sidebar__item-duration">
                                {item.read_time_minutes} min
                              </span>
                            )}
                          </div>
                          
                          <h4 className="guidechat-sidebar__item-title">
                            {item.title}
                          </h4>
                          
                          {/* "Warum sehe ich das?" als Toggle (default zu) */}
                          {whyText && (
                            <div className="guidechat-sidebar__item-why-wrapper">
                              <button
                                type="button"
                                className="guidechat-sidebar__item-whyBtn"
                                onClick={toggleWhy}
                              >
                                Warum sehe ich das?
                              </button>
                              {isWhyOpen && (
                                <div className="guidechat-sidebar__item-why">
                                  <p className="guidechat-sidebar__item-why-text">{whyText}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons: Öffnen / Später / Nicht relevant */}
                          <div className="guidechat-sidebar__item-actions">
                            <button
                              type="button"
                              className="guidechat-sidebar__action-btn guidechat-sidebar__action-btn--primary"
                              onClick={() => {
                                console.log('[Guide] Item opened:', item.id);
                                if (item.link && item.link !== '#') {
                                  window.open(item.link, '_blank');
                                }
                              }}
                            >
                              Öffnen
                            </button>

                            <button
                              type="button"
                              className="guidechat-sidebar__action-btn"
                              onClick={() => {
                                console.log('[Guide] Item later:', item.id);
                                // TODO: mark "later" (UI only ok for MVP)
                              }}
                            >
                              Später
                            </button>

                            <button
                              type="button"
                              className="guidechat-sidebar__action-btn guidechat-sidebar__action-btn--ghost"
                              onClick={() => {
                                console.log('[Guide] Item not relevant:', item.id);
                                // TODO: mark "not relevant" (feed_interactions / guide_feedback später)
                              }}
                            >
                              Nicht relevant
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
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
