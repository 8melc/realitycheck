import { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from '@/components/profile/icons';

type Conversation = {
  id: string;
  created_at?: string;
  updated_at?: string;
  title?: string | null;
  last_message_at?: string | null;
  turn_count?: number | null;
  raw?: any;
};

type LogEntry = {
  id: string;
  prompt?: string;
  response?: string;
  user_message?: string;
  guide_response?: string;
  slots_pre?: any;
  slots_post?: any;
  created_at: string;
  feedback_tags?: string[];
};

const formatTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('de-DE') : '–';

export default function GuideHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<Record<string, LogEntry[]>>({});
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadConversations = async () => {
    setLoadingConvos(true);
    try {
      const res = await fetch('/api/guide/conversations', { cache: 'no-store' });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations', error);
    } finally {
      setLoadingConvos(false);
    }
  };

  const loadLogs = async (id: string) => {
    // If logs already loaded for this conversation, don't reload
    if (logs[id]) {
      return;
    }

    setLoadingLogs(prev => ({ ...prev, [id]: true }));
    try {
      // id is now a date string (e.g. "Mon Jan 15 2024"), load all messages for that date
      const res = await fetch(`/api/profile/guide-conversations`, { cache: 'no-store' });
      const data = await res.json();
      
      if (!data || !Array.isArray(data)) {
        setLogs(prev => ({ ...prev, [id]: [] }));
        return;
      }

      // Filter messages for the selected date
      // id is already a date string from toDateString(), so we can compare directly
      const filteredMessages = data.filter((msg: any) => {
        const msgDate = new Date(msg.created_at).toDateString();
        return msgDate === id;
      });

      // Sort by created_at ascending to pair correctly
      filteredMessages.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Transform to log format and pair user/guide messages
      const pairedLogs: LogEntry[] = [];
      for (let i = 0; i < filteredMessages.length; i++) {
        const msg = filteredMessages[i];
        if (msg.role === 'user') {
          // Look for the next guide message
          const guideMsg = filteredMessages[i + 1];
          if (guideMsg && guideMsg.role === 'guide') {
            pairedLogs.push({
              id: msg.id || `log-${i}`,
              prompt: msg.message,
              user_message: msg.message,
              response: guideMsg.message,
              guide_response: guideMsg.message,
              created_at: msg.created_at,
            });
          }
        }
      }

      setLogs(prev => ({ ...prev, [id]: pairedLogs }));
    } catch (error) {
      console.error('Error loading logs', error);
      setLogs(prev => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingLogs(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (expandedId) {
      loadLogs(expandedId);
    }
  }, [expandedId]);

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation when clicking delete
    
    if (!confirm('Diese Konversation wirklich löschen? Alle Nachrichten dieses Tages werden gelöscht.')) {
      return;
    }

    setDeletingId(conversationId);
    try {
      const res = await fetch(`/api/guide/conversations/${encodeURIComponent(conversationId)}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Reload conversations
        await loadConversations();
        // Clear expanded if it was deleted
        if (expandedId === conversationId) {
          setExpandedId(null);
          setLogs(prev => {
            const newLogs = { ...prev };
            delete newLogs[conversationId];
            return newLogs;
          });
        }
      } else {
        const error = await res.json();
        alert(`Fehler beim Löschen: ${error.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Fehler beim Löschen der Konversation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('ALLE Konversationen wirklich löschen? Dies kann nicht rückgängig gemacht werden!')) {
      return;
    }

    try {
      const res = await fetch('/api/guide/conversations/delete-all', {
        method: 'DELETE',
      });
      
      if (res.ok) {
        await loadConversations();
        setExpandedId(null);
        setLogs({});
      } else {
        const error = await res.json();
        alert(`Fehler beim Löschen: ${error.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Delete all error:', error);
      alert('Fehler beim Löschen aller Konversationen');
    }
  };

  return (
    <section className="rc-card" aria-labelledby="guide-history-heading">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 id="guide-history-heading" className="rc-subheading">
            Guide-History
          </h2>
          <p className="rc-microcopy">Letzte Gespräche aus /api/guide/chat.</p>
        </div>
        {conversations.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="text-xs text-rc-steel hover:text-rc-coral transition px-2 py-1 rounded border border-rc-border hover:border-rc-coral"
            title="Alle Konversationen löschen"
          >
            Alle löschen
          </button>
        )}
      </header>

      <div className="mt-6 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <span className="rc-subcard__title text-sm">Sessions</span>
          {loadingConvos && <span className="rc-microcopy">lädt…</span>}
        </div>
        {conversations.length === 0 && (
          <span className="rc-chip rc-chip--ghost">Keine Gespräche</span>
        )}
        {conversations.map((c) => {
          const isExpanded = expandedId === c.id;
          const conversationLogs = logs[c.id] || [];
          const isLoading = loadingLogs[c.id] || false;

          return (
            <div
              key={c.id}
              className="rounded-md border border-rc-border bg-transparent overflow-hidden"
            >
              {/* Session Header - Clickable */}
              <div
                className={`relative flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  isExpanded
                    ? 'bg-rc-layer border-b border-rc-border'
                    : 'hover:bg-rc-layer/50'
                }`}
                onClick={() => {
                  if (isExpanded) {
                    setExpandedId(null);
                  } else {
                    setExpandedId(c.id);
                  }
                }}
              >
                {/* Chevron Icon */}
                <div className="flex-shrink-0 text-rc-steel">
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Session Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-rc-cream truncate">
                    {c.title || 'Ohne Titel'}
                  </div>
                  <div className="rc-microcopy text-rc-steel">
                    {formatTime((c as any).last_message_at || c.updated_at || c.created_at)} ·{' '}
                    {c.turn_count ?? (c as any).turns_count ?? 0} Turns
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  disabled={deletingId === c.id}
                  className="flex-shrink-0 text-rc-steel hover:text-rc-coral transition disabled:opacity-50 p-1"
                  title="Konversation löschen"
                  aria-label="Konversation löschen"
                >
                  {deletingId === c.id ? '…' : <TrashIcon className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded Content - Turns */}
              {isExpanded && (
                <div className="bg-rc-layer/30 border-t border-rc-border">
                  <div className="p-3">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <span className="rc-microcopy text-rc-steel">Lade Turns…</span>
                      </div>
                    ) : conversationLogs.length === 0 ? (
                      <span className="rc-chip rc-chip--ghost">Keine Nachrichten</span>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                        {conversationLogs.map((log) => (
                          <div
                            key={log.id}
                            className="rounded-md border border-rc-border bg-rc-layer/50 p-3 text-sm"
                          >
                            <div className="text-rc-steel rc-microcopy mb-1">
                              {formatTime(log.created_at)}
                            </div>
                            <div className="mb-2 break-words">
                              <span className="font-semibold text-rc-cream">User:</span>{' '}
                              <span className="text-rc-cream">
                                {log.prompt ?? log.user_message ?? '—'}
                              </span>
                            </div>
                            <div className="mb-2 break-words">
                              <span className="font-semibold text-rc-cream">Guide:</span>{' '}
                              <span className="text-rc-cream">
                                {log.response ?? log.guide_response ?? '—'}
                              </span>
                            </div>
                            {log.feedback_tags && log.feedback_tags.length > 0 && (
                              <div className="rc-microcopy text-rc-steel">
                                Feedback: {log.feedback_tags.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
