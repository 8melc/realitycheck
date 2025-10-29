import { Profile } from '@/types/profile';
import StatusMeter from './StatusMeter';
import GoalBadge from './GoalBadge';
import { PenSquareIcon } from './icons';
import { useGuideStore } from '@/stores/guideStore';
import { getGuideText } from '@/lib/guideTone';

interface ProfileSummaryProps {
  profile: Profile;
  timeMetrics: {
    weeksLived: number;
    weeksRemaining: number;
    daysRemaining: number;
  };
  onEditGoal: () => void;
}

const formatNumber = (value: number) =>
  Intl.NumberFormat('de-DE').format(Math.max(0, Math.floor(value)));

const ProfileSummary = ({ profile, timeMetrics, onEditGoal }: ProfileSummaryProps) => {
  const { identity, goal, progress } = profile;
  const { tone } = useGuideStore();

  return (
    <section className="rc-card rc-card--hero motion-fade-up" aria-labelledby="profile-summary-heading">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative h-32 w-32 shrink-0 rounded-full border border-rc-mint/60 bg-rc-noir/60 text-4xl font-semibold uppercase tracking-wide text-rc-mint shadow-lg shadow-rc-mint/5 overflow-hidden">
            {identity.avatarUrl ? (
              <img 
                src={identity.avatarUrl} 
                alt={`${identity.name} Profilbild`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {identity.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <h1 id="profile-summary-heading" className="rc-heading">
                {identity.name}
              </h1>
              <p className="text-sm text-rc-steel">{identity.email}</p>
            </div>
            <GoalBadge goal={`${getGuideText('profileGoal', tone)} ${goal.text}`} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 border-t border-white/5 pt-6 lg:border-t-0 lg:pt-0">
          <dl className="grid gap-6 sm:grid-cols-3">
            <div className="rc-stat">
              <dt>GELEBT</dt>
              <dd>{formatNumber(timeMetrics.weeksLived)} Wochen</dd>
            </div>
            <div className="rc-stat">
              <dt>ÜBRIG</dt>
              <dd>{formatNumber(timeMetrics.weeksRemaining)} Wochen</dd>
            </div>
            <div className="rc-stat">
              <dt>ÜBRIG</dt>
              <dd>{formatNumber(timeMetrics.daysRemaining)} Tage</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <StatusMeter progress={progress} />
            <button
              type="button"
              onClick={onEditGoal}
              className="rc-btn rc-btn--outline inline-flex items-center gap-2"
            >
              <PenSquareIcon className="h-4 w-4" aria-hidden="true" />
              Ziel bearbeiten
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSummary;