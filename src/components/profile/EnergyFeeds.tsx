import { Profile } from '@/types/profile';
import { ArrowUpRightIcon, ListIcon, UsersIcon, PenSquareIcon } from './icons';
import MusicDNA from './MusicDNA';

interface EnergyFeedsProps {
  profile: Profile;
  onConnectSpotify: () => void;
  onEdit?: () => void;
}

const EnergyFeeds = ({ profile, onConnectSpotify, onEdit }: EnergyFeedsProps) => {
  const topInterests = profile.interests.slice(0, 4);
  const projects = profile.projects ?? [];

  return (
    <section id="energie-feeds" className="fyf-card motion-fade-up" aria-labelledby="energy-feeds-heading">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 id="energy-feeds-heading" className="fyf-subheading">
            Energie-Feeds
          </h2>
          <p className="fyf-microcopy">Interessen, Projekte und Sounds, die dein System füttern.</p>
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="fyf-subcard">
          <div className="fyf-subcard__icon">
            <ListIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="fyf-subcard__title">Interessen</h3>
              <p className="fyf-subcard__body">
                Top-Felder, die deine Perspektive formen. Alles, was FYF kuratiert, zahlt auf diese Themen ein.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {topInterests.length === 0 ? (
                <span className="fyf-chip fyf-chip--ghost">Noch keine Interessen hinterlegt</span>
              ) : (
                topInterests.map((interest) => (
                  <span key={interest.id} className="fyf-chip">
                    {interest.label}
                  </span>
                ))
              )}
            </div>
            <button type="button" className="fyf-link inline-flex items-center gap-2">
              Alle anzeigen
              <ArrowUpRightIcon className="h-4 w-4" />
            </button>
          </div>
        </article>

        <article className="fyf-subcard">
          <div className="fyf-subcard__icon">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="fyf-subcard__title">Projekte</h3>
              <p className="fyf-subcard__body">
                Was derzeit deine Energie bindet. FYF priorisiert dir Actions, die diese Projekte pushen.
              </p>
            </div>
            {projects.length === 0 ? (
              <span className="fyf-chip fyf-chip--ghost">Noch keine Projekte definiert</span>
            ) : (
              <ul className="flex flex-col gap-3 text-sm text-fyf-cream">
                {projects.slice(0, 3).map((project) => (
                  <li key={project.id} className="flex flex-col gap-1">
                    <span className="font-medium">{project.title}</span>
                    {project.description && <span className="text-xs text-fyf-steel">{project.description}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <MusicDNA musicDNA={profile.musicDNA} onConnect={onConnectSpotify} />

        <article className="fyf-subcard fyf-subcard--muted">
          <div className="fyf-subcard__icon">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="fyf-subcard__title">Matching</h3>
            <p className="fyf-subcard__body">
              Kommt bald: kuratierte Menschen, die deine Zeitlogik teilen. Basis: Musik-DNA, Interessen, Ziel.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default EnergyFeeds;
