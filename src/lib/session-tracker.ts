// src/lib/session-tracker.ts
import { createClient } from '@/lib/supabase/client';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minuten
const ACTIVITY_CHECK_INTERVAL_MS = 60 * 1000; // 1 Minute

export class SessionTracker {
  private sessionId: string | null = null;
  private activityTimeout: NodeJS.Timeout | null = null;
  private activityCheckInterval: NodeJS.Timeout | null = null;
  private lastActivity: Date = new Date();
  private sessionStart: Date | null = null;
  private userId: string | null = null;
  private isTracking: boolean = false;

  /**
   * Startet eine neue Session für den User
   */
  async startSession(userId: string): Promise<void> {
    if (this.isTracking && this.userId === userId) {
      // Session läuft bereits für diesen User
      return;
    }

    // Beende vorherige Session falls vorhanden
    if (this.isTracking) {
      await this.endSession();
    }

    this.userId = userId;
    this.lastActivity = new Date();
    this.sessionStart = new Date();

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_start: this.sessionStart.toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('[SessionTracker] Error starting session:', error);
        return;
      }

      this.sessionId = data.id;
      this.isTracking = true;

      // Starte Activity-Listener
      this.setupActivityListeners();
      
      // Starte Inaktivitäts-Check
      this.startInactivityCheck();

      console.log('[SessionTracker] Session started:', this.sessionId);
    } catch (error) {
      console.error('[SessionTracker] Error starting session:', error);
    }
  }

  /**
   * Aktualisiert die letzte Aktivität
   */
  async updateActivity(): Promise<void> {
    if (!this.isTracking || !this.sessionId) {
      return;
    }

    const now = new Date();
    const timeSinceLastActivity = now.getTime() - this.lastActivity.getTime();

    // Wenn mehr als 30 Minuten inaktiv: Session beenden und neue starten
    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT_MS) {
      console.log('[SessionTracker] Inactivity detected, restarting session');
      if (this.userId) {
        await this.endSession();
        await this.startSession(this.userId);
      }
      return;
    }

    this.lastActivity = now;

    // Reset Inaktivitäts-Timer
    this.resetInactivityTimeout();
  }

  /**
   * Beendet die aktuelle Session
   */
  async endSession(): Promise<void> {
    if (!this.isTracking || !this.sessionId || !this.sessionStart) {
      return;
    }

    try {
      const now = new Date();
      const durationMs = now.getTime() - this.sessionStart.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));

      const supabase = createClient();
      const { error } = await supabase
        .from('user_sessions')
        .update({
          session_end: now.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq('id', this.sessionId);

      if (error) {
        console.error('[SessionTracker] Error ending session:', error);
      } else {
        console.log('[SessionTracker] Session ended:', this.sessionId, `(${durationMinutes} minutes)`);
      }
    } catch (error) {
      console.error('[SessionTracker] Error ending session:', error);
    } finally {
      // Cleanup
      this.cleanup();
    }
  }

  /**
   * Setup Event-Listener für User-Aktivität
   */
  private setupActivityListeners(): void {
    const handleActivity = () => {
      this.updateActivity();
    };

    // Event-Listener für verschiedene Aktivitäten
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    // Beim Tab-Close Session beenden
    window.addEventListener('beforeunload', () => {
      if (this.isTracking) {
        // Verwende sendBeacon für zuverlässiges Senden beim Tab-Close
        this.endSessionSync();
      }
    });

    // Bei Visibility-Change (Tab-Wechsel)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab ist versteckt - könnte Session beenden, aber wir warten auf Inaktivität
      } else {
        // Tab ist wieder sichtbar - aktualisiere Aktivität
        this.updateActivity();
      }
    });
  }

  /**
   * Startet den Inaktivitäts-Check
   */
  private startInactivityCheck(): void {
    // Prüfe regelmäßig auf Inaktivität
    this.activityCheckInterval = setInterval(() => {
      if (!this.isTracking) return;

      const now = new Date();
      const timeSinceLastActivity = now.getTime() - this.lastActivity.getTime();

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT_MS) {
        // Inaktivität erkannt
        if (this.userId) {
          this.endSession().then(() => {
            if (this.userId) {
              this.startSession(this.userId);
            }
          });
        }
      }
    }, ACTIVITY_CHECK_INTERVAL_MS);

    this.resetInactivityTimeout();
  }

  /**
   * Setzt den Inaktivitäts-Timer zurück
   */
  private resetInactivityTimeout(): void {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }

    this.activityTimeout = setTimeout(() => {
      if (this.isTracking && this.userId) {
        this.endSession().then(() => {
          if (this.userId) {
            this.startSession(this.userId);
          }
        });
      }
    }, INACTIVITY_TIMEOUT_MS);
  }

  /**
   * Synchrones Beenden der Session (für beforeunload)
   */
  private endSessionSync(): void {
    if (!this.sessionId || !this.sessionStart) {
      return;
    }

    const now = new Date();
    const durationMs = now.getTime() - this.sessionStart.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    // Verwende sendBeacon für zuverlässiges Senden beim Tab-Close
    const data = JSON.stringify({
      sessionId: this.sessionId,
      sessionEnd: now.toISOString(),
      durationMinutes,
    });

    // Versuche über API-Endpoint zu senden
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/session/end', data);
    }

    this.cleanup();
  }

  /**
   * Cleanup: Entfernt alle Listener und Timer
   */
  private cleanup(): void {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
    }

    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }

    this.sessionId = null;
    this.sessionStart = null;
    this.isTracking = false;
  }

  /**
   * Gibt die aktuelle Session-ID zurück
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Prüft, ob aktuell eine Session läuft
   */
  isSessionActive(): boolean {
    return this.isTracking;
  }
}

// Singleton-Instanz
export const sessionTracker = new SessionTracker();
