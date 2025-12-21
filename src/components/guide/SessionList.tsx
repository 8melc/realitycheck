'use client';

import { useGuideSessions, type GuideSession } from '@/hooks/useGuideSessions';

interface SessionListProps {
  activeSessionId?: string;
  onSessionSelect: (sessionId: string | undefined) => void;
  onNewSession: () => void;
}

export default function SessionList({ activeSessionId, onSessionSelect, onNewSession }: SessionListProps) {
  const { sessions, isLoading } = useGuideSessions();

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

  return (
    <div className="w-64 border-r border-gray-200 p-3 space-y-2 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Gespräche
        </h2>
      </div>

      {isLoading && <div className="text-xs text-gray-400">Lade Gespräche…</div>}

      <button
        className="w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-medium"
        onClick={onNewSession}
      >
        + Neues Gespräch
      </button>

      <div className="mt-2 space-y-1">
        {sessions.map((session: GuideSession) => (
          <button
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`w-full text-left px-2 py-1 rounded text-sm truncate ${
              activeSessionId === session.id
                ? 'bg-gray-900 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={session.title || 'Unbenanntes Gespräch'}
          >
            <div className="truncate">
              {session.title || 'Unbenanntes Gespräch'}
            </div>
            <div className={`text-xs mt-0.5 ${
              activeSessionId === session.id ? 'text-gray-300' : 'text-gray-400'
            }`}>
              {formatDate(session.updated_at)}
            </div>
          </button>
        ))}
      </div>

      {!isLoading && sessions.length === 0 && (
        <div className="text-xs text-gray-400 text-center py-4">
          Noch keine Gespräche
        </div>
      )}
    </div>
  );
}


