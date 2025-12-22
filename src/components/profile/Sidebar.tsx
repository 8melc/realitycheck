'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { PenSquareIcon } from './icons';
import UserAvatar from '@/components/UserAvatar';

interface SidebarProps {
  profile: Profile;
  onEditGoal: () => void;
  activeSection: 'overview' | 'profile';
  setActiveSection: (section: 'overview' | 'profile') => void;
  hasUnsavedChanges?: boolean;
}

const Sidebar = ({ 
  profile, 
  onEditGoal, 
  activeSection, 
  setActiveSection, 
  hasUnsavedChanges, 
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


  return (
    <aside className="rc-floating-sidebar">
      {/* Profile & Ziel-Block - Lebendiges Dashboard */}
      <div className="rc-profile-block">
        <div className="rc-profile-header">
          <div className="rc-profile-avatar">
            <UserAvatar 
              userId={profile.id} 
              size="md" 
              displayName={profile.identity.name}
              email={profile.identity.email}
            />
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

        <a href="/user/settings/ziel" className="rc-btn rc-btn--primary rc-btn--statement">
          <PenSquareIcon className="h-4 w-4" />
          Ziel ändern
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;