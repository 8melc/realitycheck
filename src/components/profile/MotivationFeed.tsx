import { Profile } from '@/types/profile';
import { SparklesIcon, FlameIcon, TargetIcon, PenSquareIcon } from './icons';

interface MotivationFeedProps {
  profile: Profile;
  onEdit?: () => void;
}

const iconByTone: Record<Profile['feedback'][number]['tone'], JSX.Element> = {
  motivating: <SparklesIcon className="h-4 w-4" />,
  challenging: <FlameIcon className="h-4 w-4" />,
  reflecting: <TargetIcon className="h-4 w-4" />,
};

const MotivationFeed = ({ profile, onEdit }: MotivationFeedProps) => {
  const entries = profile.feedback;

  return (
    <section id="feedback" className="rc-card motion-fade-up" aria-labelledby="motivation-heading">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 id="motivation-heading" className="rc-subheading">
            Feedback & Impulse
          </h2>
          <p className="rc-microcopy">
            Kurz, klar, substanziell – damit du dran bleibst und dein Ziel stärker wird.
          </p>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rc-btn rc-btn--ghost inline-flex items-center gap-2"
          >
            <PenSquareIcon className="h-4 w-4" aria-hidden="true" />
            Bearbeiten
          </button>
        )}
      </header>

      {entries.length === 0 ? (
        <div className="mt-8 rc-subcard">
          <p className="text-sm text-rc-steel">
            Wir analysieren dein Profil und deine Aktionen. Bald bekommst du den ersten Impuls – zugeschnitten auf dein
            Ziel.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {entries.map((entry) => (
            <li key={entry.id} className="rc-feedback-item">
              <div className="rc-feedback-item__icon">{iconByTone[entry.tone]}</div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-rc-cream">{entry.message}</p>
                <span className="text-xs uppercase tracking-wider text-rc-steel">
                  {new Intl.DateTimeFormat('de-DE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'UTC',
                  }).format(new Date(entry.createdAt))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MotivationFeed;
