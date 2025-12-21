'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { CompassIcon, TargetIcon, PenSquareIcon, GaugeIcon } from './icons';

interface SidebarProps {
  profile: Profile;
  onEditGoal: () => void;
  activeSection: 'overview' | 'profile';
  setActiveSection: (section: 'overview' | 'profile') => void;
  hasUnsavedChanges?: boolean;
  creditsBalance?: number;
  creditsValue?: number;
  creditsConsumedThisWeek?: number;
}

const Sidebar = ({ 
  profile, 
  onEditGoal, 
  activeSection, 
  setActiveSection, 
  hasUnsavedChanges, 
  creditsBalance = 0,
  creditsValue = 0,
  creditsConsumedThisWeek = 0,
}: SidebarProps) => {
  const [isClient, setIsClient] = useState(false);
  
  const handleLinkClick = (href: string, isGuidePrefs?: boolean) => {
    if (activeSection === 'profile' && hasUnsavedChanges) {
      const confirm = window.confirm('Bist du sicher? Deine Zeit ist zu wertvoll, um sie mit ungespeicherten Daten zu verschwenden. Willst du wirklich einfach so weggehen?');
      if (!confirm) return;
    }

    if (activeSection !== 'overview') {
      setActiveSection('overview');
      // Give React time to render the overview sections
      setTimeout(() => {
        const elementId = isGuidePrefs ? 'guide-settings' : href.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (href.startsWith('#')) {
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
  ];

  const modeActions = [
    { href: '#conversation', label: 'Guide', icon: PenSquareIcon, isGuidePrefs: true },
    { href: '#tageslimit', label: 'Limit', icon: GaugeIcon, urgent: false },
    { href: '#filter', label: 'Filter', icon: TargetIcon, urgent: false },
  ];

  return (
    <aside className="rc-floating-sidebar">
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
            <div className="rc-credits-stat-value rc-credits-stat-value--mint">{creditsBalance}</div>
            <div className="rc-credits-stat-subtitle">Credits für Sessions</div>
          </div>
          
          <div className="rc-credits-stat">
            <div className="rc-credits-stat-label">Wert</div>
            <div className="rc-credits-stat-value rc-credits-stat-value--cream">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(creditsValue)}
            </div>
            <div className="rc-credits-stat-subtitle">Aktueller Wert</div>
          </div>
          
          <div className="rc-credits-stat">
            <div className="rc-credits-stat-label">Verbraucht</div>
            <div className="rc-credits-stat-value rc-credits-stat-value--coral">{creditsConsumedThisWeek}</div>
            <div className="rc-credits-stat-subtitle">Diese Woche</div>
          </div>
        </div>
      </div>

      {/* Profile & Ziel-Block - Lebendiges Dashboard */}
      <div className="rc-profile-block">
        <div className="rc-profile-header">
          <div className="rc-profile-avatar">
            <img src={profile.identity.avatarUrl} alt={profile.identity.name || 'User'} />
          </div>
          <div className="rc-profile-info">
            <div className="rc-profile-name">{profile.identity.name || 'User'}</div>
            <div className="rc-profile-status">On Fire</div>
          </div>
        </div>

        <div className="rc-goal-section">
          <div className="rc-goal-question">Was willst du wirklich?</div>
          <div className="rc-goal-text">{profile.primaryGoalTitle || 'Noch kein Ziel gesetzt'}</div>
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
          <a
            href="/user/settings"
            className="rc-mode-card"
          >
            <CompassIcon className="rc-mode-icon" />
            <span className="rc-mode-label">Account-Einstellungen</span>
          </a>
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
    </aside>
  );
};

export default Sidebar;