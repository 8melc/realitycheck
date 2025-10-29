import { Profile } from '@/types/profile';
import { CompassIcon, MessageIcon, TargetIcon, UsersIcon, PenSquareIcon } from './icons';
import { useState, useEffect } from 'react';
import { useGuideStore } from '@/stores/guideStore';
import { getGuideText } from '@/lib/guideTone';

interface JourneyTimelineProps {
  journey: Profile['journey'];
  onEdit?: () => void;
}

const typeIconMap: Record<Profile['journey'][number]['type'], JSX.Element> = {
  onboarding: <TargetIcon className="h-4 w-4" />,
  'life-in-weeks': <CompassIcon className="h-4 w-4" />,
  people: <UsersIcon className="h-4 w-4" />,
  'guide-action': <TargetIcon className="h-4 w-4" />,
  review: <MessageIcon className="h-4 w-4" />,
};

const formatTimestamp = (timestamp: string) =>
  new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(timestamp));

const JourneyTimeline = ({ journey, onEdit }: JourneyTimelineProps) => {
  const [isClient, setIsClient] = useState(false);
  const { tone } = useGuideStore();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const items = [...journey].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <section id="journey" className="fyf-card motion-fade-up" aria-labelledby="journey-heading">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 id="journey-heading" className="fyf-subheading">
            {getGuideText('journeyTitle', tone)}
          </h2>
          <p className="fyf-microcopy">{getGuideText('journeySubtitle', tone)}</p>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="fyf-btn fyf-btn--ghost inline-flex items-center gap-2"
          >
            <PenSquareIcon className="h-4 w-4" aria-hidden="true" />
            Bearbeiten
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-fyf-steel">
          Noch keine Journey-Einträge. Dein erstes Kapitel startet, sobald du deinen ersten Fokus-Block setzt.
        </div>
      ) : (
        <ol className="mt-8 relative space-y-6">
          <div
            className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-white/40 via-white/10 to-transparent"
            aria-hidden="true"
          />
          {items.map((item) => (
            <li key={item.id} className="relative pl-12">
              <span className="absolute left-2 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-fyf-mint/60 bg-fyf-noir text-fyf-mint shadow shadow-fyf-mint/10">
                {typeIconMap[item.type]}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-fyf-cream">{item.description}</p>
                <span className="text-xs uppercase tracking-wide text-fyf-steel">
                  {isClient ? formatTimestamp(item.timestamp) : 'Lade...'}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default JourneyTimeline;