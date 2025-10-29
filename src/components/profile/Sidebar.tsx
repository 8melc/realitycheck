'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { CompassIcon, TargetIcon, PenSquareIcon, ClockIcon, MusicIcon, GaugeIcon } from './icons';
import CreditsWidget from './CreditsWidget';

interface SidebarProps {
  profile: Profile;
  onEditGoal: () => void;
}

const Sidebar = ({ profile, onEditGoal }: SidebarProps) => {
  const handleLinkClick = (href: string, isGuidePrefs?: boolean) => {
    if (href.startsWith('#')) {
      const elementId = isGuidePrefs ? 'guide-settings' : href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const menuItems = [
    { href: '/life-weeks', label: 'Life in Weeks', icon: CompassIcon },
    { href: '#actions', label: 'Actions', icon: TargetIcon },
    { href: '#conversation', label: 'Conversation', icon: PenSquareIcon },
    { href: '#conversation', label: 'Guide Präferenzen', icon: PenSquareIcon, isGuidePrefs: true },
    { href: '#zeit-profil', label: 'Zeit-Profil', icon: ClockIcon },
    { href: '#energie-feeds', label: 'Energie-Feeds', icon: MusicIcon },
    { href: '#tageslimit', label: 'Tageslimit', icon: GaugeIcon },
    { href: '#filter', label: 'Filter-Funktion', icon: TargetIcon },
    { href: '#journey', label: 'Journey', icon: CompassIcon },
    { href: '#feedback', label: 'Feedback & Impulse', icon: PenSquareIcon },
  ];

  return (
    <aside className="guide-dashboard-sidebar-left">
      {/* Credits Widget - Collapsible */}
      <CreditsWidget userId={profile.id} hideCTA={true} />

      {/* Goal Section */}
      <div className="sidebar-goal">
        <div className="sidebar-goal-title">Aktuelles Ziel</div>
        <div className="sidebar-goal-text">{profile.goal.text}</div>
        
        <div className="sidebar-progress">
          <div className="sidebar-progress-label">Fortschritt</div>
          <div className="sidebar-progress-bar">
            <div 
              className="sidebar-progress-fill" 
              style={{ width: '32%' }}
            />
          </div>
        </div>

        <button
          onClick={onEditGoal}
          className="sidebar-menu-item"
          style={{ marginTop: '1rem', justifyContent: 'center' }}
        >
          <PenSquareIcon className="sidebar-menu-icon" />
          Ziel bearbeiten
        </button>
      </div>

      {/* Menu Section */}
      <nav className="sidebar-menu">
        {menuItems.map(({ href, label, icon: Icon, isGuidePrefs }) => (
          <button
            key={label}
            onClick={() => handleLinkClick(href, isGuidePrefs)}
            className="sidebar-menu-item"
          >
            <Icon className="sidebar-menu-icon" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;