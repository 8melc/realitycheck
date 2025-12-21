'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useGuideMessages, type GuideMessage } from '@/hooks/useGuideMessages';

type GuideChatProps = {
  sessionId?: string;
  onSessionChange?: (id: string) => void;
};

export function GuideChat({ sessionId, onSessionChange }: GuideChatProps) {
  const { messages, isLoading, reload } = useGuideMessages(sessionId);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isSending]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          sessionId: sessionId, // kann undefined sein -> neue Session
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Guide chat error:', data);
        if (data.error === 'Session limit reached') {
          alert(`Diese Session hat das Limit von ${data.max_messages} Nachrichten erreicht. Bitte starte ein neues Gespräch.`);
        }
      } else {
        // Neue Session-ID aus Response übernehmen, falls es eine neue war
        if (!sessionId && data.session_id && onSessionChange) {
          onSessionChange(data.session_id);
        }
        setInput('');
        // Nachrichten neu laden
        reload();
      }
    } catch (err) {
      console.error('Guide chat request failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat-Verlauf */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-white">
        {isLoading && <div className="text-xs text-gray-400">Lade Verlauf…</div>}

        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 text-sm py-8">
            Noch keine Nachrichten. Starte das Gespräch!
          </div>
        )}

        {messages.map((m: GuideMessage) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-gray-900 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.message}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 px-3 py-2 flex items-center gap-2 bg-white"
      >
        <input
          type="text"
          className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
          placeholder="Frag deinen FYF Guide…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="text-sm px-3 py-2 rounded-full bg-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? '...' : 'Senden'}
        </button>
      </form>
    </div>
  );
}

