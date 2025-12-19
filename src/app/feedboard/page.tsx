'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { feedboardService } from '@/lib/feedboardService';
import { CLUSTER_CONFIG } from '@/lib/clusterConfig';
import { FeedItem, GuideItem, GuideConversationTurn } from '@/types/feedboard';
import { handlePrompt, resetConversationContext } from '@/lib/guideChatEngine';
import GuideChatSidebar from '@/components/feedboard/GuideChatSidebar';
import { buildWhyText } from '@/utils/whyText';
import './feedboard.css';

type ModeKey = 'focus' | 'explore' | 'pulse';

type GridItem = {
  item: FeedItem;
  variant: 'hero' | 'standard' | 'silence';
  key: string;
};

type QuickStat = {
  label: string;
  value: string;
  note: string;
};

const TIMER_INTERVAL_MS = 30_000;
const INITIAL_CONSUMED_MINUTES = 0; // Will be updated from API
const STOPPSCHILD_TRIGGER_MINUTES = 1; // Show overlay after 1 minute

const MODE_CONFIG: Record<
  ModeKey,
  {
    emoji: string;
    label: string;
    tagline: string;
    clusters: string[];
  }
> = {
  focus: {
    emoji: '',
    label: 'Fokus',
    tagline: '12 Slots. Null Ausreden.',
    clusters: ['Fokus & Flow', 'Zeit & Endlichkeit'],
  },
  explore: {
    emoji: '',
    label: 'Explore',
    tagline: 'Finde Orte, die dich nicht betäuben.',
    clusters: ['Freiheit & Orte', 'Sinn & Bedeutung', 'Wachstum'],
  },
  pulse: {
    emoji: '',
    label: 'Pulse',
    tagline: 'Watch, wann du vergeudest.',
    clusters: ['Kultur & Stimmen', 'Beziehungen', 'Geld & Wert', 'Selbsterkenntnis'],
  },
};

const INTENT_STATEMENTS = [
  {
    today: 'Nicht mehr betäuben.',
    guide: 'Du bist 16 Slots zu weich. Drei killst du heute.',
  },
  {
    today: 'Kurzfristig killen, langfristig bauen.',
    guide: 'Baust du oder sammelst du To-dos? Wähl eine Seite.',
  },
  {
    today: 'Fokus über Komfort.',
    guide: 'Komfort frisst deine Wochen. Wähl Reibung.',
  },
];

export default function FeedboardPage() {
  const [sessionStart, setSessionStart] = useState(() => Date.now());
  const [consumedMinutes, setConsumedMinutes] = useState(INITIAL_CONSUMED_MINUTES);
  const [showStoppschildOverlay, setShowStoppschildOverlay] = useState(false);
  const [sessionExtended, setSessionExtended] = useState(false);
  const [extensionStartTime, setExtensionStartTime] = useState<number | null>(null);
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const [activeMode, setActiveMode] = useState<ModeKey>('focus');
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [intentIndex, setIntentIndex] = useState(0);
  
  // Guide Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversationTurns, setConversationTurns] = useState<GuideConversationTurn[]>([]);
  const [activeTurn, setActiveTurn] = useState<GuideConversationTurn | null>(null);
  const [prompt, setPrompt] = useState('Wie baue ich eine neue Routine?');
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [overrideItems, setOverrideItems] = useState<FeedItem[] | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  
  const [isPersonalityOpen, setIsPersonalityOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<string>('Alle');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [activePartner, setActivePartner] = useState<FeedItem | null>(null);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const partnerModalRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useClickOutside(sidebarRef, () => setIsSidebarOpen(false), isSidebarOpen, ['.ticktock-header__toggle']);
  useClickOutside(partnerModalRef, () => setActivePartner(null), !!activePartner);

  // Fetch feed items from Supabase API
  useEffect(() => {
    async function fetchFeedItems() {
      try {
        setIsLoadingItems(true);
        const response = await fetch('/api/feedboard/items');
        if (!response.ok) {
          console.error('Failed to fetch feed items');
          // Fallback to mock data on error
          setFeedItems(feedboardService.getAllItems());
          return;
        }
        const data = await response.json();
        setFeedItems(data.items || []);
      } catch (error) {
        console.error('Error fetching feed items:', error);
        // Fallback to mock data on error
        setFeedItems(feedboardService.getAllItems());
      } finally {
        setIsLoadingItems(false);
      }
    }

    fetchFeedItems();
  }, []);

  // Fetch real usage time from API
  useEffect(() => {
    async function fetchUsageTime() {
      try {
        const response = await fetch('/api/profile/usage-limit');
        if (response.ok) {
          const data = await response.json();
          // Update consumedMinutes with real data from database
          if (typeof data.todayUsageMinutes === 'number') {
            setConsumedMinutes(data.todayUsageMinutes);
          }
        }
      } catch (error) {
        console.error('[Feedboard] Error fetching usage time:', error);
        // Keep current value on error
      }
    }

    // Fetch immediately
    fetchUsageTime();

    // Update every 30 seconds to show real-time usage
    const interval = setInterval(fetchUsageTime, 30000);

    return () => clearInterval(interval);
  }, []);

  const allItems = useMemo(() => feedItems, [feedItems]);
  const silenceCards = useMemo(() => allItems.filter(item => item.isSilence), [allItems]);
  const standardItems = useMemo(() => allItems.filter(item => !item.isSilence), [allItems]);

  const activeIntent = INTENT_STATEMENTS[intentIndex];

  useEffect(() => {
    const modeClusters = MODE_CONFIG[activeMode].clusters;
    if (activeCluster && !modeClusters.includes(activeCluster)) {
      setActiveCluster(null);
    }
  }, [activeMode, activeCluster]);

  // Keyboard shortcut for sidebar (⌘/Ctrl+J)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;
      
      if (isModifierPressed && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        event.stopPropagation();
        setIsSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // DISABLED: Session limit overlay logic (commented out, not deleted)
  // useEffect(() => {
  //   const tick = () => {
  //     const elapsedMs = Date.now() - sessionStart;
  //     const minutes = Math.floor(elapsedMs / 1000 / 60);
  //     setConsumedMinutes(minutes);
  //     
  //     // Show Stoppschild overlay after 1 minute (only if not extended)
  //     if (minutes >= STOPPSCHILD_TRIGGER_MINUTES && !showStoppschildOverlay && !sessionExtended) {
  //       setShowStoppschildOverlay(true);
  //     }
  //     
  //     // Check if extension period is over (20 minutes)
  //     if (sessionExtended && extensionStartTime) {
  //       const extensionElapsedMs = Date.now() - extensionStartTime;
  //       const extensionMinutes = Math.floor(extensionElapsedMs / 1000 / 60);
  //       if (extensionMinutes >= 20) {
  //         // Extension period over, show overlay again
  //         setShowStoppschildOverlay(true);
  //         setSessionExtended(false);
  //         setExtensionStartTime(null);
  //       }
  //     }
  //   };

  //   tick();
  //   const interval = window.setInterval(tick, TIMER_INTERVAL_MS);
  //   return () => window.clearInterval(interval);
  // }, [sessionStart, showStoppschildOverlay, sessionExtended, extensionStartTime]);


  const formatOptions = useMemo(() => {
    const formats = Array.from(new Set(standardItems.map(item => item.format))).sort();
    return ['Alle', ...formats];
  }, [standardItems]);

  const quickStats: QuickStat[] = useMemo(() => {
    const getTimeDisplay = () => {
      if (sessionExtended && extensionStartTime) {
        const extensionElapsedMs = Date.now() - extensionStartTime;
        const extensionMinutes = Math.floor(extensionElapsedMs / 1000 / 60);
        const remainingMinutes = Math.max(20 - extensionMinutes, 0);
        return {
          value: `„Verlängert: ${remainingMinutes} Minuten bis zum nächsten Limit (2 Credits eingesetzt)."`,
          note: 'Verlängerung (2 Credits) aktiv. Fokus wird weiter gezählt.'
        };
      }
      // Format time display: show hours and minutes if > 60 minutes
      const hours = Math.floor(consumedMinutes / 60);
      const minutes = consumedMinutes % 60;
      const timeDisplay = hours > 0 
        ? `${hours}h ${minutes} Min`
        : `${consumedMinutes} Min`;
      return {
        value: timeDisplay,
        note: 'Stoppschild nach 1 Minute'
      };
    };

    const timeDisplay = getTimeDisplay();

    return [
      {
        label: 'ZEIT HEUTE',
        value: timeDisplay.value,
        note: timeDisplay.note,
      },
      {
        label: 'FOKUS',
        value: sessionExtended ? '„Deine Zeit läuft weiter. Limit aktiv nach Ablauf der Verlängerung."' : `„${activeIntent.today}"`,
        note: sessionExtended ? 'Extension aktiv' : 'Guide Statement',
      },
      {
        label: 'PULSE',
        value: String(silenceCards.length),
        note: 'Statements in deiner Stille',
      },
    ];
  }, [activeIntent, silenceCards.length, consumedMinutes, sessionExtended, extensionStartTime]);

  const modeItems = useMemo(() => {
    const clusters = MODE_CONFIG[activeMode].clusters;
    return standardItems.filter(item => clusters.includes(item.theme));
  }, [standardItems, activeMode]);

  // Clear override when filters change
  useEffect(() => {
    if (overrideItems) {
      setOverrideItems(null);
    }
  }, [activeMode, activeCluster, activeFormat]);

  useEffect(() => {
    if (activeFormat !== 'Alle' && !formatOptions.includes(activeFormat)) {
      setActiveFormat('Alle');
    }
  }, [formatOptions, activeFormat]);

  const resetFilters = () => {
    setActiveCluster(null);
    setActiveFormat('Alle');
    setActiveMode('focus');
    console.log('Filters reset!');
  };

  const filteredItems = useMemo(() => {
    // Use override items if available, otherwise use normal filtering
    const sourceItems = overrideItems || modeItems;
    
    // Always include partner items regardless of cluster filter (from Supabase data)
    const partnerItems = allItems.filter(item => item.isPartner);
    
    const clusterFiltered = activeCluster
      ? sourceItems.filter(item => !item.isPartner && item.theme === activeCluster)
      : sourceItems.filter(item => !item.isPartner);

    // Add partner items back to the filtered results
    const itemsWithPartners = [...clusterFiltered, ...partnerItems];

    let result: FeedItem[];
    
    if (activeFormat === 'Alle') {
      result = itemsWithPartners;
    } else {
      // Apply format filter to both regular items and partner items
      result = itemsWithPartners.filter(item => item.format === activeFormat);
    }

    // Special editorial logic for "Fokus & Flow": limit to max 1 item per format type
    if (activeCluster === 'Fokus & Flow' && activeFormat === 'Alle') {
      const formatGroups: Record<string, FeedItem[]> = {};
      
      // Group items by format
      result.forEach(item => {
        if (!formatGroups[item.format]) {
          formatGroups[item.format] = [];
        }
        formatGroups[item.format].push(item);
      });
      
      // Limit to 1 item per format type (stable selection: first item based on existing sort order)
      result = Object.values(formatGroups).map(items => items[0]).filter(Boolean);
    }
    
    return result;
  }, [overrideItems, modeItems, activeCluster, activeFormat, allItems]);

  const gridItems: GridItem[] = useMemo(() => {
    const result: GridItem[] = [];
    if (!filteredItems.length) {
      return result;
    }

    // Sort items (heroes first, then partners, then others)
    const sortedItems = [...filteredItems].sort((a, b) => {
      // Heroes first
      if (a.isHero && !b.isHero) return -1;
      if (!a.isHero && b.isHero) return 1;
      
      // Partners second (but not if they're heroes)
      if (!a.isHero && !b.isHero) {
        if (a.isPartner && !b.isPartner) return -1;
        if (!a.isPartner && b.isPartner) return 1;
      }
      
      return 0;
    });

    let silenceCursor = 0;

    sortedItems.forEach((item, index) => {
      // Add silence cards every 5 items
      if (index > 0 && index % 5 === 0 && silenceCards.length > 0) {
        const silence = silenceCards[silenceCursor % silenceCards.length];
        result.push({
          item: silence,
          variant: 'silence',
          key: `silence-${silence.id}-${index}-${silenceCursor}`,
        });
        silenceCursor += 1;
      }

      // Add the item with unique key
      result.push({
        item,
        variant: item.isHero ? 'hero' : 'standard',
        key: `${item.id}-${index}-${item.isPartner ? 'partner' : 'regular'}`,
      });
    });

    return result;
  }, [filteredItems, silenceCards]);

  const secondaryItems = useMemo(() => {
    const modeClusters = MODE_CONFIG[activeMode].clusters;
    return standardItems
      .filter(item => !modeClusters.includes(item.theme))
      .slice(0, 6);
  }, [standardItems, activeMode]);

  const activeClusterConfig = activeCluster ? CLUSTER_CONFIG[activeCluster] : undefined;

  // Guide Sidebar Handlers
  const handleGuidePromptSubmit = async (promptText: string) => {
    if (!promptText.trim()) {
      return;
    }

    setLastUserMessage(promptText.trim());
    setIsGuideLoading(true);

    try {
      // Call our new API route
      const response = await fetch('/api/guide/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: promptText.trim() }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      // FYF Architektur: 1 kuratiertes Item im Chat, Rest im Feedboard
      // selected_item: Das eine Item für den Chat
      // feedboard_items: Restliche Items für das Feedboard
      
      const selectedItem = data.selected_item;
      const feedboardItems = data.feedboard_items || [];
      
      // Nur 1 Item für den Chat (selected_item)
      // Priorisiere guideWhy (transparency_reason) über why (Fallback)
      const chatItem: GuideItem | null = selectedItem ? {
        id: selectedItem.id,
        title: selectedItem.title,
        guideComment: '',
        guideWhy: (selectedItem as any).guideWhy || selectedItem.why || '',
        link: selectedItem.url || '#',
        clusterId: selectedItem.cluster || '',
        format: selectedItem.format || 'Artikel',
        read_time_minutes: selectedItem.read_time_minutes
      } : null;

      // Create a new conversation turn mit nur 1 Item
      // Follow-up nur anzeigen, wenn ein Item vorgeschlagen wurde und es sinnvoll ist
      // Keine generische "Hast du noch Fragen?" Floskel
      const newTurn: GuideConversationTurn = {
        id: Date.now().toString(),
        prompt: promptText.trim(),
        promptEcho: promptText.trim(),
        comment: data.response,
        items: chatItem ? [chatItem] : [],
        matchReasons: chatItem && (selectedItem as any).guideWhy || selectedItem?.why ? [{
          itemId: chatItem.id,
          reason: (selectedItem as any).guideWhy || selectedItem.why || ''
        }] : [],
        followUp: data.fallback ? undefined : undefined, // Keine generische Follow-up-Frage mehr
        createdAt: new Date().toISOString(),
        isFallback: !!data.fallback
      };
      
      // Update conversation state
      setConversationTurns(prev => [...prev, newTurn]);
      setActiveTurn(newTurn);
      
      // Feedboard: Restliche Items aus dem Cluster anzeigen
      if (feedboardItems.length > 0 && data.detectedCluster) {
        // Konvertiere feedboard_items zu FeedItems für das Feedboard
        const feedItems: FeedItem[] = feedboardItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.subtitle || '',
          format: item.format as any,
          theme: item.cluster as any,
          perma: 'Guide' as any,
          link: item.url || '#',
          image: '',
          guideWhy: (item as any).guideWhy || item.why || '', // Priorisiere transparency_reason (guideWhy) über Fallback
          source: 'guide' as any,
          chips: [],
          guideComment: '',
          isHero: false,
          isSilence: false
        }));
        
        // Setze overrideItems für das Feedboard
        setOverrideItems(feedItems);
        
        // Setze auch den activeCluster, damit das Feedboard den Cluster filtert
        setActiveCluster(data.detectedCluster);
      } else {
        // Keine feedboard_items oder kein detectedCluster -> overrideItems zurücksetzen
        setOverrideItems(null);
      }
      
      setPrompt('');
    } catch (error) {
      console.error('Guide prompt error:', error);
      // Fallback in case of error
      const errorTurn: GuideConversationTurn = {
        id: Date.now().toString(),
        prompt: promptText.trim(),
        comment: "Entschuldige, ich konnte gerade keine Verbindung herstellen. Aber bleib dran – dein Fokus ist heute wichtiger als meine Antwort.",
        items: [],
        matchReasons: []
      };
      setConversationTurns(prev => [...prev, errorTurn]);
      setActiveTurn(errorTurn);
    } finally {
      setIsGuideLoading(false);
    }
  };

  const handleFollowUpSelect = (followUpText: string) => {
    setPrompt(followUpText);
    handleGuidePromptSubmit(followUpText);
  };

  const handleResetGuide = () => {
    resetConversationContext();
    setConversationTurns([]);
    setActiveTurn(null);
    setOverrideItems(null);
    setPrompt('');
    setLastUserMessage(null);
  };

  // Stoppschild Overlay Handlers
  const handleStoppschildLogout = () => {
    window.location.assign('/logout-placeholder');
  };

  const handleStoppschildContinue = () => {
    // Hide the overlay and start 20-minute extension
    setShowStoppschildOverlay(false);
    setSessionExtended(true);
    setExtensionStartTime(Date.now());
  };

  return (
    <>
      <TickTockHeader
        isOpen={isHeaderOpen}
        quickStats={quickStats}
        activeMode={activeMode}
        onToggle={() => setIsHeaderOpen(value => !value)}
        onModeChange={mode => setActiveMode(mode)}
        onOpenGuide={() => setIsSidebarOpen(true)}
      />

      {/* DISABLED: Session limit overlay (commented out, not deleted) */}
      {false && showStoppschildOverlay && (
        <SessionLimitOverlay
          onLogout={handleStoppschildLogout}
          onContinue={handleStoppschildContinue}
          consumedMinutes={consumedMinutes}
        />
      )}


{/* PersonalitySection temporarily disabled */}

      <div className={`feedboard-shell ${isHeaderOpen ? 'header-open' : ''} ${isSidebarOpen ? 'has-sidebar' : ''}`}>
        <div className="feedboard-shell__background" aria-hidden="true" />

        <section className="feedboard-controls">
          <div className="feedboard-controls__mode">
            <span className="feedboard-controls__mode-label">
              {MODE_CONFIG[activeMode].emoji} {MODE_CONFIG[activeMode].label}
            </span>
            <p className="feedboard-controls__mode-tagline">
              {MODE_CONFIG[activeMode].tagline}
            </p>
          </div>

          <div className="feedboard-cluster-chips" role="tablist" aria-label="Cluster Filter">
            <button
              type="button"
              className={`feedboard-chip ${activeCluster === null ? 'is-active' : ''}`}
              onClick={() => setActiveCluster(null)}
            >
              Alle Territorien
            </button>

            {MODE_CONFIG[activeMode].clusters.map(clusterName => {
              const config = CLUSTER_CONFIG[clusterName];
              return (
                <button
                  key={clusterName}
                  type="button"
                  role="tab"
                  className={`feedboard-chip ${activeCluster === clusterName ? 'is-active' : ''}`}
                  onClick={() =>
                    setActiveCluster(prev => (prev === clusterName ? null : clusterName))
                  }
                  style={{ '--chip-accent': config?.color || '#4ecdc4' } as CSSProperties}
                >
                  {clusterName}
                </button>
              );
            })}
          </div>

          <div className="feedboard-format-chips" role="group" aria-label="Format Filter">
            {formatOptions.map(format => (
              <button
                key={format}
                type="button"
                className={`feedboard-chip feedboard-chip--format ${activeFormat === format ? 'is-active' : ''}`}
                onClick={() => setActiveFormat(format)}
              >
                {format}
              </button>
            ))}
          </div>

          {(activeCluster !== null || activeFormat !== 'Alle') && (
            <button
              type="button"
              className="feedboard-chip feedboard-chip--reset"
              onClick={resetFilters}
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                color: 'var(--fyf-muted)',
                marginLeft: 'auto'
              }}
            >
              Filter zurücksetzen
            </button>
          )}

          {activeClusterConfig && (
            <p className="feedboard-cluster-intro">
              {activeClusterConfig.intro}
            </p>
          )}
        </section>

        <section className="feedboard-grid" aria-live="polite">
          {gridItems.map(({ item, variant, key }) => (
            <FeedCard key={key} item={item} variant={variant} lastUserMessage={lastUserMessage} />
          ))}

          {!gridItems.length && (
            <div className="feedboard-empty">
              <p>Keine Inhalte für dieses Cluster. Wähl ein anderes Terrain.</p>
            </div>
          )}
        </section>

        {secondaryItems.length > 0 && (
          <section className="feedboard-secondary">
            <div className="feedboard-secondary__headline">
              <h2>Mehr aus anderen Territorien</h2>
              <p>Du willst querverlinken? Geh rüber und hol dir andere Perspektiven.</p>
            </div>
            <div className="feedboard-secondary__grid">
              {secondaryItems.map(item => (
                <FeedCard key={`secondary-${item.id}`} item={item} variant="standard" size="compact" lastUserMessage={lastUserMessage} />
              ))}
          </div>
        </section>
        )}
      </div>

      <div ref={sidebarRef}>
        <GuideChatSidebar
          isOpen={isSidebarOpen}
          turns={conversationTurns}
          activeTurn={activeTurn}
          prompt={prompt}
          isLoading={isGuideLoading}
          onPromptChange={setPrompt}
          onSubmit={handleGuidePromptSubmit}
          onFollowUpSelect={handleFollowUpSelect}
          onReset={handleResetGuide}
        />
      </div>

      <div ref={partnerModalRef}>
        <PartnerModal 
          partner={activePartner} 
          onClose={() => setActivePartner(null)} 
          onHidePartner={(id) => {
            setFeedItems(prev => prev.filter(item => item.id !== id));
            setActivePartner(null);
          }}
        />
      </div>
    </>
  );
}


type HeaderProps = {
  isOpen: boolean;
  quickStats: QuickStat[];
  activeMode: ModeKey;
  onToggle: () => void;
  onModeChange: (mode: ModeKey) => void;
  onOpenGuide: () => void;
};

function TickTockHeader({
  isOpen,
  quickStats,
  activeMode,
  onToggle,
  onModeChange,
  onOpenGuide,
}: HeaderProps) {
  return (
    <header className={`ticktock-header ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="ticktock-header__toggle"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="ticktock-header__label"> Dein Guide.</span>
        <span className="ticktock-header__chevron" aria-hidden="true" style={{ fontSize: '2em', color: '#4ECDC4' }}>
          {isOpen ? '▾' : '▸'}
        </span>
        <span className="ticktock-header__teaser">Dein Feedboard.</span>
        <div style={{ fontSize: '0.8em', color: '#4ECDC4', marginTop: '0.5rem' }}>
          ⌘+J zum Chatten
        </div>
      </button>

      <div className="ticktock-header__body">
        <div className="ticktock-header__manifest">
          <div className="ticktock-header__manifest-title">GUIDE</div>
          <p className="ticktock-header__manifest-copy">
            Dein Fokus-Feed. Schraub das Hustle-Level runter und hol dir 12 Stunden Fokus zurück – ohne
            schlechter zu performen.
          </p>
          <div className="ticktock-header__manifest-glow" aria-hidden="true" />
        </div>

        <div className="ticktock-header__modes" role="tablist" aria-label="Guide-Filter">
          {(Object.keys(MODE_CONFIG) as ModeKey[]).map(modeKey => {
            const mode = MODE_CONFIG[modeKey];
            const isActive = activeMode === modeKey;
            return (
            <button
                key={modeKey}
              type="button"
                role="tab"
                aria-selected={isActive}
                className={`ticktock-header__mode ${isActive ? 'is-active' : ''}`}
                onClick={() => onModeChange(modeKey)}
              >
                <span aria-hidden="true">{mode.emoji}</span> {mode.label}
              </button>
            );
          })}
          <button 
            type="button" 
            className="ttg-button ttg-button--ghost ticktock-header__guide-button" 
            onClick={onOpenGuide}
          >
            Guide fragen
          </button>
        </div>

        <div className="ticktock-header__stats">
          {quickStats.map(stat => (
            <div key={stat.label} className="ticktock-stat">
              <span className="ticktock-stat__label">{stat.label}</span>
              <span className="ticktock-stat__value">{stat.value}</span>
              <span className="ticktock-stat__note">{stat.note}</span>
            </div>
          ))}
        </div>

      </div>
          </header>
  );
}

function FeedboardPersonaPanel() {
  return (
    <aside className="ticktock-header__persona-panel">
      <span className="ticktock-header__persona-label">
        FYF Feedboard Personality Snippet
      </span>

      <h3 className="ticktock-header__persona-headline">
        FYF ist keine Motivationsmaschine.
      </h3>

      <div className="ticktock-header__persona-text">
        <p>
          Die Bot-Logik spiegelt Haltung: Kein Optimierungswahn, kein Coaching, sondern echte Fragen.
        </p>
        <p>
          Jeder Impuls hier basiert auf Wissenschaft, Ethik und der Überzeugung, dass Zeit ein Vermögen ist – nicht nur eine
Ressource.
          Klar, unbequem, menschlich – und 100 % transparent, wie Entscheidungen getroffen werden.
        </p>
      </div>

      <blockquote className="ticktock-header__persona-quote">
        „Unser Bot kuratiert, irritiert und fordert dich heraus. Damit du denkst, nicht nur scrollst."
      </blockquote>

      <div className="ticktock-header__persona-action">
        <a href="/transparenz" className="ttg-button ttg-button--link">
          Mehr zur FYF-Methodik
        </a>
      </div>
    </aside>
  );
}

type FeedCardProps = {
  item: FeedItem;
  variant: 'hero' | 'standard' | 'silence';
  size?: 'default' | 'compact';
  onPartnerClick?: (item: FeedItem) => void;
  lastUserMessage?: string | null;
};

function FeedCard({ item, variant, size = 'default', onPartnerClick, lastUserMessage }: FeedCardProps) {
  const cluster = CLUSTER_CONFIG[item.theme];
  const accent = cluster?.color ?? '#4ecdc4';
  const icon = cluster?.icon ?? '◯';
  
  // Nutze buildWhyText Helper für saubere, vollständige Sätze
  const whyText = buildWhyText({
    matchReason: (item as any).matchReason ?? (item as any).match_reason ?? null,
    guideWhy: item.guideWhy ?? null,
    lastUserMessage: lastUserMessage ?? null,
    clusterCode: (item as any).clusterId ?? item.theme ?? null,
  });

  const [showGuideComment, setShowGuideComment] = useState(false);
  const [guideData, setGuideData] = useState<{ title: string; guide_comment: string; transparency_reason: string } | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        console.log('[FeedCard] User fetch result:', { 
          hasUser: !!user, 
          userId: user?.id, 
          error,
          userEmail: user?.email 
        });
        
        if (user) {
          setUserId(user.id);
          console.log('[FeedCard] User ID set:', user.id);
        } else {
          console.warn('[FeedCard] No user found, buttons will be hidden');
        }
      } catch (err) {
        console.error('[FeedCard] Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const logFeedInteraction = async (action: 'bookmark' | 'more' | 'less') => {
    console.log('[FeedCard] logFeedInteraction called:', { action, itemId: item.id, userId });
    
    if (!userId) {
      console.warn('[FeedCard] Cannot log interaction: user not authenticated');
      return;
    }

    try {
      const requestBody = {
        content_id: item.id,
        action: action,
      };
      
      console.log('[FeedCard] Sending request to /api/feedboard/interactions:', requestBody);
      
      const res = await fetch('/api/feedboard/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseText = await res.text();
      console.log('[FeedCard] Response status:', res.status);
      console.log('[FeedCard] Response body:', responseText);

      if (res.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log('[FeedCard] Feed interaction logged successfully:', data);
        } catch (e) {
          console.log('[FeedCard] Response (non-JSON):', responseText);
        }
      } else {
        console.error('[FeedCard] Failed to log interaction:', {
          status: res.status,
          statusText: res.statusText,
          body: responseText,
        });
      }
    } catch (err: any) {
      console.error('[FeedCard] Error logging feed interaction:', {
        error: err,
        message: err?.message,
        stack: err?.stack,
      });
    }
  };

  const openGuideComment = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (guideData) {
      setShowGuideComment(true);
      return;
    }

    setIsLoadingGuide(true);
    try {
      const res = await fetch(`/api/feedboard/items/${item.id}/guide-comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: item.id })
      });
      
      if (res.ok) {
        const data = await res.json();
        setGuideData(data);
        setShowGuideComment(true);
      }
    } catch (err) {
      console.error('Error fetching guide comment:', err);
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const cardClass = [
    'feed-card',
    `feed-card--${variant}`,
    size === 'compact' ? 'feed-card--compact' : '',
    item.hasGlitch ? 'feed-card--glitch' : '',
    item.isPartner ? 'feed-card--partner' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {!item.isSilence && (
        <div
          className="feed-card__visual"
          style={
            {
              '--feed-card-visual': item.image ? `url(${item.image})` : 'none',
              '--feed-card-accent': accent,
            } as CSSProperties
          }
          aria-hidden="true"
        />
      )}

      <div className="feed-card__overlay" />

      {item.isPartner && (
        <button
          className="feed-card__partner-badge"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPartnerClick?.(item);
          }}
          title="Warum sehe ich das? Dieser Partner zahlt dafür, hier zu erscheinen. Du kannst ihn jederzeit ausblenden."
          aria-label="Partner Supported - Warum sehe ich das? Dieser Partner zahlt dafür, hier zu erscheinen. Du kannst ihn jederzeit ausblenden."
          tabIndex={0}
        >
          Partner Supported
        </button>
      )}

      {item.format === 'Event' && item.eventInfo && (
        <div className="feed-card__event-badge">
          <span className="feed-card__event-date">{item.eventInfo.date}</span>
          <span className="feed-card__event-location">{item.eventInfo.location}</span>
        </div>
      )}

      <div className="feed-card__body">
        <div className="feed-card__cluster" style={{ color: accent }}>
          <span aria-hidden="true">{icon}</span>
          <span>{item.theme}</span>
        </div>

        <h3 className="feed-card__title">{item.title}</h3>

        {item.guideComment && <p className="feed-card__comment">{item.guideComment}</p>}

        {whyText && <p className="feed-card__why">{whyText}</p>}

        <div className="feed-card__actions" style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="guide-says-btn"
            onClick={openGuideComment}
            disabled={isLoadingGuide}
            style={{
              background: 'rgba(78, 205, 196, 0.15)',
              border: '1px solid rgba(78, 205, 196, 0.3)',
              borderRadius: '999px',
              padding: '6px 14px',
              color: 'var(--fyf-mint)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {isLoadingGuide ? 'Lade...' : 'Guide sagt...'}
          </button>
          
          {userId ? (
            <div className="feed-buttons" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logFeedInteraction('bookmark');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: 'var(--fyf-cream)',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Merken"
              >
                📌 Merken
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logFeedInteraction('more');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: 'var(--fyf-cream)',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Mehr davon"
              >
                👍 Mehr davon
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logFeedInteraction('less');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: 'var(--fyf-cream)',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Anderes Thema"
              >
                👎 Anderes Thema
              </button>
            </div>
          ) : null}
        </div>

        {item.chips?.length > 0 && (
          <div className="feed-card__chips">
            {item.chips.map(chip => (
              <span 
                key={chip}
                className={chip === "Partner Supported" ? "partner-chip" : chip === "Featured Event" ? "featured-event-chip" : ""}
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {showGuideComment && guideData && (
        <div className="guide-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="guide-overlay__content">
            <h4 className="guide-overlay__title">Guide zu „{guideData.title}“</h4>
            <p className="guide-overlay__comment">„{guideData.guide_comment || 'Kein Kommentar vorhanden.'}“</p>
            {guideData.transparency_reason && (
              <div className="guide-overlay__transparency">
                <strong>Warum?</strong> {guideData.transparency_reason}
              </div>
            )}
            <button 
              className="guide-overlay__close"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowGuideComment(false);
              }}
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (variant === 'silence' || item.link === '#') {
    return (
      <article className={cardClass} data-variant={variant}>
        <div className="feed-card__body feed-card__body--silence">
          <span className="feed-card__cluster" style={{ color: accent }}>
            {icon}
          </span>
          <h3 className="feed-card__title">{item.title}</h3>
          {item.guideComment && <p className="feed-card__comment">{item.guideComment}</p>}
        </div>
      </article>
    );
  }

  return (
    <article className={cardClass} data-variant={variant}>
      {item.isPartner ? (
        <div 
          className="feed-card__link"
          onClick={() => onPartnerClick?.(item)}
          style={{ cursor: 'pointer' }}
        >
          {content}
        </div>
      ) : (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="feed-card__link">
          {content}
        </a>
      )}
    </article>
  );
}

type SessionLimitOverlayProps = {
  onLogout: () => void;
  onContinue: () => void;
  consumedMinutes: number;
};


function SessionLimitOverlay({ onLogout, onContinue, consumedMinutes }: SessionLimitOverlayProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleContinue = () => {
    setShowConfirmation(true);
  };

  const handleConfirmContinue = () => {
    onContinue();
    setShowConfirmation(false);
  };

  const handleCancelContinue = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      {/* Main Overlay */}
      <div className="session-limit-overlay" role="dialog" aria-modal="true">
        <div className="session-limit-overlay__backdrop" />
        <div className="session-limit-overlay__content">
          <div className="session-limit-overlay__badge">Dein Limit. Deine Grenze. Dein Move.</div>
          <h2 className="session-limit-overlay__title">Du hast dir das Stoppschild selbst gesetzt.</h2>
          <p className="session-limit-overlay__description">
            Du warst {consumedMinutes} Minuten im Feedboard. RealityCheck hält dich an deiner Grenze fest.
            Heute Pause. Morgen wieder rein.
          </p>
          
          <div className="session-limit-overlay__actions">
            <button
              type="button"
              className="session-limit-overlay__btn session-limit-overlay__btn--logout"
              onClick={onLogout}
            >
              Schmeiß mich raus.
            </button>
            <button
              type="button"
              className="session-limit-overlay__btn session-limit-overlay__btn--continue"
              onClick={handleContinue}
            >
              Grenze lockern, neue Session
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="session-limit-confirmation" role="dialog" aria-modal="true">
          <div className="session-limit-confirmation__backdrop" />
          <div className="session-limit-confirmation__content">
            <h3 className="session-limit-confirmation__title">Du hast festgelegt, dass jede Verlängerung deiner Session 2 Credits kostet.</h3>
            <p className="session-limit-confirmation__description">
              Willst du wirklich weitermachen und dafür 2 Credits einsetzen?
            </p>
            <div className="session-limit-confirmation__actions">
              <button
                type="button"
                className="session-limit-confirmation__btn session-limit-confirmation__btn--cancel"
                onClick={handleCancelContinue}
              >
                Ne. Ich hör doch lieber auf.
              </button>
              <button
                type="button"
                className="session-limit-confirmation__btn session-limit-confirmation__btn--confirm"
                onClick={handleConfirmContinue}
              >
                Ja, 2 Credits zahlen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


type PersonalitySectionProps = {
  isOpen: boolean;
  onToggle: () => void;
};

function PersonalitySection({ isOpen, onToggle }: PersonalitySectionProps) {
  return (
    <section className="personality-section">
      <button
        type="button"
        className="personality-section__toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="personality-content"
      >
        <span className="personality-section__label">Erfahre mehr über den Guide</span>
        <span className="personality-section__chevron" aria-hidden="true">
          {isOpen ? '▾' : '▸'}
        </span>
      </button>

      <div
        id="personality-content"
        className={`personality-section__content ${isOpen ? 'is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="personality-section__inner">
          <div className="personality-section__badge">FYF Bot-Personality</div>
          
          <h3 className="personality-section__headline">
            FYF ist keine Motivationsmaschine.
          </h3>
          
          <div className="personality-section__text">
            <p>
              Die Bot-Logik spiegelt Haltung: Kein Optimierungswahn, kein Coaching, sondern echte Fragen.
              Jeder Impuls hier basiert auf Wissenschaft, Ethik und der Überzeugung, dass Zeit ein Vermögen ist – nicht nur eine Ressource.
            </p>
            <p>
              Klar, unbequem, menschlich – und 100 % transparent, wie Entscheidungen getroffen werden.
            </p>
          </div>

          <blockquote className="personality-section__quote">
            „Unser Bot kuratiert, irritiert und fordert dich heraus. Damit du denkst, nicht nur scrollst."
          </blockquote>

          <div className="personality-section__methodik">
            <h4>Die FYF-Methodik</h4>
            <ul>
              <li><strong>Wissenschaftsbasiert:</strong> Jede Empfehlung basiert auf Forschung und Daten</li>
              <li><strong>Ethisch fundiert:</strong> Transparenz über Algorithmen und Entscheidungsprozesse</li>
              <li><strong>Zeit als Vermögen:</strong> Fokus auf nachhaltige Produktivität statt Hustle</li>
              <li><strong>Menschlich:</strong> Keine toxische Positivität, sondern echte Unterstützung</li>
            </ul>
          </div>

          <div className="personality-section__action">
            <a href="/transparenz" className="ttg-button ttg-button--link">
              Mehr zur FYF-Methodik
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

type PartnerModalProps = {
  partner: FeedItem | null;
  onClose: () => void;
  onHidePartner: (partnerId: string) => void;
};

function PartnerModal({ partner, onClose, onHidePartner }: PartnerModalProps) {
  if (!partner || !partner.isPartner || !partner.partnerInfo) {
    return null;
  }

  const { partnerInfo } = partner;

  return (
    <div className="partner-modal" role="dialog" aria-modal="true">
      <div className="partner-modal__panel">
        <div className="partner-modal__header">
          <div className="partner-modal__badge">Partner Supported</div>
          <button
            className="partner-modal__close"
            onClick={onClose}
            aria-label="Modal schließen"
          >
            ×
          </button>
        </div>

        <img
          src={partner.image}
          alt={`Portrait von ${partnerInfo.name}`}
          className="partner-modal__portrait"
        />

        <h2 className="partner-modal__name">{partnerInfo.name}</h2>
        <p className="partner-modal__role">{partnerInfo.role}</p>

        <blockquote className="partner-modal__statement">
          „{partnerInfo.statement}"
        </blockquote>

        <div className="partner-modal__offer">
          <p>{partnerInfo.offerDescription}</p>
        </div>

        <div className="partner-modal__contacts">
          {partnerInfo.contact.email && (
            <a
              href={`mailto:${partnerInfo.contact.email}`}
              className="partner-modal__contact"
            >
              <span className="partner-modal__contact-icon">✉</span>
              <span>{partnerInfo.contact.email}</span>
            </a>
          )}
          {partnerInfo.contact.chat && (
            <div className="partner-modal__contact">
              <span className="partner-modal__contact-icon">💬</span>
              <span>{partnerInfo.contact.chat}</span>
            </div>
          )}
          {partnerInfo.contact.video && (
            <div className="partner-modal__contact">
              <span className="partner-modal__contact-icon">📹</span>
              <span>{partnerInfo.contact.video}</span>
            </div>
          )}
        </div>

        <div className="partner-modal__actions">
          <button
            className="partner-modal__action"
            onClick={() => {
              if (partnerInfo.contact.email) {
                window.location.href = `mailto:${partnerInfo.contact.email}`;
              }
            }}
          >
            Kontakt aufnehmen
          </button>
          <button
            className="partner-modal__action partner-modal__action--secondary"
            onClick={() => onHidePartner(partner.id)}
          >
            Partner ausblenden
          </button>
        </div>

        <div className="partner-modal__transparency">
          <p>
            <strong>FYF empfiehlt Partner nur in klar gekennzeichneter Form.</strong><br />
            Kein versteckter Verkauf, kein Algorithmus-Fake. Dieser Partner zahlt für Sichtbarkeit, 
            aber nur Substanz bleibt hier oben.
          </p>
        </div>
      </div>
    </div>
  );
}
