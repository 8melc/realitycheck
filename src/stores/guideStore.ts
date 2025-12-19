import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GuideTone = 'straight' | 'soft';
export type NudgingFrequency = 'high' | 'medium' | 'low' | 'off';

interface GuideState {
  guideTone: GuideTone;
  nudgingFrequency: NudgingFrequency;
  isGuideMuted: boolean;
  isInitialized: boolean;
  setGuideTone: (tone: GuideTone) => void;
  setNudgingFrequency: (frequency: NudgingFrequency) => void;
  toggleGuideMute: () => void;
  initializeFromAPI: () => Promise<void>;
}

// Helper function to sync to API
async function syncToAPI(settings: { guideTone?: GuideTone; nudgingFrequency?: NudgingFrequency; isGuideMuted?: boolean }) {
  try {
    const response = await fetch('/api/profile/guide-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guideTone: settings.guideTone,
        nudgingFrequency: settings.nudgingFrequency,
        isGuideMuted: settings.isGuideMuted,
      }),
    });
    
    if (!response.ok) {
      console.error('[Guide Store] Failed to sync to API:', await response.text());
    }
  } catch (error) {
    console.error('[Guide Store] Error syncing to API:', error);
    // Silently fail - localStorage is fallback
  }
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      guideTone: 'straight',
      nudgingFrequency: 'medium',
      isGuideMuted: false,
      isInitialized: false,
      
      setGuideTone: async (tone) => {
        set({ guideTone: tone });
        // Sync to API (non-blocking)
        syncToAPI({ guideTone: tone });
      },
      
      setNudgingFrequency: async (frequency) => {
        set({ nudgingFrequency: frequency });
        // Sync to API (non-blocking)
        syncToAPI({ nudgingFrequency: frequency });
      },
      
      toggleGuideMute: async () => {
        const newMuted = !get().isGuideMuted;
        set({ isGuideMuted: newMuted });
        // Sync to API (non-blocking)
        syncToAPI({ isGuideMuted: newMuted });
      },
      
      initializeFromAPI: async () => {
        if (get().isInitialized) return; // Already initialized
        
        try {
          const response = await fetch('/api/profile/guide-settings');
          if (response.ok) {
            const data = await response.json();
            set({
              guideTone: data.guideTone || 'straight',
              nudgingFrequency: data.nudgingFrequency || 'medium',
              isGuideMuted: data.isGuideMuted || false,
              isInitialized: true,
            });
          } else {
            // API failed, use localStorage (already loaded by persist)
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('[Guide Store] Error initializing from API:', error);
          // Use localStorage (already loaded by persist)
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'rc-guide-settings',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Reset to default state if version mismatch
        if (version !== 1) {
          return {
            guideTone: 'straight',
            nudgingFrequency: 'medium',
            isGuideMuted: false,
            isInitialized: false,
          };
        }
        return { ...persistedState, isInitialized: false }; // Reset flag on migrate
      },
    }
  )
);

export const getNudgingFrequencyInfo = (frequency: NudgingFrequency) => {
  switch (frequency) {
    case 'high':
      return {
        label: 'Intensiv',
        description: 'Ich checke dich alle paar Stunden. Du willst es ja so.',
        interval: 'Alle 2-3 Stunden',
      };
    case 'medium':
      return {
        label: 'Standard',
        description: 'Ich erinnere dich, wenn es wichtig wird. Nicht nervig, aber konsequent.',
        interval: '2-3x täglich',
      };
    case 'low':
      return {
        label: 'Minimal',
        description: 'Nur wenn es wirklich drauf ankommt. Ich halte mich zurück.',
        interval: '1x täglich',
      };
    case 'off':
      return {
        label: 'Aus',
        description: 'Ich halte die Klappe. Du musst mich aktivieren, wenn du willst.',
        interval: 'Nur bei manueller Aktivierung',
      };
    default:
      return {
        label: 'Standard',
        description: 'Ich erinnere dich, wenn es wichtig wird. Nicht nervig, aber konsequent.',
        interval: '2-3x täglich',
      };
  }
};