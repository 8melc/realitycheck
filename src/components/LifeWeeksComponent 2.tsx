'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import BlackholeAnimation from './BlackholeAnimation';
import StatIcon from './icons/StatIcon';
import SocietyIcon from './icons/SocietyIcon';
import CosmosIcon from './icons/CosmosIcon';
import NatureIcon from './icons/NatureIcon';

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

interface LifeWeeksComponentProps {
  onClose?: () => void;
  isInline?: boolean;
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
      { 
        id: 'heartbeats', 
        title: 'Herzschläge', 
        metric: (stats: LifeStats) => formatNumber(stats.heartbeats),
        body: 'Dein Herz-Kreislauf-System arbeitet unermüdlich für dich.' 
      }
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
        body: 'So viele Sommer kannst du noch bewusst erleben.' 
      },
      { 
        id: 'seasons-lived', 
        title: 'Jahreszeiten erlebt', 
        metric: (stats: LifeStats) => formatNumber(stats.seasons),
        body: 'Jede Jahreszeit bringt ihre eigene Magie und Energie.' 
      },
      { 
        id: 'hours-slept', 
        title: 'Stunden geschlafen', 
        metric: (stats: LifeStats) => formatNumber(stats.hoursSlept),
        body: 'Schlaf ist die Grundlage für ein bewusstes, erfülltes Leben.' 
      },
      { 
        id: 'breaths', 
        title: 'Atemzüge', 
        metric: (stats: LifeStats) => formatNumber(stats.breaths),
        body: 'Jeder Atemzug ist ein Geschenk – atme bewusst.' 
      }
    ]
  },
  { 
    id: 2, 
    label: 'Gesellschaftlicher Kontext', 
    icon: SocietyIcon,
    headline: 'Dein Platz in der größeren Geschichte der Menschheit.',
    cards: [
      { 
        id: 'population-birth', 
        title: 'Weltbevölkerung bei deiner Geburt', 
        metric: (stats: LifeStats) => formatNumber(getPopulationAtYear(stats.birthYear)),
        body: 'So viele Menschen lebten auf der Erde, als du geboren wurdest.' 
      },
      { 
        id: 'population-now', 
        title: 'Weltbevölkerung heute', 
        metric: (stats: LifeStats) => formatNumber(getPopulationAtYear(2024)),
        body: 'Die Weltbevölkerung wächst stetig – dein Beitrag zählt.' 
      },
      { 
        id: 'population-growth', 
        title: 'Bevölkerungswachstum', 
        metric: (stats: LifeStats) => formatNumber(getPopulationAtYear(2024) - getPopulationAtYear(stats.birthYear)),
        body: 'So viele Menschen sind seit deiner Geburt dazugekommen.' 
      }
    ]
  },
  { 
    id: 3, 
    label: 'Kosmische Perspektive', 
    icon: CosmosIcon,
    headline: 'Dein Leben im Kontext des Universums.',
    cards: [
      { 
        id: 'earth-orbits', 
        title: 'Erdumrundungen', 
        metric: (stats: LifeStats) => formatNumber(stats.weeksLived / 52),
        body: 'So oft ist die Erde um die Sonne gewandert, seit du lebst.' 
      },
      { 
        id: 'moon-cycles', 
        title: 'Mondzyklen', 
        metric: (stats: LifeStats) => formatNumber(stats.weeksLived / 4),
        body: 'So viele Mondzyklen hast du bereits erlebt.' 
      }
    ]
  }
];

const COOKIE_NAME = 'fyf-life-data';

const writeCookie = (name: string, value: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export default function LifeWeeksComponent({ onClose, isInline = false }: LifeWeeksComponentProps) {
  const [birthdate, setBirthdate] = useState('');
  const [targetAge, setTargetAge] = useState(75);
  const [activeTab, setActiveTab] = useState(0);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [showBlackhole, setShowBlackhole] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  
  const legendPopoverRef = useRef<HTMLDivElement>(null);
  const legendTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const cookieData = readCookie(COOKIE_NAME);
    if (cookieData) {
      try {
        const data = JSON.parse(cookieData);
        setBirthdate(data.birthdate || '');
        setTargetAge(data.targetAge || 75);
        setConsentStatus('granted');
        setIsCalculated(true);
      } catch (error) {
        console.error('Error parsing cookie data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (birthdate && consentStatus === 'granted') {
      setShowBlackhole(true);
      setTimeout(() => {
        setShowBlackhole(false);
        setIsCalculated(true);
      }, 2000);

      writeCookie(COOKIE_NAME, JSON.stringify({
        birthdate,
        targetAge,
      }));
    }
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
    
    // Calculate total weeks (assuming target age)
    const totalWeeks = targetAge * 52;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const percentageLived = (weeksLived / totalWeeks) * 100;
    
    // Calculate other metrics
    const daysLived = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const hoursSlept = Math.floor(daysLived * 8); // Assuming 8 hours sleep per day
    const heartbeats = Math.floor(daysLived * 24 * 60 * 70); // 70 BPM average
    const breaths = Math.floor(daysLived * 24 * 60 * 16); // 16 breaths per minute average
    const seasons = Math.floor(weeksLived / 13); // 13 weeks per season
    const remainingSummers = Math.floor(weeksRemaining / 52);
    const remainingWeekends = Math.floor(weeksRemaining * 2 / 7); // 2 weekend days per week

    return {
      weeksLived,
      totalWeeks,
      weeksRemaining,
      percentageLived,
      daysLived,
      hoursSlept,
      heartbeats,
      breaths,
      seasons,
      birthYear,
      remainingSummers,
      remainingWeekends
    };
  };

  const stats = useMemo(() => calculateStats(), [birthdate, targetAge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthdate) {
      setConsentStatus('granted');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (showBlackhole) {
    return (
      <div className={`${isInline ? 'lifeweeks-inline' : 'min-h-screen'} bg-fyf-noir flex items-center justify-center`}>
        <BlackholeAnimation isVisible={true} />
      </div>
    );
  }

  if (!isCalculated) {
    return (
      <div className={`${isInline ? 'lifeweeks-inline' : 'min-h-screen'} bg-fyf-noir flex items-center justify-center px-6`}>
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-fyf-cream mb-4">
              Deine Lebenswochen
            </h1>
            <p className="text-fyf-steel">
              Gib dein Geburtsdatum ein, um dein Leben in Wochen zu visualisieren.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-fyf-cream mb-2">
                Geburtsdatum
              </label>
              <input
                type="date"
                id="birthdate"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-4 py-3 bg-fyf-charcoal border border-fyf-smoke rounded-lg text-fyf-cream focus:border-fyf-coral focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="targetAge" className="block text-sm font-medium text-fyf-cream mb-2">
                Zielalter (optional)
              </label>
              <input
                type="number"
                id="targetAge"
                value={targetAge}
                onChange={(e) => setTargetAge(Number(e.target.value))}
                min="50"
                max="120"
                className="w-full px-4 py-3 bg-fyf-charcoal border border-fyf-smoke rounded-lg text-fyf-cream focus:border-fyf-coral focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-fyf-coral hover:bg-fyf-coral-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Visualisierung starten
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isInline ? 'lifeweeks-inline' : 'min-h-screen'} bg-fyf-noir text-fyf-cream`}>
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-fyf-noir via-fyf-charcoal to-fyf-noir"></div>
        <div className="relative z-10 py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 gradient-coral-mint bg-clip-text text-transparent">
                  Deine Lebenswochen
                </h1>
                <p className="text-fyf-steel text-lg max-w-2xl">
                  {stats && `Du hast ${formatNumber(stats.weeksLived)} Wochen gelebt und hast noch ${formatNumber(stats.weeksRemaining)} Wochen vor dir.`}
                </p>
              </div>
              
              {onClose && (
                <button
                  onClick={handleClose}
                  className="text-fyf-steel hover:text-fyf-coral transition-colors p-2"
                  aria-label="Schließen"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-fyf-coral rounded"></div>
                <span className="text-fyf-steel text-sm">Vergangenheit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-fyf-mint rounded"></div>
                <span className="text-fyf-steel text-sm">Gegenwart</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-fyf-charcoal border border-fyf-smoke rounded"></div>
                <span className="text-fyf-steel text-sm">Zukunft</span>
              </div>
              
              <button
                ref={legendTriggerRef}
                onClick={() => setIsLegendOpen(!isLegendOpen)}
                className="text-fyf-mint hover:text-fyf-mint-dark text-sm underline"
              >
                Mehr erfahren
              </button>
            </div>

            {isLegendOpen && (
              <div
                ref={legendPopoverRef}
                className="absolute z-20 bg-fyf-charcoal border border-fyf-smoke rounded-lg p-4 max-w-md"
              >
                <h3 className="font-semibold text-fyf-cream mb-2">Was bedeuten die Farben?</h3>
                <p className="text-fyf-steel text-sm mb-2">
                  <span className="text-fyf-coral">Rote Wochen</span> zeigen deine Vergangenheit – Zeit, die du bereits gelebt hast.
                </p>
                <p className="text-fyf-steel text-sm mb-2">
                  <span className="text-fyf-mint">Grüne Wochen</span> markieren deine Gegenwart – die Zeit, in der du jetzt lebst.
                </p>
                <p className="text-fyf-steel text-sm">
                  <span className="text-fyf-steel">Graue Wochen</span> repräsentieren deine Zukunft – Zeit, die noch vor dir liegt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Life Grid */}
      {stats && (
        <div className="px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-52 gap-1 mb-8">
              {Array.from({ length: stats.totalWeeks }, (_, index) => {
                const weekNumber = index + 1;
                const isPast = weekNumber <= stats.weeksLived;
                const isCurrent = weekNumber === stats.weeksLived + 1;
                
                return (
                  <div
                    key={weekNumber}
                    className={`w-2 h-2 rounded-sm ${
                      isPast 
                        ? 'bg-fyf-coral' 
                        : isCurrent 
                        ? 'bg-fyf-mint' 
                        : 'bg-fyf-charcoal border border-fyf-smoke'
                    } hover:scale-125 transition-transform cursor-pointer`}
                    title={`Woche ${weekNumber}${isPast ? ' (Vergangenheit)' : isCurrent ? ' (Gegenwart)' : ' (Zukunft)'}`}
                  />
                );
              })}
            </div>

            {/* Stats Tabs */}
            <div className="space-y-8">
              <div className="flex flex-wrap gap-2">
                {statsTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-fyf-coral text-white'
                          : 'bg-fyf-charcoal text-fyf-steel hover:bg-fyf-smoke'
                      }`}
                    >
                      <IconComponent />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="bg-fyf-charcoal rounded-xl p-6">
                <h2 className="font-display text-2xl font-bold mb-6 text-fyf-cream">
                  {statsTabs[activeTab].headline.replace('{weeksLived}', formatNumber(stats.weeksLived)).replace('{weeksRemaining}', formatNumber(stats.weeksRemaining))}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statsTabs[activeTab].cards.map((card) => (
                    <div key={card.id} className="bg-fyf-noir p-4 rounded-lg border border-fyf-smoke">
                      <h3 className="font-semibold text-fyf-coral mb-2">{card.title}</h3>
                      <div className="text-2xl font-bold text-fyf-cream mb-2">
                        {card.metric(stats)}
                      </div>
                      <p className="text-fyf-steel text-sm">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
