'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { useUsageStore } from '@/stores/usageStore';
import SessionUsageBadge from '@/components/session/SessionUsageBadge';
import UsageWarningBanner from '@/components/session/UsageWarningBanner';
import LimitReachedModal from '@/components/session/LimitReachedModal';

interface FeedCard {
  id: string;
  type: 'article' | 'quote' | 'video' | 'people' | 'event';
  size: 'small' | 'medium' | 'large' | 'wide' | 'full';
  title: string;
  content: any;
  tags?: string[];
  matchScore?: number;
  priority?: 'hero' | 'highlight';
  summary?: string;
}

export default function GuideFeed() {
  const [isZoomedIn, setZoomedIn] = useState(false);
  const [focusedCard, setFocusedCard] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollAmount, setScrollAmount] = useState(0.78);
  const [translateX, setTranslateX] = useState(-185);
  const [translateY, setTranslateY] = useState(-192);
  const [currentTranslateX, setCurrentTranslateX] = useState(-185);
  const [currentTranslateY, setCurrentTranslateY] = useState(-192);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [guidePanelOpen, setGuidePanelOpen] = useState(false);
  const [guideInputVisible, setGuideInputVisible] = useState(false);
  const [guideOverlayActive, setGuideOverlayActive] = useState(false);
  const [tone, setTone] = useState<'straight' | 'soft'>('straight');
  const [viewMode, setViewMode] = useState<'focus' | 'explore' | 'pulse'>('focus');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Session Timer & Usage Limit
  const { dailyLimitMinutes, limitReached, ensureUsageLoaded } = useUsageStore();
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  // Session Timer Hook
  const sessionTimer = useSessionTimer({
    limitMinutes: dailyLimitMinutes,
    onWarning80: () => {
      setShowWarningBanner(true);
      setWarningDismissed(false);
    },
    onWarning95: () => {
      setShowWarningBanner(true);
      setWarningDismissed(false);
    },
    onLimitReached: () => {
      setShowLimitModal(true);
    },
  });

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "TICK TOCK! Du hast heute schon 3 Stunden gescrollt. Das sind 180 Minuten deines einzigen Lebens. Wake the fuck up.",
      type: 'guide'
    },
    {
      id: 2,
      text: "Dein Zeit-Score heute: 23% - 77% verschwendet. Das geht besser. Viel besser.",
      type: 'guide'
    },
    {
      id: 3,
      text: "Sarah Chen hat gemacht, wovon du nur träumst. Connect mit ihr oder scroll weiter ins Nichts.",
      type: 'guide'
    }
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const navHelperRef = useRef<HTMLDivElement>(null);
  const guideInputRef = useRef<HTMLInputElement>(null);
  const guideHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const onboardingSlides = useMemo(() => ([
    {
      title: 'Dein Fokus-Feed wartet',
      body: 'Zoom rein, schnapp dir die Spotlight-Story und lass TICK TOCK deinen Tag priorisieren.'
    },
    {
      title: 'Guide im Griff',
      body: 'CMD + J öffnet das Interface. Stell den Ton ein, gib deinen Intent ein und wir kuratieren live.'
    }
  ]), []);

  // Ensure usage data is loaded and initialize session timer
  useEffect(() => {
    if (!dailyLimitMinutes && !limitReached) {
      ensureUsageLoaded();
    }
  }, [dailyLimitMinutes, limitReached, ensureUsageLoaded]);

  // Initialize session timer when dailyLimitMinutes is available
  useEffect(() => {
    if (dailyLimitMinutes) {
      sessionTimer.startTimer();
    }
  }, [dailyLimitMinutes]);

  // Handle logout when limit is reached
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login?limitReached=1';
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: redirect anyway
      window.location.href = '/login?limitReached=1';
    }
  };

  // Handle warning banner dismiss
  const handleWarningDismiss = () => {
    setWarningDismissed(true);
    setShowWarningBanner(false);
  };

  const feedCards: FeedCard[] = [
    {
      id: '1',
      type: 'article',
      size: 'medium',
      title: 'Die Illusion der unendlichen Zeit',
      matchScore: 82,
      tags: ['Mindset', 'Zeitführung'],
      content: {
        heroImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        favicon: 'M',
        domain: 'medium.com',
        excerpt: 'Wir leben, als hätten wir ewig Zeit. Doch die Realität ist brutal...',
        readTime: '5 Min. Lesezeit'
      }
    },
    {
      id: '2',
      type: 'quote',
      size: 'medium',
      title: 'Du hast zwei Leben',
      content: {
        text: '"Du hast zwei Leben. Das zweite beginnt, wenn du erkennst, dass du nur eines hast."',
        author: '— Konfuzius'
      }
    },
    {
      id: '3',
      type: 'video',
      size: 'medium',
      title: 'How to Actually Use Your Time',
      priority: 'highlight',
      matchScore: 76,
      tags: ['Deep Work', 'Mindset'],
      content: {
        thumbnail: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8))',
        author: 'Ali Abdaal',
        duration: '12:34'
      }
    },
    {
      id: '4',
      type: 'people',
      size: 'medium',
      title: 'Sarah Chen',
      priority: 'highlight',
      matchScore: 88,
      tags: ['Vorbild', 'Lifestyle'],
      content: {
        avatar: '🚀',
        name: 'Sarah Chen',
        bio: 'Digital Nomad seit 2019. Lebt ihre Vision von Freiheit.'
      }
    },
    {
      id: '5',
      type: 'event',
      size: 'medium',
      title: 'FYF Festival 2025',
      matchScore: 71,
      tags: ['Live', 'Momentum'],
      content: {
        badge: 'LIVE EVENT',
        location: 'Hamburg · Kampnagel',
        timeLeft: '137 Tage'
      }
    },
    {
      id: '6',
      type: 'article',
      size: 'medium',
      title: 'The Attention Economy Is Eating Your Life',
      matchScore: 68,
      tags: ['Attention', 'Mindset'],
      content: {
        heroImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        favicon: 'W',
        domain: 'wired.com',
        excerpt: 'Every notification steals your most precious resource...',
        readTime: '8 Min. Lesezeit'
      }
    },
    {
      id: '7',
      type: 'quote',
      size: 'wide',
      title: 'Zeit ist das, was verhindert',
      matchScore: 73,
      tags: ['Mindset'],
      content: {
        text: '"Zeit ist das, was verhindert, dass alles auf einmal passiert."',
        author: '— Ray Cummings'
      }
    },
    {
      id: '8',
      type: 'people',
      size: 'medium',
      title: 'Marcus Weber',
      content: {
        avatar: '💡',
        name: 'Marcus Weber',
        bio: 'Gründer & Impact Investor. Baut die Zukunft.'
      }
    },
    {
      id: '9',
      type: 'article',
      size: 'medium',
      title: 'The Privilege of Time: Who Gets to Waste It?',
      content: {
        heroImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        favicon: 'N',
        domain: 'newyorker.com',
        excerpt: 'In our society, the ability to \'waste\' time has become the ultimate luxury...',
        readTime: '12 Min. Lesezeit'
      }
    },
    {
      id: '10',
      type: 'event',
      size: 'medium',
      title: 'Zeit-Audit Masterclass',
      matchScore: 84,
      tags: ['Workshop', 'Deep Work'],
      content: {
        badge: 'WORKSHOP',
        location: 'Online · Zoom',
        timeLeft: '42 Tage'
      }
    },
    {
      id: '11',
      type: 'video',
      size: 'medium',
      title: 'Why You\'re Always Running Out of Time',
      matchScore: 77,
      tags: ['Animation', 'Time Mastery'],
      content: {
        thumbnail: 'linear-gradient(135deg, rgba(250, 112, 154, 0.8), rgba(254, 225, 64, 0.8))',
        author: 'Kurzgesagt',
        duration: '9:21'
      }
    },
    {
      id: '12',
      type: 'quote',
      size: 'small',
      title: 'Wir müssen die Zeit als Werkzeug benutzen',
      content: {
        text: '"Wir müssen die Zeit als Werkzeug benutzen, nicht als Sofa."',
        author: '— JFK'
      }
    },
    {
      id: '13',
      type: 'people',
      size: 'small',
      title: 'Luna Petrova',
      content: {
        avatar: '🎨',
        name: 'Luna Petrova',
        bio: 'Künstlerin & Zeit-Philosophin'
      }
    },
    {
      id: '14',
      type: 'article',
      size: 'medium',
      title: 'The Tyranny of the Clock',
      content: {
        heroImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        favicon: 'A',
        domain: 'aeon.co',
        excerpt: 'From sundials to smartphones, we\'ve created a prison of perpetual urgency...',
        readTime: '15 Min. Lesezeit'
      }
    },
    {
      id: '15',
      type: 'event',
      size: 'wide',
      title: '48h Digital Detox',
      matchScore: 79,
      tags: ['Retreat', 'Reset'],
      content: {
        badge: 'RETREAT',
        location: 'Schwarzwald · Wald & Berge',
        timeLeft: '89 Tage'
      }
    },
    {
      id: '16',
      type: 'quote',
      size: 'small',
      title: 'The bad news is time flies',
      content: {
        text: '"The bad news is time flies. The good news is you\'re the pilot."',
        author: '— Altshuler'
      }
    },
    {
      id: '17',
      type: 'article',
      size: 'small',
      title: 'The Rise of Time Poverty',
      content: {
        heroImage: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        favicon: 'T',
        domain: 'time.com',
        excerpt: 'Despite all our time-saving technology...',
        readTime: '7 Min. Lesezeit'
      }
    },
    {
      id: '18',
      type: 'video',
      size: 'medium',
      title: 'Stop Wasting Your 20s',
      matchScore: 83,
      tags: ['Momentum', 'Mindset'],
      content: {
        thumbnail: 'linear-gradient(135deg, rgba(48, 207, 208, 0.8), rgba(51, 8, 103, 0.8))',
        author: 'Hamza',
        duration: '18:42'
      }
    },
    {
      id: '19',
      type: 'people',
      size: 'small',
      title: 'Nina Richter',
      content: {
        avatar: '🌟',
        name: 'Nina Richter',
        bio: 'Creative Direction'
      }
    },
    {
      id: '20',
      type: 'article',
      size: 'large',
      title: 'Why Hustle Culture Is Killing You',
      priority: 'hero',
      matchScore: 94,
      tags: ['Regeneration', 'Mindset'],
      summary: 'Schraub dein Hustle-Level runter und hol dir 12 Stunden Fokus zurück – ohne schlechter zu performen.',
      content: {
        heroImage: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        favicon: 'F',
        domain: 'fastcompany.com',
        excerpt: 'The toxic truth about productivity obsession and why the cult of busy is destroying our mental health, relationships, and actual output...',
        readTime: '6 Min. Lesezeit'
      }
    }
  ];

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element) {
      if (e.target.closest('.feed-card') || 
          e.target.closest('.guide-input-container') ||
          e.target.closest('.guide-panel') || 
          e.target.closest('.guide-toggle') ||
          e.target.closest('.controls') || 
          e.target.closest('.nav-helper')) {
        return;
      }
    }

    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    shellRef.current?.classList.add('dragging');
    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const speedMultiplier = scrollAmount > 0.8 ? 0.015 : 0.03;
    const deltaX = (e.clientX - startX) * speedMultiplier;
    const deltaY = (e.clientY - startY) * speedMultiplier;

    const newTranslateX = translateX + deltaX;
    const newTranslateY = translateY + deltaY;

    const maxOffset = 80;
    const clampedX = Math.max(-200 - maxOffset, Math.min(-200 + maxOffset, newTranslateX));
    const clampedY = Math.max(-200 - maxOffset, Math.min(-200 + maxOffset, newTranslateY));

    setCurrentTranslateX(clampedX);
    setCurrentTranslateY(clampedY);

    if (containerRef.current) {
      containerRef.current.style.transform = `translate(${clampedX}vw, ${clampedY}vh) scale(${scrollAmount})`;
    }
  };

  const handleMouseUp = () => {
    shellRef.current?.classList.remove('dragging');
    if (isDragging) {
      setIsDragging(false);
      setTranslateX(currentTranslateX);
      setTranslateY(currentTranslateY);
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.3s ease-out';
      }
    }
  };

  // Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (navHelperRef.current) {
      navHelperRef.current.style.opacity = '0';
      setTimeout(() => {
        if (navHelperRef.current) {
          navHelperRef.current.style.opacity = '1';
        }
      }, 1200);
    }

    const oldScale = scrollAmount;
    let newScale = scrollAmount;

    if (e.deltaY < 0) {
      newScale = Math.max(0.35, scrollAmount - 0.05);
    } else {
      newScale = Math.min(1.0, scrollAmount + 0.05);
    }

    setScrollAmount(newScale);

    // Zoom towards cursor position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const scaleChange = newScale / oldScale;

      const newCurrentX = currentTranslateX - (cursorX * (scaleChange - 1) / window.innerWidth * 100);
      const newCurrentY = currentTranslateY - (cursorY * (scaleChange - 1) / window.innerHeight * 100);

      setCurrentTranslateX(newCurrentX);
      setCurrentTranslateY(newCurrentY);
      setTranslateX(newCurrentX);
      setTranslateY(newCurrentY);

      containerRef.current.style.transform = `translate(${newCurrentX}vw, ${newCurrentY}vh) scale(${newScale})`;
    }

    const newIsZoomedIn = newScale >= 0.8;
    setZoomedIn(newIsZoomedIn);

    if (newIsZoomedIn) {
      if (containerRef.current) {
        containerRef.current.classList.add('zoomed-in', 'navigate-mode');
      }
      showGuideHint();
    } else {
      if (containerRef.current) {
        containerRef.current.classList.remove('zoomed-in', 'navigate-mode');
      }
    }

    setTimeout(() => {
      if (navHelperRef.current) {
        navHelperRef.current.style.opacity = '1';
      }
    }, 2000);
  };

  // Card interactions
  const handleCardClick = (cardId: string) => {
    if (expandedCard === cardId) return;
    setExpandedCard(cardId);
    document.body.classList.add('card-expanded');
  };

  const closeExpandedCard = () => {
    setExpandedCard(null);
    document.body.classList.remove('card-expanded');
  };

  // Guide functions
  const showGuideHint = useCallback(() => {
    if (showOnboarding) return;

    if (guideHintTimeoutRef.current) {
      clearTimeout(guideHintTimeoutRef.current);
    }

    guideHintTimeoutRef.current = setTimeout(() => {
      if (!isZoomedIn || focusedCard) {
        guideHintTimeoutRef.current = null;
        return;
      }

      setGuideOverlayActive(true);
      guideHintTimeoutRef.current = setTimeout(() => {
        setGuideOverlayActive(false);
        guideHintTimeoutRef.current = null;
      }, 4200);
    }, 1200);
  }, [focusedCard, isZoomedIn, showOnboarding]);

  const toggleGuide = () => {
    setGuidePanelOpen(!guidePanelOpen);
    
    const newMessage = {
      id: Date.now(),
      text: `Guide ${!guidePanelOpen ? 'aktiviert' : 'deaktiviert'}! ${!guidePanelOpen ? 'Ich helfe dir, den Überblick zu behalten.' : 'Du bist auf dich allein gestellt.'}`,
      type: 'guide' as const
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const toggleTone = (newTone: 'straight' | 'soft') => {
    setTone(newTone);
    
    const newMessage = {
      id: Date.now(),
      text: newTone === 'straight' 
        ? "Straight Talk aktiviert. Alright, ich sag's dir wie es ist. Keine Kuschel-Scheiße mehr."
        : "Soft Touch aktiviert. Okay, ich bin jetzt etwas sanfter zu dir. Aber die Wahrheit bleibt die gleiche.",
      type: 'guide' as const
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const applyViewMode = useCallback((mode: 'focus' | 'explore' | 'pulse') => {
    let targetScale = 0.65;
    let targetTranslateX = -200;
    let targetTranslateY = -200;

    switch (mode) {
      case 'focus':
        targetScale = 0.78;
        targetTranslateX = -185;
        targetTranslateY = -192;
        break;
      case 'pulse':
        targetScale = 0.85;
        targetTranslateX = -178;
        targetTranslateY = -188;
        break;
      default:
        targetScale = 0.6;
        targetTranslateX = -205;
        targetTranslateY = -208;
        break;
    }

    setScrollAmount(targetScale);
    setTranslateX(targetTranslateX);
    setTranslateY(targetTranslateY);
    setCurrentTranslateX(targetTranslateX);
    setCurrentTranslateY(targetTranslateY);

    const shouldZoom = targetScale >= 0.8;
    setZoomedIn(shouldZoom);
    setFocusedCard(null);
    if (expandedCard) {
      setExpandedCard(null);
      document.body.classList.remove('card-expanded');
    }

    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      containerRef.current.style.transform = `translate(${targetTranslateX}vw, ${targetTranslateY}vh) scale(${targetScale})`;
      containerRef.current.classList.toggle('zoomed-in', shouldZoom);
      containerRef.current.classList.toggle('navigate-mode', true);

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = '';
        }
      }, 480);
    }

    if (navHelperRef.current) {
      navHelperRef.current.style.opacity = '0';
    }

    if (shouldZoom) {
      showGuideHint();
    } else {
      setGuideOverlayActive(false);
    }
  }, [expandedCard, showGuideHint]);

  const handleViewModeChange = (mode: 'focus' | 'explore' | 'pulse') => {
    if (mode === viewMode) return;
    
    setViewMode(mode);
    applyViewMode(mode);

    const modeCopy: Record<'focus' | 'explore' | 'pulse', string> = {
      focus: 'Fokus',
      explore: 'Explore',
      pulse: 'Pulse'
    };

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: `Mode gewechselt: ${modeCopy[mode]}. Ich tune den Feed für dich.`,
        type: 'guide' as const
      }
    ]);
  };

  const revealGuideInput = useCallback(() => {
    setGuideInputVisible(true);
    setTimeout(() => guideInputRef.current?.focus(), 120);
  }, []);

  useEffect(() => {
    applyViewMode('focus');
  }, [applyViewMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSeenOnboarding = window.localStorage.getItem('fyf-guide-onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (guideHintTimeoutRef.current) {
        clearTimeout(guideHintTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!navHelperRef.current) return;
    navHelperRef.current.style.opacity = showOnboarding ? '0' : '1';
  }, [showOnboarding]);

  const persistOnboardingDismiss = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('fyf-guide-onboarding', 'seen');
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
    persistOnboardingDismiss();
    if (!guidePanelOpen) {
      applyViewMode(viewMode);
    }
  };

  const handleOnboardingAdvance = () => {
    if (onboardingStep < onboardingSlides.length - 1) {
      setOnboardingStep(prev => prev + 1);
      return;
    }

    closeOnboarding();
  };

  const handleOnboardingSkip = () => {
    closeOnboarding();
  };

  const sendToGuide = () => {
    const input = guideInputRef.current;
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    
    // Hide input
    setGuideInputVisible(false);
    
    // Open guide panel if not open
    if (!guidePanelOpen) {
      setGuidePanelOpen(true);
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: message,
      type: 'user' as const
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Verstanden! Ich filtere deinen Feed jetzt basierend auf deinem Input.",
        "Alright! Lass mich dir zeigen, was zu deinem Mindset passt.",
        "Ich hab's. Ich zeige dir die relevanten Inhalte.",
        "Got it! Ich kuratiere deinen Feed neu - check die highlighted Cards.",
        "Perfekt! Deine Zeit ist wertvoll - ich zeige dir nur was zählt."
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      const aiMessage = {
        id: Date.now() + 1,
        text: `TICK TOCK: ${response}`,
        type: 'guide' as const
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 800);

    // Clear input
    input.value = '';
  };

  const resetView = () => {
    applyViewMode(viewMode);
  };

  const toggleZoom = () => {
    const nextMode = isZoomedIn ? 'explore' : 'pulse';
    setViewMode(nextMode);
    applyViewMode(nextMode);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setGuideInputVisible(!guideInputVisible);
        if (!guideInputVisible && guideInputRef.current) {
          setTimeout(() => guideInputRef.current?.focus(), 100);
        }
      }
      
      if (e.key === 'Escape') {
        if (expandedCard) {
          closeExpandedCard();
        } else {
          resetView();
        }
      }
      
      if (e.key === 'g') {
        toggleGuide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [guideInputVisible, expandedCard]);

  // Render card content based on type
  const renderCardContent = (card: FeedCard) => {
    switch (card.type) {
      case 'article':
        return (
          <>
            <div 
              className="hero-image" 
              style={{ background: card.content.heroImage }}
            />
            <div className="text-content">
              <div className="article-header">
                <div className="favicon">{card.content.favicon}</div>
                <span className="domain">{card.content.domain}</span>
              </div>
              <h3 className="title">{card.title}</h3>
              <p className="excerpt">{card.content.excerpt}</p>
              <span className="read-time">{card.content.readTime}</span>
            </div>
          </>
        );
      
      case 'quote':
        return (
          <div className="card-content">
            <p className="quote-text">{card.content.text}</p>
            <p className="quote-author">{card.content.author}</p>
          </div>
        );
      
      case 'video':
        return (
          <>
            <div 
              className="thumbnail" 
              style={{ background: card.content.thumbnail }}
            >
              <div className="play-btn">▶</div>
            </div>
            <div className="text-content">
              <h3 className="title">{card.title}</h3>
              <p className="excerpt">{card.content.author} • {card.content.duration}</p>
            </div>
          </>
        );
      
      case 'people':
        return (
          <div className="card-content">
            <div className="avatar">{card.content.avatar}</div>
            <h3 className="name">{card.content.name}</h3>
            <p className="bio">{card.content.bio}</p>
            <button className="connect-btn">Connect</button>
          </div>
        );
      
      case 'event':
        return (
          <div className="card-content">
            <span className="event-badge">{card.content.badge}</span>
            <h3 className="event-title">{card.title}</h3>
            <p className="excerpt">{card.content.location}<br/>{card.content.timeLeft}</p>
        </div>
        );
      
      default:
        return null;
    }
  };

  const highlightedCard = feedCards.find((card) => card.priority === 'hero') ?? feedCards[0];
  const modeDescriptions: Record<'focus' | 'explore' | 'pulse', string> = {
    focus: 'Spitz auf deine Top-Ziele eingestellt. Spotlight-Content first.',
    explore: 'Weite Sicht. Neue Impulse und Perspektiven für deinen Pfad.',
    pulse: 'High-Alert für Momentum. Nur die Karten, die jetzt knallen.'
  };
  const toneLabel = tone === 'straight' ? '🔥 Straight Talk' : '🤗 Soft Touch';
  const usageLimit = dailyLimitMinutes ?? 0;
  const elapsedMinutes = sessionTimer.elapsedMinutes || 0;
  const reclaimedMinutes = usageLimit ? Math.max(0, usageLimit - elapsedMinutes) : 0;
  const usagePercent = usageLimit ? Math.min(100, Math.round((elapsedMinutes / usageLimit) * 100)) : 0;
  const focusScore = Math.max(0, 100 - usagePercent);
  const viewModes = [
    { id: 'focus', label: 'Fokus', icon: '🎯' },
    { id: 'explore', label: 'Explore', icon: '🧭' },
    { id: 'pulse', label: 'Pulse', icon: '⚡' },
  ] as const;

  return (
    <div 
      ref={shellRef}
      className="guide-shell min-h-screen bg-fyf-noir text-fyf-cream"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Session Usage Badge */}
      {dailyLimitMinutes && (
        <SessionUsageBadge
          elapsedMinutes={sessionTimer.elapsedMinutes}
          remainingMinutes={sessionTimer.remainingMinutes}
          limitMinutes={dailyLimitMinutes}
          limitReached={sessionTimer.limitReached}
          isActive={sessionTimer.isActive}
        />
      )}

      {/* Warning Banner */}
      <UsageWarningBanner
        isVisible={showWarningBanner && !warningDismissed}
        percentage={(sessionTimer.elapsedMinutes / (dailyLimitMinutes || 1)) * 100}
        remainingMinutes={sessionTimer.remainingMinutes}
        onDismiss={handleWarningDismiss}
      />

      {/* Limit Reached Modal */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onLogout={handleLogout}
      />

      <header className="guide-topbar">
        <div className="topbar-primary">
          <span className="topbar-eyebrow">TICK TOCK GUIDE</span>
          <h1 className="topbar-title">Dein Fokus-Feed</h1>
          <p className="topbar-description">
            {highlightedCard?.summary || highlightedCard?.content?.excerpt || 'Kuratiert für Klarheit statt Overload.'}
          </p>
          <span className="topbar-hint">{modeDescriptions[viewMode]}</span>
        </div>
        <div className="topbar-mode">
          <div className="mode-buttons compact">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                className={`mode-btn ${viewMode === mode.id ? 'active' : ''}`}
                onClick={() => handleViewModeChange(mode.id)}
                aria-pressed={viewMode === mode.id}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-label">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="topbar-stats">
          <div className="stat-block">
            <span className="stat-label">Zeit heute</span>
            <strong className="stat-value">{elapsedMinutes} Min</strong>
            <span className="stat-meta">
              {reclaimedMinutes > 0 ? `+${reclaimedMinutes} Min frei` : 'Alles investiert'}
            </span>
          </div>
          <div className="stat-block">
            <span className="stat-label">Fokus-Level</span>
            <strong className="stat-value">{focusScore}%</strong>
            <span className="stat-meta">{usagePercent}% verbraucht</span>
          </div>
          <button className="stat-action" onClick={revealGuideInput}>
            Intent eingeben
          </button>
        </div>
      </header>

      {/* Navigation Helper */}
      <div className="nav-helper" ref={navHelperRef}>
        <span>SCROLL</span> zoomt · <span>DRAG</span> navigiert · <span>CLICK</span> öffnet · <span>CMD+J</span> Guide
      </div>
                
      {showOnboarding && (
        <div className="guide-onboarding">
          <div className="onboarding-card">
            <div className="onboarding-step">
              Step {onboardingStep + 1} / {onboardingSlides.length}
            </div>
            <h3>{onboardingSlides[onboardingStep].title}</h3>
            <p>{onboardingSlides[onboardingStep].body}</p>
            <div className="onboarding-actions">
              <button className="onboarding-skip" onClick={handleOnboardingSkip}>
                Skip
              </button>
              <button className="onboarding-next" onClick={handleOnboardingAdvance}>
                {onboardingStep === onboardingSlides.length - 1 ? 'Los geht\'s' : 'Weiter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Backdrop */}
      <div 
        className={`card-backdrop ${expandedCard ? 'active' : ''}`}
        onClick={closeExpandedCard}
      />

      {/* Guide Input */}
      <div className={`guide-input-container ${guideInputVisible ? 'visible' : ''}`}>
        <div className="guide-input-wrapper">
          <span className="guide-icon">🧭</span>
          <input
            ref={guideInputRef}
            type="text"
            className="guide-input"
            placeholder="Hey, heute habe ich Bock mich von xy inspirieren zu lassen..."
            onKeyPress={(e) => e.key === 'Enter' && sendToGuide()}
          />
          <button className="guide-send-btn" onClick={sendToGuide}>→</button>
        </div>
      </div>

      {/* Grid Container */}
      <div 
        ref={containerRef}
        className={`grid-container navigate-mode ${isZoomedIn ? 'zoomed-in' : ''}`}
      >
        {feedCards.map((card) => (
          <div
            key={card.id}
            className={`feed-card card-${card.type} size-${card.size} priority-${card.priority ?? 'base'} ${
              expandedCard === card.id ? 'expanded' : ''
            } ${focusedCard === card.id ? 'focused' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            {renderCardContent(card)}
            {card.priority && (card.matchScore || card.tags?.length) && (
              <div className="card-meta">
                {card.matchScore && <span className="match-badge">{card.matchScore}% Match</span>}
                {card.tags && (
                  <div className="tag-row">
                    {card.tags.slice(0, 3).map((tag) => (
                      <span className="tag-chip" key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Guide AI Overlay */}
      <div className={`guide-overlay ${guideOverlayActive ? 'active' : ''}`}>
        <div className="guide-message">
          <strong>Kurz fokussieren?</strong>{' '}
          {highlightedCard
            ? `${highlightedCard.title} passt perfekt zu deinem aktuellen Fokus. Soll ich sie öffnen?`
            : 'Ich habe etwas Passendes für dich – bereit für einen klaren Impuls?'}
        </div>
        <div className="guide-actions">
          <button
            className="guide-btn guide-accept"
            onClick={() => highlightedCard && handleCardClick(highlightedCard.id)}
          >
            Zeig mir
          </button>
          <button className="guide-btn guide-dismiss" onClick={() => setGuideOverlayActive(false)}>Später</button>
        </div>
      </div>

      {/* Side Panel */}
      <aside className={`guide-panel ${guidePanelOpen ? 'open' : ''}`}>
        <div className="guide-header">
          <h2 className="guide-name">TICK TOCK</h2>
          <p className="guide-subline">
            Deine Zeit läuft. Ich zähle mit.
          </p>

          {/* User Settings Display */}
          <div className="user-settings">
            <div className="settings-title">Deine Einstellungen</div>
            <div className="setting-item">
              <span className="setting-label">Ziel:</span>
              <span className="setting-value">Freiheit mit 45</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Fokus:</span>
              <span className="setting-value">Zeit &gt; Geld</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Risiko:</span>
              <span className="setting-value">Mutig</span>
            </div>
          </div>

          {/* Ton-Kalibrierung */}
          <div className="tone-toggle">
            <div 
              className={`tone-option ${tone === 'straight' ? 'active' : ''}`}
              onClick={() => toggleTone('straight')}
            >
              🔥 Straight Talk
            </div>
            <div 
              className={`tone-option ${tone === 'soft' ? 'active' : ''}`}
              onClick={() => toggleTone('soft')}
            >
              🤗 Soft Touch
            </div>
          </div>
        </div>

        <div className="guide-chat">
          {chatMessages.map((message) => (
            <div key={message.id} className="chat-message">
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        <button className="shut-up-btn">
          HALT DIE FRESSE
        </button>

        <div className="guide-footer">
          <div className="guide-footer-input">
            <input
              type="text" 
              placeholder="Frag mich was..." 
              className="guide-footer-field"
            />
            <button className="guide-footer-send">
              <span>→</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Guide Toggle Button */}
      <div className="guide-toggle" onClick={toggleGuide}>
        <span className="guide-toggle-icon">⏰</span>
        <span className="guide-toggle-label">{guidePanelOpen ? 'Close' : 'Guide'}</span>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="control-btn" onClick={resetView} title="Reset View">⟲</button>
        <button className="control-btn" onClick={toggleZoom} title="Toggle Zoom">
          {isZoomedIn ? '−' : '＋'}
        </button>
      </div>

      {/* Focus Overlay */}
      <div className="focus-overlay" />

      {/* Limit Reached Overlay */}
      {limitReached && (
        <div className="fixed inset-0 bg-fyf-noir/90 backdrop-blur-sm z-40 pointer-events-none" />
      )}
    </div>
  );
}
