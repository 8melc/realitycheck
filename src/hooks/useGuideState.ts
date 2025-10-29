import { useState, useEffect, useCallback } from 'react';

export type FeedItem = {
  id: string;
  image: string;
  kicker: string;      // "Fokus", "Essay", "Stimme", etc.
  title: string;
  meta: string[];      // ["5 Min Lesezeit", "Medium.com"]
  guide: string;       // Guide commentary
  chips: string[];     // Tags
  addedAt: string;     // ISO timestamp
  source?: 'feedboard' | 'guide' | 'manual';
};

export type ThemeItem = {
  id: string;
  title: string;
  subtitle: string;
  action: string;
  image: string;
  addedAt: string;
};

export type GuidePromptHistory = {
  prompt: string;
  response: string;
  createdAt: string;
};

export type GuideState = {
  focusBlocks: FeedItem[];
  knowledgeItems: FeedItem[];
  voiceItems: FeedItem[];
  actionItems: FeedItem[];
  exploredThemes: ThemeItem[];
  guidePrompts: GuidePromptHistory[];
};

const STORAGE_KEY = 'realitycheck-guide-dashboard';

// TODO: Convert to API endpoint /api/feedboard/images for live loading
// feedboard_images.json converted to static constant for client-side use
const FEEDBOARD_IMAGES_DATA = [
  { title: 'Your Life in Weeks', filename: 'Reality Check_01_Life-in-Weeks.jpg', url: 'http://localhost:8080/Reality Check_01_Life-in-Weeks.jpg' },
  { title: 'Four Thousand Weeks', filename: 'Reality Check_02_FourThousandWeeks.jpg', url: 'http://localhost:8080/Reality Check_02_FourThousandWeeks.jpg' },
  { title: 'Frankl Quote', filename: 'Reality Check_03_Frankl-Quote.jpg', url: 'http://localhost:8080/Reality Check_03_Frankl-Quote.jpg' },
  { title: 'Bali Coworking', filename: 'Reality Check_04_Bali-Coworking.jpg', url: 'http://localhost:8080/Reality Check_04_Bali-Coworking.jpg' },
  { title: 'Nomad Podcast', filename: 'Reality Check_05_NomadPodcast.jpg', url: 'http://localhost:8080/Reality Check_05_NomadPodcast.jpg' },
  { title: 'Jenny Odell', filename: 'Reality Check_06_Jenny-Odell.jpg', url: 'http://localhost:8080/Reality Check_06_Jenny-Odell.jpg' },
  { title: 'Cal Newport', filename: 'Reality Check_07_Cal-Newport.jpg', url: 'http://localhost:8080/Reality Check_07_Cal-Newport.jpg' },
  { title: 'Farnam Street Attention', filename: 'Reality Check_08_FarnamStreet-Attention.jpg', url: 'http://localhost:8080/Reality Check_08_FarnamStreet-Attention.jpg' },
  { title: 'Reality Check Limit Freedom', filename: 'Reality Check_09_Reality Check-Limit-Freedom.jpg', url: 'http://localhost:8080/Reality Check_09_Reality Check-Limit-Freedom.jpg' },
  { title: 'Money as Energy', filename: 'Reality Check_10_Money-as-Energy.jpg', url: 'http://localhost:8080/Reality Check_10_Money-as-Energy.jpg' },
  { title: 'Hidden Brain Enough', filename: 'Reality Check_11_HiddenBrain-Enough.jpg', url: 'http://localhost:8080/Reality Check_11_HiddenBrain-Enough.jpg' },
  { title: 'Psychology of Money', filename: 'Reality Check_12_Psychology-of-Money.jpg', url: 'http://localhost:8080/Reality Check_12_Psychology-of-Money.jpg' },
  { title: 'Psyche Meaning', filename: 'Reality Check_13_Psyche-Meaning.jpg', url: 'http://localhost:8080/Reality Check_13_Psyche-Meaning.jpg' },
  { title: 'On Being Purpose', filename: 'Reality Check_14_OnBeing-Purpose.jpg', url: 'http://localhost:8080/Reality Check_14_OnBeing-Purpose.jpg' },
  { title: 'Ikigai Book', filename: 'Reality Check_15_Ikigai-Book.jpg', url: 'http://localhost:8080/Reality Check_15_Ikigai-Book.jpg' },
  { title: 'Show Your Work', filename: 'Reality Check_16_Show-Your-Work.jpg', url: 'http://localhost:8080/Reality Check_16_Show-Your-Work.jpg' },
  { title: 'Art Resistance', filename: 'Reality Check_17_Art-Resistance.jpg', url: 'http://localhost:8080/Reality Check_17_Art-Resistance.jpg' },
  { title: 'Erykah Badu – Didn\'t Cha Know', filename: 'Reality Check_18_Erykah-Badu.jpg', url: 'http://localhost:8080/Reality Check_18_Erykah-Badu.jpg' },
];

// Initial state with mock data merged from all sources
const getInitialState = (): GuideState => {
  // Convert feedboard_images to knowledge items
  const knowledgeItems: FeedItem[] = FEEDBOARD_IMAGES_DATA.slice(0, 8).map((img, idx) => ({
    id: `knowledge-${idx}`,
    image: img.url,
    kicker: 'Wissen',
    title: img.title,
    meta: ['5 Min Lesezeit', 'Reality Check Content'],
    guide: 'Dieser Content kann dein Verständnis von Freiheit vertiefen.',
    chips: ['Mindset', 'Fokus', 'Zeit'],
    addedAt: new Date().toISOString(),
    source: 'feedboard' as const,
  }));

  // Convert SLIDER_CARDS to focus blocks (using placeholder images)
  const focusBlocks: FeedItem[] = [
    {
      id: 'focus-1',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
      kicker: 'Fokus',
      title: 'Pop Ready-Made',
      meta: ['Bilder der Macht'],
      guide: 'Diese Visualisierung kann dein Freedom-Mindset stärken.',
      chips: ['Visual', 'Kunst'],
      addedAt: new Date().toISOString(),
      source: 'feedboard',
    },
    {
      id: 'focus-2',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
      kicker: 'Fokus',
      title: 'Der Spiegel starrt dich an',
      meta: ['Marzia Miglioras Liebeslieder'],
      guide: 'Künstlerische Perspektive auf Identität und Freiheit.',
      chips: ['Kunst', 'Identität'],
      addedAt: new Date().toISOString(),
      source: 'feedboard',
    },
  ];

  // Voice items from GALLERY_ITEMS
  const voiceItems: FeedItem[] = [
    {
      id: 'voice-1',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
      kicker: 'Stimme',
      title: 'NEMO Science Museum',
      meta: ['Niederlande', 'Amsterdam'],
      guide: 'Hands-on Freiheit, gestaltet von Visionären.',
      chips: ['Museum', 'Freiheit'],
      addedAt: new Date().toISOString(),
      source: 'feedboard',
    },
    {
      id: 'voice-2',
      image: 'https://images.unsplash.com/photo-1529429617124-aee3d4d0404b?auto=format&fit=crop&w=800&q=80',
      kicker: 'Stimme',
      title: 'National Museum of Nature',
      meta: ['Japan', 'Tokyo'],
      guide: 'Struktur und Natur koexistieren.',
      chips: ['Japan', 'Natur'],
      addedAt: new Date().toISOString(),
      source: 'feedboard',
    },
  ];

  // Action items (mock)
  const actionItems: FeedItem[] = [
    {
      id: 'action-1',
      image: '',
      kicker: 'Aktion',
      title: 'Zeit-Audit durchführen',
      meta: ['Diese Woche'],
      guide: 'Reflektiere deine Zeitnutzung der letzten Woche.',
      chips: ['Reflexion', 'Fokus'],
      addedAt: new Date().toISOString(),
      source: 'manual',
    },
    {
      id: 'action-2',
      image: '',
      kicker: 'Aktion',
      title: 'Freiheits-Framework definieren',
      meta: ['Nächste Woche'],
      guide: 'Was bedeutet Freiheit konkret für dich?',
      chips: ['Definition', 'Strategie'],
      addedAt: new Date().toISOString(),
      source: 'manual',
    },
  ];

  // Explored themes from THEME_ITEMS
  const exploredThemes: ThemeItem[] = [
    {
      id: 'theme-1',
      title: 'Die Welt der Maya erkunden',
      subtitle: 'Eine Reise in die Vergangenheit',
      action: 'Erkunden',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      addedAt: new Date().toISOString(),
    },
    {
      id: 'theme-2',
      title: 'Lerne die Menschen Kenias kennen',
      subtitle: 'Aus der Wiege der Menschheit',
      action: 'Entdecken',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      addedAt: new Date().toISOString(),
    },
  ];

  // Guide prompt history (mock)
  const guidePrompts: GuidePromptHistory[] = [
    {
      prompt: 'Was bedeutet Freiheit für mich?',
      response: 'Freiheit ist das Privileg, über deine eigene Zeit zu entscheiden. Reflektiere: Wofür lebst du wirklich?',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    },
    {
      prompt: 'Wie plane ich 3 Monate Freiheit?',
      response: 'Starte mit einem klaren Ziel. Definiere dein finanzielles Polster und teste dein Mindset jetzt.',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
  ];

  return {
    focusBlocks,
    knowledgeItems,
    voiceItems,
    actionItems,
    exploredThemes,
    guidePrompts,
  };
};

export const useGuideState = () => {
  const [state, setState] = useState<GuideState>(getInitialState());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      }
    } catch (err) {
      console.error('Failed to load guide state:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to save guide state:', err);
      }
    }
  }, [state, isLoaded]);

  // Helper to check for duplicates
  const findIndex = (items: FeedItem[] | ThemeItem[], id: string) => {
    return items.findIndex(item => item.id === id);
  };

  // Focus operations
  const addFocus = useCallback((item: Omit<FeedItem, 'addedAt'>) => {
    setState(prev => {
      if (findIndex(prev.focusBlocks, item.id) !== -1) return prev;
      return {
        ...prev,
        focusBlocks: [...prev.focusBlocks, { ...item, addedAt: new Date().toISOString() }],
      };
    });
  }, []);

  const removeFocus = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      focusBlocks: prev.focusBlocks.filter(item => item.id !== id),
    }));
  }, []);

  // Knowledge operations
  const addKnowledge = useCallback((item: Omit<FeedItem, 'addedAt'>) => {
    setState(prev => {
      if (findIndex(prev.knowledgeItems, item.id) !== -1) return prev;
      return {
        ...prev,
        knowledgeItems: [...prev.knowledgeItems, { ...item, addedAt: new Date().toISOString() }],
      };
    });
  }, []);

  const removeKnowledge = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      knowledgeItems: prev.knowledgeItems.filter(item => item.id !== id),
    }));
  }, []);

  // Voice operations
  const addVoice = useCallback((item: Omit<FeedItem, 'addedAt'>) => {
    setState(prev => {
      if (findIndex(prev.voiceItems, item.id) !== -1) return prev;
      return {
        ...prev,
        voiceItems: [...prev.voiceItems, { ...item, addedAt: new Date().toISOString() }],
      };
    });
  }, []);

  const removeVoice = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      voiceItems: prev.voiceItems.filter(item => item.id !== id),
    }));
  }, []);

  // Action operations
  const addAction = useCallback((item: Omit<FeedItem, 'addedAt'>) => {
    setState(prev => {
      if (findIndex(prev.actionItems, item.id) !== -1) return prev;
      return {
        ...prev,
        actionItems: [...prev.actionItems, { ...item, addedAt: new Date().toISOString() }],
      };
    });
  }, []);

  const removeAction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item.id !== id),
    }));
  }, []);

  // Theme operations
  const addTheme = useCallback((item: Omit<ThemeItem, 'addedAt'>) => {
    setState(prev => {
      if (findIndex(prev.exploredThemes, item.id) !== -1) return prev;
      return {
        ...prev,
        exploredThemes: [...prev.exploredThemes, { ...item, addedAt: new Date().toISOString() }],
      };
    });
  }, []);

  const removeTheme = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      exploredThemes: prev.exploredThemes.filter(item => item.id !== id),
    }));
  }, []);

  // Guide prompt operations
  // TODO: Connect with Feedboard dispatch event 'realitycheck:addPrompt'
  // TODO: Implement real-time sync via WebSocket/SSE
  const addPrompt = useCallback((prompt: string, response: string) => {
    setState(prev => ({
      ...prev,
      guidePrompts: [
        {
          prompt,
          response,
          createdAt: new Date().toISOString(),
        },
        ...prev.guidePrompts,
      ],
    }));
  }, []);

  return {
    state,
    isLoaded,
    // Focus
    addFocus,
    removeFocus,
    // Knowledge
    addKnowledge,
    removeKnowledge,
    // Voice
    addVoice,
    removeVoice,
    // Action
    addAction,
    removeAction,
    // Theme
    addTheme,
    removeTheme,
    // Prompts
    addPrompt,
  };
};
