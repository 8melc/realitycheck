import { Profile } from '@/types/profile';
import { ClockIcon, GlobeIcon, PenSquareIcon } from './icons';
import { useState } from 'react';

interface TimeStyleCardProps {
  profile: Profile;
  onEdit?: () => void;
  guidePersonality?: string;
  lifestyle?: string;
  onGuidePersonalityChange?: (value: string) => void;
  onLifestyleChange?: (value: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const philosophyOptions = [
  { value: 'dividende', label: 'Zeit als Dividende', description: 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.' },
  { value: 'wirkung', label: 'Wirkung statt Erledigung', description: 'Für mich zählt Wirkung, nicht nur Erledigungen – meine Zeit soll Sinn stiften.' },
  { value: 'limitiert', label: 'Bewusste Limitierung', description: 'Jede Stunde ist limitiert – ich will sie bewusst gegen das eintauschen, was zählt.' },
  { value: 'balance', label: 'Kalender-Depot Balance', description: 'Ich will mein Kalender-Depot so balancieren, dass Flow, Pause und Wachstum sich abwechseln.' },
  { value: 'no-waste', label: 'Keine Zeitverschwendung', description: 'Zeitverschwendung ist für mich das Einzige, was ich mir wirklich nie leisten will.' },
];

const lifestyleOptions = [
  { value: 'digital-nomad', label: 'Digital Nomad', description: 'Arbeite, wo du gerade bist.' },
  { value: 'remote-worker', label: 'Remote Worker', description: 'Homeoffice ist mein Orbit.' },
  { value: 'office-player', label: 'Office Player', description: '9-to-5, aber meinen Regeln.' },
  { value: 'hybrid', label: 'Hybrid', description: 'Stadt und Rückzug im Wechsel.' },
  { value: 'creator', label: 'Creator', description: 'Ich kreiere, Fokus ist fluide.' },
  { value: 'sidepreneur', label: 'Sidepreneur', description: 'Mehrere Projekte, voller Drive.' },
  { value: 'explorer', label: 'Explorer', description: 'Ich teste ständig neue Routinen.' },
  { value: 'caretaker', label: 'Caretaker', description: 'Ich halte andere am Laufen.' },
  { value: 'teamplayer', label: 'Teamplayer', description: 'Ich tanke Energie im Miteinander.' },
  { value: 'rebel', label: 'Rebel', description: 'Kein klassisches Lebensmodell.' },
  { value: 'family-flow', label: 'Family Flow', description: 'Familie ist mein Taktgeber.' },
  { value: 'minimalist', label: 'Minimalist', description: 'Weniger Zeug, mehr Fokus.' },
  { value: 'old-school', label: 'Old School', description: 'Feste Strukturen, klare Slots.' },
];

const TimeStyleCard = ({ 
  profile, 
  onEdit,
  guidePersonality,
  lifestyle: lifestyleProp,
  onGuidePersonalityChange,
  onLifestyleChange,
  onSave,
  isSaving = false,
}: TimeStyleCardProps) => {
  const { timePhilosophy, lifestyle: profileLifestyle } = profile;
  const [isEditing, setIsEditing] = useState(false);
  const [localGuidePersonality, setLocalGuidePersonality] = useState(guidePersonality || timePhilosophy.optionId);
  const [localLifestyle, setLocalLifestyle] = useState(lifestyleProp || profileLifestyle.optionId);

  const handleSave = async () => {
    if (onGuidePersonalityChange) {
      onGuidePersonalityChange(localGuidePersonality);
    }
    if (onLifestyleChange) {
      onLifestyleChange(localLifestyle);
    }
    if (onSave) {
      await onSave();
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalGuidePersonality(guidePersonality || timePhilosophy.optionId);
    setLocalLifestyle(lifestyleProp || profileLifestyle.optionId);
    setIsEditing(false);
  };

  const currentPhilosophy = philosophyOptions.find(opt => opt.value === (guidePersonality || timePhilosophy.optionId)) || philosophyOptions[0];
  const currentLifestyle = lifestyleOptions.find(opt => opt.value === (lifestyleProp || profileLifestyle.optionId)) || lifestyleOptions[0];

  return (
    <section id="zeit-profil" className="rc-card motion-fade-up" aria-labelledby="time-style-heading">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 id="time-style-heading" className="rc-subheading">
            Zeit-Profil
          </h2>
          <p className="rc-microcopy">Deine Haltung zur Zeit und dein Alltag setzen den Rahmen für den Guide.</p>
        </div>
        {!isEditing && (onEdit || onSave) && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rc-btn rc-btn--ghost inline-flex items-center gap-2"
          >
            <PenSquareIcon className="h-4 w-4" aria-hidden="true" />
            Bearbeiten
          </button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rc-btn rc-btn--ghost text-sm"
              disabled={isSaving}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rc-btn rc-btn--primary text-sm"
              disabled={isSaving}
            >
              {isSaving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        )}
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rc-subcard">
          <div className="rc-subcard__icon">
            <ClockIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="rc-subcard__title">Zeit-Philosophie</h3>
            {isEditing ? (
              <select
                value={localGuidePersonality}
                onChange={(e) => setLocalGuidePersonality(e.target.value)}
                className="rc-input"
                style={{ width: '100%' }}
              >
                {philosophyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rc-chip">{currentPhilosophy.label}</span>
            )}
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
            {isEditing ? (
              <select
                value={localLifestyle}
                onChange={(e) => setLocalLifestyle(e.target.value)}
                className="rc-input"
                style={{ width: '100%' }}
              >
                {lifestyleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rc-chip">{currentLifestyle.label}</span>
            )}
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
