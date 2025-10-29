'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { CompassIcon, TargetIcon, PenSquareIcon, ClockIcon, MusicIcon, GaugeIcon, FlameIcon } from './icons';
import CreditsWidget from './CreditsWidget';

interface SidebarProps {
  profile: Profile;
  onEditGoal: () => void;
}

const Sidebar = ({ profile, onEditGoal }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleLinkClick = (href: string, isGuidePrefs?: boolean) => {
    if (href.startsWith('#')) {
      const elementId = isGuidePrefs ? 'guide-settings' : href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Calculate time metrics
  const birthDate = new Date(profile.identity.birthdate);
  const today = new Date();
  const targetAge = profile.identity.targetAge || 80;
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerDay);
  const totalDays = targetAge * 365;
  const daysRemaining = Math.max(0, totalDays - daysLived);

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
    <aside className={`fyf-floating-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Restzeit-Kachel - Persistent */}
      <div className="fyf-time-banner">
        <div className="fyf-time-statement">
          Nur noch <span className="fyf-time-number">{daysRemaining.toLocaleString()}</span> Tage
        </div>
        <div className="fyf-time-subtext">Mach keinen Bullshit</div>
      </div>

      {/* Profile & Ziel-Block - Lebendiges Dashboard */}
      <div className="fyf-profile-block">
        <div className="fyf-profile-header">
          <div className="fyf-profile-avatar">
            <img src={profile.identity.avatarUrl} alt={profile.identity.name} />
          </div>
          <div className="fyf-profile-info">
            <div className="fyf-profile-name">{profile.identity.name}</div>
            <div className="fyf-profile-status">On Fire</div>
          </div>
        </div>

        <div className="fyf-goal-section">
          <div className="fyf-goal-question">Was willst du wirklich?</div>
          <div className="fyf-goal-text">{profile.goal.text}</div>
          <div className="fyf-goal-progress">
            <div className="fyf-progress-bar">
              <div className="fyf-progress-fill" style={{ width: '32%' }} />
            </div>
            <div className="fyf-progress-text">32% Fokus</div>
          </div>
        </div>

        <button onClick={onEditGoal} className="fyf-btn fyf-btn--primary fyf-btn--statement">
          <PenSquareIcon className="h-4 w-4" />
          Ziel ändern
        </button>
      </div>

      {/* Credits Widget */}
      <CreditsWidget userId={profile.id} hideCTA={true} />

      {/* Core Actions - Situational */}
      <div className="fyf-actions-section">
        <div className="fyf-section-title">Was jetzt?</div>
        <div className="fyf-action-grid">
          {coreActions.map(({ href, label, icon: Icon, urgent }) => (
            <button
              key={label}
              onClick={() => handleLinkClick(href)}
              className={`fyf-action-card ${urgent ? 'urgent' : ''}`}
            >
              <Icon className="fyf-action-icon" />
              <span className="fyf-action-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Actions - Contextual */}
      <div className="fyf-mode-section">
        <div className="fyf-section-title">Einstellungen</div>
        <div className="fyf-mode-grid">
          {modeActions.map(({ href, label, icon: Icon, isGuidePrefs, urgent }) => (
            <button
              key={label}
              onClick={() => handleLinkClick(href, isGuidePrefs)}
              className={`fyf-mode-card ${urgent ? 'urgent' : ''}`}
            >
              <Icon className="fyf-mode-icon" />
              <span className="fyf-mode-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fyf-sidebar-toggle"
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </aside>
  );
};

export default Sidebar;