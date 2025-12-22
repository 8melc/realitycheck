'use client';

import { TargetIcon, SparklesIcon, CompassIcon, ClockIcon } from '@/components/profile/icons';

interface NavIconItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subtext: string;
}

const navItems: NavIconItem[] = [
  {
    id: 'ziel',
    icon: TargetIcon,
    label: 'Ziel',
    subtext: 'Dein Fokus',
  },
  {
    id: 'guide-heute',
    icon: SparklesIcon,
    label: 'Guide heute',
    subtext: '3 Impulse',
  },
  {
    id: 'life-in-weeks',
    icon: CompassIcon,
    label: 'Life in Weeks',
    subtext: 'Zeitüberblick',
  },
  {
    id: 'guide-history',
    icon: ClockIcon,
    label: 'History',
    subtext: 'Letzte Gespräche',
  },
];

export default function DashboardNavIcons() {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL without reload
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <nav className="dashboard-nav-icons" aria-label="Dashboard Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleScroll(item.id)}
            className="dashboard-nav-icon-item"
            aria-label={`Zu ${item.label} scrollen`}
          >
            <div className="dashboard-nav-icon-container">
              <Icon className="dashboard-nav-icon" />
            </div>
            <div className="dashboard-nav-icon-text">
              <span className="dashboard-nav-icon-label">{item.label}</span>
              <span className="dashboard-nav-icon-subtext">{item.subtext}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

