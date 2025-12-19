'use client';

import { useEffect } from 'react';
import { sessionTracker } from '@/lib/session-tracker';
import { createClient } from '@/lib/supabase/client';

/**
 * SessionTrackerProvider - Client Component
 * 
 * Startet und verwaltet User-Sessions für das Tageslimit-Feature.
 * Wird im Root-Layout eingebunden.
 */
export default function SessionTrackerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          // User nicht eingeloggt - keine Session starten
          return;
        }

        if (mounted) {
          // Starte Session für eingeloggten User
          await sessionTracker.startSession(user.id);
        }
      } catch (error) {
        console.error('[SessionTrackerProvider] Error initializing session:', error);
      }
    };

    // Initialisiere Session beim Mount
    initializeSession();

    // Cleanup: Beende Session beim Unmount
    return () => {
      mounted = false;
      if (sessionTracker.isSessionActive()) {
        sessionTracker.endSession();
      }
    };
  }, []);

  return <>{children}</>;
}
