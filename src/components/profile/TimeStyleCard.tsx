import { Profile } from '@/types/profile';
import { ClockIcon, GlobeIcon, PenSquareIcon } from './icons';

interface TimeStyleCardProps {
  profile: Profile;
  onEdit?: () => void;
}

const TimeStyleCard = ({ profile, onEdit }: TimeStyleCardProps) => {
  const { timePhilosophy, lifestyle } = profile;

  return (
    <section id="zeit-profil" className="rc-card motion-fade-up" aria-labelledby="time-style-heading">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 id="time-style-heading" className="rc-subheading">
            Zeit-Profil
          </h2>
          <p className="rc-microcopy">Deine Haltung zur Zeit und dein Alltag setzen den Rahmen für den Guide.</p>
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

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rc-subcard">
          <div className="rc-subcard__icon">
            <ClockIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="rc-subcard__title">Zeit-Philosophie</h3>
            <span className="rc-chip">{timePhilosophy.label}</span>
            <p className="rc-subcard__body">
              Der Guide zeigt dir Impulse, die sich wie Investments anfühlen – kein generischer Productivity-Spam.
            </p>
          </div>
        </article>

        <article className="rc-subcard">
          <div className="rc-subcard__icon">
            <GlobeIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="rc-subcard__title">Lebensstil</h3>
            <span className="rc-chip">{lifestyle.label}</span>
            <p className="rc-subcard__body">
              RealityCheck liefert dir Impulse in deinem Tempo und Kontext – keine FOMO, sondern Flow, der zu deinem Alltag
              passt.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default TimeStyleCard;
