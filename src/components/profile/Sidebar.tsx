'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { CompassIcon, TargetIcon, PenSquareIcon, ClockIcon, MusicIcon, GaugeIcon, FlameIcon } from './icons';

interface SidebarProps {
  profile: Profile;
  onEditGoal: () => void;
}

const Sidebar = ({ profile, onEditGoal }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const handleLinkClick = (href: string, isGuidePrefs?: boolean) => {
    if (href.startsWith('#')) {
      const elementId = isGuidePrefs ? 'guide-settings' : href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Calculate time metrics only on client side to avoid hydration mismatch
  const birthDate = new Date(profile.identity.birthdate);
  const today = new Date();
  const targetAge = profile.identity.targetAge || 80;
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerDay);
  const totalDays = targetAge * 365;
  const daysRemaining = Math.max(0, totalDays - daysLived);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Core navigation - minimal, situational
  const coreActions = [
    { href: '#life-weeks', label: 'Zeit-Grid', icon: CompassIcon, urgent: true },
    { href: '#feedback', label: 'Impulse', icon: FlameIcon, urgent: true },
    { href: '#actions', label: 'To-Dos', icon: TargetIcon, urgent: false },
  ];

  const modeActions = [
    { href: '#conversation', label: 'Guide', icon: PenSquareIcon, isGuidePrefs: true },
    { href: '#tageslimit', label: 'Limit', icon: GaugeIcon, urgent: false },
    { href: '#filter', label: 'Filter', icon: TargetIcon, urgent: false },
  ];

  return (
    <aside className={`rc-floating-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Credits Section - Complete in Sidebar */}
      <div className="rc-credits-section">
        <div className="rc-credits-header">
          <h3 className="rc-section-title">Credits</h3>
          <a 
            href="/credits#purchase" 
            className="rc-btn rc-btn--primary rc-btn--small inline-flex items-center gap-1"
          >
            Credits holen
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        
        <div className="rc-credits-stats">
          <div className="rc-credits-stat">
            <div className="rc-credits-stat-label">Verfügbar</div>
            <div className="rc-credits-stat-value rc-credits-stat-value--mint">47</div>
            <div className="rc-credits-stat-subtitle">Credits für Sessions</div>
          </div>
          
          <div className="rc-credits-stat">
            <div className="rc-credits-stat-label">Wert</div>
            <div className="rc-credits-stat-value rc-credits-stat-value--cream">€11,28</div>
            <div className="rc-credits-stat-subtitle">Aktueller Wert</div>
          </div>
          
          <div className="rc-credits-stat">
            <div className="rc-credits-stat-label">Verbraucht</div>
            <div className="rc-credits-stat-value rc-credits-stat-value--coral">3</div>
            <div className="rc-credits-stat-subtitle">Diese Woche</div>
          </div>
        </div>
      </div>

      {/* Profile & Ziel-Block - Lebendiges Dashboard */}
      <div className="rc-profile-block">
        <div className="rc-profile-header">
          <div className="rc-profile-avatar">
            <img src={profile.identity.avatarUrl} alt={profile.identity.name} />
          </div>
          <div className="rc-profile-info">
            <div className="rc-profile-name">{profile.identity.name}</div>
            <div className="rc-profile-status">On Fire</div>
          </div>
        </div>

        <div className="rc-goal-section">
          <div className="rc-goal-question">Was willst du wirklich?</div>
          <div className="rc-goal-text">{profile.goal.text}</div>
          <div className="rc-goal-progress">
            <div className="rc-progress-bar">
              <div className="rc-progress-fill" style={{ width: '32%' }} />
            </div>
            <div className="rc-progress-text">32% Fokus</div>
          </div>
        </div>

        <button onClick={onEditGoal} className="rc-btn rc-btn--primary rc-btn--statement">
          <PenSquareIcon className="h-4 w-4" />
          Ziel ändern
        </button>
      </div>


      {/* Core Actions - Situational */}
      <div className="rc-actions-section">
        <div className="rc-section-title">Was jetzt?</div>
        <div className="rc-action-grid">
          {coreActions.map(({ href, label, icon: Icon, urgent }) => (
            <button
              key={label}
              onClick={() => handleLinkClick(href)}
              className={`rc-action-card ${urgent ? 'urgent' : ''}`}
            >
              <Icon className="rc-action-icon" />
              <span className="rc-action-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Actions - Contextual */}
      <div className="rc-mode-section">
        <div className="rc-section-title">Einstellungen</div>
        <div className="rc-mode-grid">
          {modeActions.map(({ href, label, icon: Icon, isGuidePrefs, urgent }) => (
            <button
              key={label}
              onClick={() => handleLinkClick(href, isGuidePrefs)}
              className={`rc-mode-card ${urgent ? 'urgent' : ''}`}
            >
              <Icon className="rc-mode-icon" />
              <span className="rc-mode-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="rc-sidebar-toggle"
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </aside>
  );
};

export default Sidebar;