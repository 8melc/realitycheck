'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import BlackholeAnimation from '../../components/BlackholeAnimation';
import StatIcon from '../../components/icons/StatIcon';
import SocietyIcon from '../../components/icons/SocietyIcon';
import CosmosIcon from '../../components/icons/CosmosIcon';
import NatureIcon from '../../components/icons/NatureIcon';

interface LifeStats {
  weeksLived: number;
  totalWeeks: number;
  weeksRemaining: number;
  percentageLived: number;
  daysLived: number;
  hoursSlept: number;
  heartbeats: number;
  breaths: number;
  seasons: number;
  birthYear: number;
  remainingSummers: number;
  remainingWeekends: number;
}

interface StatCard {
  id: string;
  title: string;
  metric: (stats: LifeStats) => string | string;
  body: string;
}

interface StatTab {
  id: number;
  label: string;
  icon: React.ComponentType;
  headline: string;
  cards: StatCard[];
}


const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num);
};

const getPopulationAtYear = (year: number) => {
  const populationData: { [key: number]: number } = {
    1950: 2.5, 1960: 3.0, 1970: 3.7, 1980: 4.4, 1990: 5.3,
    2000: 6.1, 2010: 6.9, 2020: 7.8, 2025: 8.1
  };
  
  const years = Object.keys(populationData).map(Number);
  const closestYear = years.reduce((prev, curr) => 
    Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
  );
  
  return Math.round(populationData[closestYear] * 1000000000);
};

const statsTabs: StatTab[] = [
  { 
    id: 0, 
    label: 'Lebensmetriken', 
    icon: StatIcon,
    headline: 'Du hast schon {weeksLived} Wochen bewusst erlebt – Zeit, die restlichen {weeksRemaining} zu gestalten.',
    cards: [
      { 
        id: 'weekends-remaining', 
        title: 'Wochenenden in Aussicht', 
        metric: (stats: LifeStats) => formatNumber(stats.remainingWeekends),
        body: 'So viele Wochenenden kannst du noch bewusst gestalten.' 
      },
      { 
        id: 'weeks-lived', 
        title: 'Wochen gelebt', 
        metric: (stats: LifeStats) => formatNumber(stats.weeksLived),
        body: 'Du hast bereits einen bedeutenden Teil deiner Lebenszeit erlebt.' 
      },
      { 
        id: 'days-conscious', 
        title: 'Tage des Bewusstseins', 
        metric: (stats: LifeStats) => formatNumber(stats.daysLived),
        body: 'Jeder Tag ist eine Gelegenheit, bewusst zu leben.' 
      },
    ]
  },
  { 
    id: 1, 
    label: 'Natürliche Rhythmen', 
    icon: NatureIcon,
    headline: 'Die natürlichen Rhythmen deines Lebens.',
    cards: [
      { 
        id: 'summers-remaining', 
        title: 'Sommer verbleibend', 
        metric: (stats: LifeStats) => formatNumber(stats.remainingSummers),
        body: 'So viele Sommer warten noch darauf, von dir gestaltet zu werden.' 
      },
      { 
        id: 'moon-phases', 
        title: 'Mondphasen', 
        metric: (stats: LifeStats) => formatNumber(Math.round(stats.daysLived / 29.53)),
        body: 'Du hast viele Zyklen des Mondes miterlebt.' 
      },
      { 
        id: 'sun-orbits', 
        title: 'Sonnenumrundungen', 
        metric: (stats: LifeStats) => formatNumber(Math.floor(stats.daysLived / 365.25)),
        body: 'Jede Umrundung der Sonne ist ein neues Jahr voller Möglichkeiten.' 
      },
    ]
  },
  { 
    id: 2, 
    label: 'Menschlicher Puls', 
    icon: SocietyIcon,
    headline: 'Deine Zeit im Rhythmus der Menschheit.',
    cards: [
      { 
        id: 'lives-begun', 
        title: 'Neue Leben', 
        metric: (stats: LifeStats) => formatNumber(Math.round(stats.daysLived * 385000)),
        body: 'Seit deiner Geburt haben Millionen neue Leben begonnen.' 
      },
      { 
        id: 'population-growth', 
        title: 'Bevölkerungswachstum', 
        metric: (stats: LifeStats) => `${formatNumber(getPopulationAtYear(stats.birthYear) / 1000000000)}M → 8M`,
        body: 'Die Menschheit ist während deiner Lebenszeit exponentiell gewachsen.' 
      },
      { 
        id: 'people-met', 
        title: 'Menschen getroffen', 
        metric: (stats: LifeStats) => formatNumber(Math.round(80000 * (stats.percentageLived/100))),
        body: 'Statistisch gesehen hast du bereits viele der Menschen getroffen, die du kennenlernen wirst.' 
      }
    ]
  },
  { 
    id: 3, 
    label: 'Kosmische Perspektive', 
    icon: CosmosIcon,
    headline: 'Deine Existenz im Kontext des Universums.',
    cards: [
      { 
        id: 'universe-percentage', 
        title: 'Universumsanteil', 
        metric: (stats: LifeStats) => `${(80/13800000000 * 100).toFixed(10)}%`,
        body: 'Dein Anteil an der Geschichte des Universums? Radikal klein – und trotzdem alles, was du hast.' 
      },
      { 
        id: 'earth-travel', 
        title: 'Erdumlaufbahn', 
        metric: (stats: LifeStats) => `${formatNumber(Math.round(stats.daysLived * 1.6 * 1000000))} km`,
        body: 'So viele Kilometer warst du schon unterwegs – ohne irgendwas dafür zu tun. Zeit ist nicht nur Strecke. Sie ist Bewegung im Alltag.' 
      },
      { 
        id: 'galaxy-travel', 
        title: 'Milchstraßen-Reise', 
        metric: (stats: LifeStats) => `${formatNumber(Math.round(stats.daysLived * 24 * 828000))} km`,
        body: 'Unser Sonnensystem dröhnt durchs All. Du bist ein winziger Passagier – und trotzdem Teil von allem.' 
      }
    ]
  },
];

const renderHeadline = (tabId: number, stats: LifeStats) => {
  const tab = statsTabs[tabId];
  if (!tab) return '';
  
  // Only Tab 0 has placeholders
  if (tabId === 0) {
    return tab.headline
      .replace('{weeksLived}', formatNumber(stats.weeksLived))
      .replace('{weeksRemaining}', formatNumber(stats.weeksRemaining));
  }
  
  return tab.headline;
};

const COOKIE_NAME = 'fyf-life-weeks';
const COOKIE_MAX_AGE_DAYS = 60;
const CONSENT_COOKIE_NAME = 'fyf-cookie-consent';

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (name: string, value: string, days = COOKIE_MAX_AGE_DAYS) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

export default function LifeWeeksPage() {
  const [currentView, setCurrentView] = useState<'input' | 'grid' | 'typewriter' | 'navigation'>('input');
  const [currentStats, setCurrentStats] = useState<LifeStats | null>(null);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [birthdate, setBirthdate] = useState('');
  const [targetAge, setTargetAge] = useState('80');
  const [hoverInfo, setHoverInfo] = useState<{ visible: boolean; text: string }>({ visible: false, text: '' });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [consentStatus, setConsentStatus] = useState<'accepted' | 'declined' | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const legendTriggerRef = useRef<HTMLButtonElement | null>(null);
  const legendPopoverRef = useRef<HTMLDivElement | null>(null);

  const isPanelOpen = activeTab !== null;

  const sessionLoadedRef = useRef(false);

  const progressShares = useMemo(() => {
    if (!currentStats) {
      return { past: 0, present: 0, future: 100 };
    }

    const totalForProgress = Math.max(currentStats.totalWeeks, 1);
    const pastShare = Math.min(100, (currentStats.weeksLived / totalForProgress) * 100);
    const presentShare =
      currentStats.weeksLived >= currentStats.totalWeeks
        ? 0
        : Math.min(100 - pastShare, (1 / totalForProgress) * 100);
    const futureShare = Math.max(0, 100 - pastShare - presentShare);

    return { past: pastShare, present: presentShare, future: futureShare };
  }, [currentStats]);

  useEffect(() => {
    const updateConsent = () => {
      const consent = readCookie(CONSENT_COOKIE_NAME);
      if (consent === 'accepted' || consent === 'declined') {
        setConsentStatus(consent);
      } else {
        setConsentStatus(null);
      }

      if (consent !== 'accepted') {
        deleteCookie(COOKIE_NAME);
      }
    };

    updateConsent();
    window.addEventListener('fyf-cookie-consent-change', updateConsent);
    return () => window.removeEventListener('fyf-cookie-consent-change', updateConsent);
  }, []);

  useEffect(() => {
    if (sessionLoadedRef.current) return;
    if (consentStatus !== 'accepted') {
      sessionLoadedRef.current = true;
      return;
    }

    const stored = readCookie(COOKIE_NAME);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<{
          birthdate: string;
          targetAge: string;
        }>;

        if (parsed.birthdate) {
          setBirthdate(parsed.birthdate);
        }

        if (parsed.targetAge) {
          setTargetAge(parsed.targetAge);
        }
      } catch (error) {
        console.warn('Failed to parse life-weeks session cookie', error);
      }
    }

    sessionLoadedRef.current = true;
  }, [consentStatus]);

  useEffect(() => {
    if (!sessionLoadedRef.current) return;

    if (readCookie(CONSENT_COOKIE_NAME) !== 'accepted') {
      deleteCookie(COOKIE_NAME);
      return;
    }

    if (!birthdate && !targetAge) {
      deleteCookie(COOKIE_NAME);
      return;
    }

    const payload = JSON.stringify({
      birthdate,
      targetAge,
    });

    writeCookie(COOKIE_NAME, payload);
  }, [birthdate, targetAge, consentStatus]);

  useEffect(() => {
    if (!isLegendOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        legendPopoverRef.current &&
        legendTriggerRef.current &&
        !legendPopoverRef.current.contains(target) &&
        !legendTriggerRef.current.contains(target)
      ) {
        setIsLegendOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLegendOpen(false);
        legendTriggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLegendOpen]);



  const calculateStats = () => {
    if (!birthdate) return;

    const birthDate = new Date(birthdate);
    const today = new Date();
    const birthYear = birthDate.getFullYear();
    
    // Calculate weeks lived
    const msInWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksLived = Math.floor((today.getTime() - birthDate.getTime()) / msInWeek);

    // Based on "Four Thousand Weeks" concept (~77 years)
    const goalAge = Number(targetAge) || 80;
    const totalWeeks = Math.round(goalAge * 52);
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const percentageLived = Math.min(100, Math.round((weeksLived / totalWeeks) * 100));
    
    // Calculate days lived
    const msInDay = 1000 * 60 * 60 * 24;
    const daysLived = Math.floor((today.getTime() - birthDate.getTime()) / msInDay);
    const yearsLived = daysLived / 365.25;
    
    // Calculate various statistics
    const hoursSlept = Math.floor(daysLived * 8);
    const heartbeats = Math.floor(daysLived * 24 * 60 * 70);
    const breaths = Math.floor(daysLived * 24 * 60 * 16);
    const seasons = Math.floor(daysLived / 91.25);
    const remainingSummers = Math.max(0, Math.floor(goalAge - yearsLived));
    const remainingWeekends = Math.max(0, Math.round(weeksRemaining));
    
    const stats: LifeStats = {
      weeksLived, totalWeeks, weeksRemaining, percentageLived,
      daysLived, hoursSlept, heartbeats, breaths, seasons, birthYear,
      remainingSummers, remainingWeekends
    };

    setCurrentStats(stats);
    setCurrentView('grid');
  };



  const showHoverInfo = (cellIndex: number, event: React.MouseEvent) => {
    if (!currentStats) return;

    const totalWeeks = Math.max(0, currentStats.totalWeeks);
    const weekNumber = cellIndex + 1;
    if (weekNumber > totalWeeks) return;

    const hasFuture = currentStats.weeksLived < totalWeeks;
    const currentWeekIndex = hasFuture
      ? currentStats.weeksLived
      : Math.max(totalWeeks - 1, 0);

    let message = `Woche ${weekNumber}: `;

    if (cellIndex < currentWeekIndex) {
      message += `<span class="coral">Vergangenheit</span>`;
    } else if (cellIndex === currentWeekIndex) {
      message += `<span class="mint">Jetzt</span>`;
    } else {
      const weeksInFuture = cellIndex - currentWeekIndex;
      message += `<span class="steel">In ${weeksInFuture} Wochen</span>`;
    }

    // Smart positioning: right of cursor or above grid
    const gridBounds = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    let x = mouseX + 12;
    let y = mouseY - 8;
    
    // If too close to right edge, position above grid instead
    if (x + 200 > gridBounds.right) {
      x = gridBounds.right + 16;
      y = Math.min(mouseY, gridBounds.top - 40);
    }
    
    setTooltipPosition({ x, y });
    setHoverInfo({ visible: true, text: message });
  };

  const hideHoverInfo = () => {
    setHoverInfo({ visible: false, text: '' });
  };

  const resetVisualization = () => {
    setCurrentStats(null);
    setActiveTab(null);
    setBirthdate('');
    setTargetAge('80');
    setCurrentView('input');
    setHoverInfo({ visible: false, text: '' });
    setIsLegendOpen(false);
    deleteCookie(COOKIE_NAME);
  };

  const scrollToNavigation = () => {
    setCurrentView('navigation');
  };

  if (currentView === 'input') {
    return (
      <div className="container">
        <div className="main-view">
          <div className="input-card">
            <h2 className="fyf-display text-center mb-6" style={{ fontSize: '2rem' }}>
              Wann wurdest du geboren?
            </h2>
            <div className="input-group">
              <input 
                type="date" 
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="date-input" 
                required 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Wunsch-Zielalter (optional)</label>
              <input
                type="number"
                min={18}
                max={120}
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                className="date-input"
                placeholder="Standard: 80"
              />
            </div>
            <button 
              onClick={calculateStats} 
              className="fyf-btn fyf-btn-primary" 
              disabled={!birthdate}
            >
              Visualisierung starten
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'grid' && currentStats) {
    return (
      <div className="container">
        <section className="life-weeks-shell-v2">
          {/* Vertical Tab Strip (left, 60px) */}
          <div className="vertical-tab-strip">
            {statsTabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className="vertical-tab"
                  data-active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">
                    <IconComponent />
                  </span>
                  <span className="tab-label-vertical">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Grid Area (center, flex-grow) */}
          <div className="grid-main-area">
            <div className="title-container">
              <h1 className="fyf-display">
                <div className="coral">Life</div>
                <div className="cream">in</div>
                <div className="gradient-text">Weeks</div>
              </h1>
            </div>

            <div className="metrics-intro">
              <p className="font-roboto-mono text-sm uppercase tracking-[0.12em] text-fyf-steel/80">
                Zahlen sagen immer die Wahrheit.
                <br />Was machst du daraus?
              </p>
            </div>

            <div className={`week-grid-wrapper ${isPanelOpen ? 'week-grid-wrapper--muted' : ''}`}>
              <div className="grid-container-with-legend">
                <WeekGrid 
                  currentStats={currentStats} 
                  onHover={showHoverInfo}
                  onLeave={hideHoverInfo}
                />

                {/* Legend positioned right side of grid */}
                <div className="grid-legend-overlay">
                  <button 
                    className="legend-toggle-btn"
                    onClick={() => setIsLegendOpen(!isLegendOpen)}
                    aria-haspopup="dialog"
                    aria-expanded={isLegendOpen}
                    aria-controls="grid-legend-panel"
                  >
                    <span>ℹ︎</span>
                  </button>
                  
                  {isLegendOpen && (
                    <div className="legend-panel" id="grid-legend-panel">
                      <p className="legend-title">Wie lese ich das Wochenraster?</p>
                      <ul className="legend-list">
                        <li><span className="dot past" />Vergangene Wochen ({formatNumber(currentStats.weeksLived)})</li>
                        <li><span className="dot present" />Aktuelle Woche</li>
                        <li><span className="dot future" />Verbleibende Wochen ({formatNumber(currentStats.weeksRemaining)})</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {hoverInfo.visible && (
                <div 
                  className="hover-info"
                  style={{
                    left: tooltipPosition.x,
                    top: tooltipPosition.y,
                  }}
                >
                  <p className="steel" dangerouslySetInnerHTML={{ __html: hoverInfo.text }}></p>
                </div>
              )}
            </div>

            {/* CTA - Subtle button at bottom left */}
            <a href="/onboarding" className="subtle-cta-button">
              Bist du bereit FYF zu entdecken?
            </a>
          </div>

          {/* Off-Canvas Panel (slides from left over grid) */}
          <div className={`metrics-panel-offcanvas ${isPanelOpen ? 'is-open' : ''}`}>
            <CardsPanel 
              activeTab={activeTab}
              statsTabs={statsTabs}
              currentStats={currentStats}
              onClose={() => setActiveTab(null)}
            />
          </div>
        </section>
      </div>
    );
  }

  if (currentView === 'typewriter') {
    return (
      <div className="container">
        <div className="typewriter-section">
          <div className="blackhole-bg">
            <BlackholeAnimation isVisible={true} />
            <div className="typewriter-container">
              <div className="content" onClick={scrollToNavigation}>
                <h1 className="title" style={{ cursor: 'pointer' }}>
                  <div className="fuck-line">FUCK...</div>
                  <div className="your-line">YOUR</div>
                  <div className="future-line">FUTURE</div>
                </h1>
                <p className="tagline visible">Ready to own your time?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'navigation') {
    return (
      <div className="container">
        <div className="navigation-section">
          <div className="nav-container">
            <a href="/feedboard" className="nav-item">
              <span className="nav-text">GUIDE</span>
            </a>
            <a href="/people" className="nav-item">
              <span className="nav-text">PEOPLE</span>
            </a>
            <a href="/access" className="nav-item">
              <span className="nav-text">ACCESS</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// CardsPanel Component
interface CardsPanelProps {
  activeTab: number | null;
  statsTabs: StatTab[];
  currentStats: LifeStats | null;
  onClose: () => void;
}

function CardsPanel({ activeTab, statsTabs, currentStats, onClose }: CardsPanelProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const isPanelOpen = activeTab !== null;

  // Focus close button when panel opens (mobile accessibility)
  useEffect(() => {
    if (isPanelOpen && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [isPanelOpen]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, onClose]);

  if (!currentStats || activeTab === null) {
    return (
      <div className="cards-panel">
        {/* Empty mounted panel for smooth transitions */}
      </div>
    );
  }

  const currentTab = statsTabs[activeTab];

  return (
    <div 
      className={`cards-panel ${isPanelOpen ? 'cards-panel--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      <div className="cards-panel__veil" aria-hidden="true" />
      
      <header className="cards-panel__header">
        <h2 id="panel-title" className="cards-panel__title">
          {currentTab.label}
        </h2>
        <button 
          ref={closeBtnRef}
          onClick={onClose} 
          className="cards-panel__close"
          aria-label="Panel schließen"
        >
          ×
        </button>
      </header>

      <div className="cards-panel__body">
        {currentTab.cards.map((card: StatCard) => (
          <article key={card.id} className="cards-panel__card">
            <h3 className="card-title">{card.title}</h3>
            <div className="card-metric">
              {typeof card.metric === 'function' ? card.metric(currentStats) : card.metric}
            </div>
            <p className="card-body">{card.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}


// WeekGrid Component
function WeekGrid({
  currentStats,
  onHover,
  onLeave,
}: {
  currentStats: LifeStats;
  onHover: (index: number, event: React.MouseEvent) => void;
  onLeave: () => void;
}) {
  const determineWeeksPerRow = (width: number, total: number) => {
    const availableWidth = Math.max(width - 64, 240);
    const targetSize = width < 480 ? 12 : width < 1024 ? 11 : 9;
    const calculatedColumns = Math.floor(availableWidth / targetSize);
    const boundedColumns = Math.min(80, Math.max(20, calculatedColumns));
    return Math.min(boundedColumns, total);
  };

  const initialWeeksPerRow =
    typeof window === 'undefined'
      ? Math.min(80, currentStats.totalWeeks)
      : determineWeeksPerRow(window.innerWidth, currentStats.totalWeeks);

  const [weeksPerRow, setWeeksPerRow] = useState(initialWeeksPerRow);
  const [cells, setCells] = useState<
    Array<{ cellIndex: number; isPast: boolean; isCurrent: boolean }>
  >([]);

  const totalWeeks = Math.max(1, currentStats.totalWeeks);

  useEffect(() => {
    const handleResize = () => {
      const next = determineWeeksPerRow(window.innerWidth, totalWeeks);
      setWeeksPerRow((prev) => (prev === next ? prev : next));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalWeeks]);

  useEffect(() => {
    const adjustedWeeksPerRow = Math.max(
      1,
      Math.min(weeksPerRow, totalWeeks),
    );
    const totalRows = Math.ceil(totalWeeks / adjustedWeeksPerRow);

    const hasFuture = currentStats.weeksLived < totalWeeks;
    const currentWeekIndex = hasFuture
      ? currentStats.weeksLived
      : Math.max(totalWeeks - 1, 0);

    const allCells: Array<{
      cellIndex: number;
      isPast: boolean;
      isCurrent: boolean;
    }> = [];

    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < adjustedWeeksPerRow; col++) {
        const cellIndex = row * adjustedWeeksPerRow + col;
        if (cellIndex >= totalWeeks) break;

        const isPast = cellIndex < currentWeekIndex;
        const isCurrent = cellIndex === currentWeekIndex;

        allCells.push({ cellIndex, isPast, isCurrent });
      }
    }

    setCells(allCells);
  }, [currentStats, totalWeeks, weeksPerRow]);

  const effectiveWeeksPerRow = Math.max(
    1,
    Math.min(weeksPerRow, totalWeeks),
  );

  return (
    <div
      className="week-grid"
      style={{
        gridTemplateColumns: `repeat(${effectiveWeeksPerRow}, minmax(0, 1fr))`,
      }}
    >
      {cells.map((cell) => {
        const { cellIndex, isPast, isCurrent } = cell;
        let className = 'week-cell';

        if (isPast) className += ' week-past';
        else if (isCurrent) className += ' week-current';
        else className += ' week-future';

        return (
          <div
            key={cellIndex}
            className={className}
            onMouseEnter={(e) => onHover(cellIndex, e)}
            onMouseLeave={onLeave}
          />
        );
      })}
    </div>
  );
}
