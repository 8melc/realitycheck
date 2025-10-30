import { Profile } from '@/types/profile';
import { ArrowUpRightIcon, LinkIcon, MusicIcon } from './icons';

interface MusicDNAProps {
  musicDNA: Profile['musicDNA'];
  onConnect: () => void;
}

const MusicDNA = ({ musicDNA, onConnect }: MusicDNAProps) => {
  const { spotifyLinked, spotifyData, genres } = musicDNA;

  if (!spotifyLinked) {
    return (
      <article className="fyf-subcard fyf-subcard--accent">
        <div className="fyf-subcard__icon">
          <MusicIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="fyf-subcard__title">Musik-DNA</h3>
            <p className="fyf-subcard__body">
              Verbinde dein Spotify, damit FYF Soundscapes kuratiert, die deinen Fokus tragen.
            </p>
          </div>
          <button type="button" onClick={onConnect} className="fyf-btn fyf-btn--ghost inline-flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Verbinde dein Spotify
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="fyf-subcard fyf-subcard--accent">
      <div className="fyf-subcard__icon">
        <MusicIcon className="h-5 w-5" />
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="fyf-subcard__title">Musik-DNA</h3>
          <p className="fyf-subcard__body">
            Verbunden seit{' '}
            {spotifyData?.linkedAt
              ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeZone: 'UTC' }).format(
                  new Date(spotifyData.linkedAt)
                )
              : 'kürzlich'}
            . FYF nimmt deine Top-Genres in jeden Guide auf.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(spotifyData?.topGenres ?? genres).slice(0, 3).map((genre) => (
            <span key={genre} className="fyf-chip fyf-chip--light">
              {genre}
            </span>
          ))}
        </div>
        <button type="button" className="fyf-link inline-flex items-center gap-2" onClick={onConnect}>
          Spotify verwalten
          <ArrowUpRightIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

export default MusicDNA;
