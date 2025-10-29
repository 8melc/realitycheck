import { Profile } from '@/types/profile';
import GoalBadge from './GoalBadge';
import { CompassIcon, PenSquareIcon, ClockIcon, MusicIcon, GaugeIcon, TargetIcon } from './icons';

interface GoalWidgetProps {
  profile: Profile;
  onEditGoal: () => void;
}

const quickActions = [
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

const GoalWidget = ({ profile, onEditGoal }: GoalWidgetProps) => {
  // MVP: Dummy-Fortschritt von 32%
  const goalProgress = 32;

  const handleLinkClick = (href: string, isGuidePrefs?: boolean) => {
    if (href.startsWith('#')) {
      const elementId = isGuidePrefs ? 'guide-settings' : href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <aside className="fyf-card fyf-card--sidebar motion-fade-up" aria-label="Quick Actions und Ziel">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wide text-fyf-steel">Aktuelles Ziel</span>
          <GoalBadge goal={profile.goal.text} />
          
          {/* Fortschrittsbalken */}
          <div className="goal-progress">
            <div className="goal-progress-header">
              <span className="goal-progress-label">Fortschritt</span>
              <span className="goal-progress-percentage">{goalProgress}% erfüllt</span>
            </div>
            <div className="goal-progress-bar">
              <div 
                className="goal-progress-fill" 
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>
          
          <button type="button" className="fyf-btn fyf-btn--ghost w-fit inline-flex items-center gap-2" onClick={onEditGoal}>
            <PenSquareIcon className="h-4 w-4" aria-hidden="true" />
            Ziel bearbeiten
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wide text-fyf-steel">Quick Actions</span>
          <nav className="flex flex-col gap-2">
            {quickActions.map(({ href, label, icon: Icon, isGuidePrefs }) => (
              <button
                key={label}
                onClick={() => handleLinkClick(href, isGuidePrefs)}
                className="fyf-quick-link"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default GoalWidget;
