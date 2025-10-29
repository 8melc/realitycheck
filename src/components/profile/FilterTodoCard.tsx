import { useState } from 'react';
import { PenSquareIcon } from './icons';

interface FilterTodoCardProps {
  onEdit?: () => void;
}

const formatOptions = ['Artikel', 'Podcast', 'Video', 'People', 'Event', 'Zitat', 'Song'];
const countOptions = [3, 4, 5, 6, 7, 8];

const FilterTodoCard = ({ onEdit }: FilterTodoCardProps) => {
  const [rankOne, setRankOne] = useState('Artikel');
  const [rankTwo, setRankTwo] = useState('Podcast');
  const [rankThree, setRankThree] = useState('Video');

  const [countOne, setCountOne] = useState(3);
  const [countTwo, setCountTwo] = useState(4);
  const [countThree, setCountThree] = useState(5);

  return (
    <section id="filter-todo" className="rc-card motion-fade-up" aria-labelledby="filter-todo-heading">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id="filter-todo-heading" className="rc-subheading">
            Filter-Funktion
          </h2>
          <p className="rc-microcopy">
            Priorisiere Formate und entscheide, wie viel Content pro Tag reicht. RealityCheck gewichtet deinen Feed danach.
          </p>
        </div>
        {onEdit && (
          <button type="button" onClick={onEdit} className="rc-btn rc-btn--ghost inline-flex items-center gap-2">
            <PenSquareIcon className="h-4 w-4" aria-hidden="true" />
            Bearbeiten
          </button>
        )}
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <FormatPreferenceCard
          rank="Platz 1"
          selectedFormat={rankOne}
          onFormatChange={setRankOne}
          selectedCount={countOne}
          onCountChange={setCountOne}
        />
        <FormatPreferenceCard
          rank="Platz 2"
          selectedFormat={rankTwo}
          onFormatChange={setRankTwo}
          selectedCount={countTwo}
          onCountChange={setCountTwo}
        />
        <FormatPreferenceCard
          rank="Platz 3"
          selectedFormat={rankThree}
          onFormatChange={setRankThree}
          selectedCount={countThree}
          onCountChange={setCountThree}
        />
      </div>

      <div className="mt-8 rc-subcard">
        <p className="rc-subcard__body">
          RealityCheck stellt Formate in deiner Reihenfolge dar. Platz 1 taucht zuerst auf, Platz 3 nur noch als Akzent. Die Limits
          greifen, sobald das Filter-Interface live ist. Formate können mehrfach gewählt werden – RealityCheck verhindert Dopplungen
          automatisch.
        </p>
        <p className="rc-subcard__body mt-3">
          Aktuelle Reihenfolge: <strong>{rankOne}</strong> ({countOne}/Tag), <strong>{rankTwo}</strong> ({countTwo}/Tag),
          <strong> {rankThree}</strong> ({countThree}/Tag)
        </p>
      </div>
    </section>
  );
};

interface FormatPreferenceCardProps {
  rank: string;
  selectedFormat: string;
  onFormatChange: (value: string) => void;
  selectedCount: number;
  onCountChange: (value: number) => void;
}

const FormatPreferenceCard = ({
  rank,
  selectedFormat,
  onFormatChange,
  selectedCount,
  onCountChange,
}: FormatPreferenceCardProps) => {
  return (
    <div className="rc-subcard">
      <span className="rc-chip rc-chip--ghost">{rank}</span>
      <div className="mt-3 flex flex-col gap-3">
        <label className="text-sm text-rc-cream" htmlFor={`${rank}-format`}>
          Format
        </label>
        <select
          id={`${rank}-format`}
          value={selectedFormat}
          onChange={(event) => onFormatChange(event.target.value)}
          className="rc-select"
        >
          {formatOptions.map((option) => (
            <option key={`${rank}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label className="text-sm text-rc-cream" htmlFor={`${rank}-count`}>
          Max. Inhalte pro Tag
        </label>
        <select
          id={`${rank}-count`}
          value={selectedCount}
          onChange={(event) => onCountChange(Number(event.target.value))}
          className="rc-select"
        >
          {countOptions.map((count) => (
            <option key={`${rank}-count-${count}`} value={count}>
              {count} Inhalte
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterTodoCard;
