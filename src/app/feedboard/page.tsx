'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { feedboardService } from '@/lib/feedboardService';
import { CLUSTER_CONFIG } from '@/lib/clusterConfig';
import { FeedItem, GuideItem, GuideConversationTurn } from '@/types/feedboard';
import { feedItems as FEED_ITEMS } from '@/data/feedItems';
import { handlePrompt, resetConversationContext } from '@/lib/guideChatEngine';
import GuideChatSidebar from '@/components/feedboard/GuideChatSidebar';
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
const INITIAL_CONSUMED_MINUTES = 37;
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
  const [sessionStart, setSessionStart] = useState(
    () => Date.now() - INITIAL_CONSUMED_MINUTES * 60 * 1000,
  );
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
  
  const [isPersonalityOpen, setIsPersonalityOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<string>('Alle');

  const allItems = useMemo(() => feedboardService.getAllItems(), []);
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

  useEffect(() => {
    const tick = () => {
      const elapsedMs = Date.now() - sessionStart;
      const minutes = Math.floor(elapsedMs / 1000 / 60);
      setConsumedMinutes(minutes);
      
      // Show Stoppschild overlay after 1 minute (only if not extended)
      if (minutes >= STOPPSCHILD_TRIGGER_MINUTES && !showStoppschildOverlay && !sessionExtended) {
        setShowStoppschildOverlay(true);
      }
      
      // Check if extension period is over (20 minutes)
      if (sessionExtended && extensionStartTime) {
        const extensionElapsedMs = Date.now() - extensionStartTime;
        const extensionMinutes = Math.floor(extensionElapsedMs / 1000 / 60);
        if (extensionMinutes >= 20) {
          // Extension period over, show overlay again
          setShowStoppschildOverlay(true);
          setSessionExtended(false);
          setExtensionStartTime(null);
        }
      }
    };

    tick();
    const interval = window.setInterval(tick, TIMER_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [sessionStart, showStoppschildOverlay, sessionExtended, extensionStartTime]);


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
      return {
        value: `${consumedMinutes} Min`,
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

  const filteredItems = useMemo(() => {
    // Use override items if available, otherwise use normal filtering
    const sourceItems = overrideItems || modeItems;
    
    // Always include partner items regardless of cluster filter
    const partnerItems = FEED_ITEMS.filter(item => item.isPartner);
    
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
  }, [overrideItems, modeItems, activeCluster, activeFormat, FEED_ITEMS]);

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

    setIsGuideLoading(true);

    try {
      const result = await handlePrompt(promptText.trim());
      
      // Update conversation state
      setConversationTurns(result.turns);
      setActiveTurn(result.activeTurn);
      
      // Convert GuideItems to FeedItems for override
      const feedItems = result.activeTurn.items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.guideComment,
        format: item.format as any,
        theme: item.clusterId as any,
        perma: 'Guide' as any,
        link: item.link,
        image: '',
        guideWhy: item.guideWhy,
        source: 'guide' as any,
        chips: [],
        guideComment: item.guideComment,
        isHero: false,
        isSilence: false
      }));
      
      setOverrideItems(feedItems);
      setPrompt('');
    } catch (error) {
      console.error('Guide prompt error:', error);
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
        onCycleIntent={() => setIntentIndex(index => (index + 1) % INTENT_STATEMENTS.length)}
        intent={activeIntent}
        onOpenGuide={() => setIsSidebarOpen(true)}
        onSetFocus={() => setActiveMode('focus')}
      />

      {showStoppschildOverlay && (
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

          {activeClusterConfig && (
            <p className="feedboard-cluster-intro">
              {activeClusterConfig.intro}
            </p>
          )}
        </section>

        <section className="feedboard-grid" aria-live="polite">
          {gridItems.map(({ item, variant, key }) => (
            <FeedCard key={key} item={item} variant={variant} />
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
                <FeedCard key={`secondary-${item.id}`} item={item} variant="standard" size="compact" />
              ))}
          </div>
        </section>
        )}
      </div>

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
    </>
  );
}


type HeaderProps = {
  isOpen: boolean;
  quickStats: QuickStat[];
  activeMode: ModeKey;
  onToggle: () => void;
  onModeChange: (mode: ModeKey) => void;
  onCycleIntent: () => void;
  intent: (typeof INTENT_STATEMENTS)[number];
  onOpenGuide: () => void;
  onSetFocus: () => void;
};

function TickTockHeader({
  isOpen,
  quickStats,
  activeMode,
  onToggle,
  onModeChange,
  onCycleIntent,
  intent,
  onOpenGuide,
  onSetFocus,
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

        <div className="ticktock-header__intent">
          <div className="ticktock-intent__badge" aria-hidden="true">
            🜂
          </div>
          <div>
            <h3>Heute: „{intent.today}“</h3>
            <p>Guide sagt: {intent.guide}</p>
          </div>

          <div className="ticktock-intent__actions">
            <button type="button" className="ttg-button ttg-button--solid" onClick={onSetFocus}>
              Fokus setzen
            </button>
            <button type="button" className="ttg-button ttg-button--ghost" onClick={onOpenGuide}>
              Guide fragen
            </button>
            <button type="button" className="ttg-button ttg-button--link" onClick={onCycleIntent}>
              Statement wechseln
            </button>
          </div>
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
};

function FeedCard({ item, variant, size = 'default', onPartnerClick }: FeedCardProps) {
  const cluster = CLUSTER_CONFIG[item.theme];
  const accent = cluster?.color ?? '#4ecdc4';
  const icon = cluster?.icon ?? '◯';

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

        {item.guideWhy && <p className="feed-card__why">{item.guideWhy}</p>}

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
