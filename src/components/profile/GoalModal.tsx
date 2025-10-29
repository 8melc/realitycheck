import { useEffect, useRef, useState } from 'react';
import { Profile } from '@/types/profile';
import { ChevronRightIcon } from './icons';

const GOAL_SUGGESTIONS = [
  'Freiheit spüren, bevor ich 50 bin',
  'Nie wieder zurück ins Hamsterrad',
  'Aussteigen und etwas hinterlassen',
  'Ein Jahr kein Bullshit-Meeting',
  'Etwas bauen, das bleibt',
  'Mehr sehen als Insta mir zeigt',
];

interface GoalModalProps {
  open: boolean;
  initialGoal: Profile['goal']['text'];
  onClose: () => void;
  onSave: (goal: { text: string; source: Profile['goal']['source'] }) => void;
}

const GoalModal = ({ open, initialGoal, onClose, onSave }: GoalModalProps) => {
  const [goalValue, setGoalValue] = useState(initialGoal ?? '');
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGoalValue(initialGoal ?? '');
    setSelectedChip(initialGoal && GOAL_SUGGESTIONS.includes(initialGoal) ? initialGoal : null);
  }, [initialGoal, open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSave = () => {
    const trimmed = goalValue.trim();
    const isChip = selectedChip !== null && selectedChip === trimmed;

    if (!trimmed) {
      return;
    }

    onSave({
      text: trimmed,
      source: isChip ? 'chip' : 'custom',
    });
  };

  return (
    <div className="fyf-modal-backdrop" role="presentation">
      <div
        ref={dialogRef}
        className="fyf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-heading"
        tabIndex={-1}
      >
        <div className="flex flex-col gap-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h2 id="goal-modal-heading" className="fyf-subheading">
                Ziel aktualisieren
              </h2>
              <p className="fyf-microcopy">Kein Fremdzweck, kein Bullshit. Schreib auf, was du wirklich willst.</p>
            </div>
            <button type="button" onClick={onClose} className="fyf-btn fyf-btn--ghost">
              Schließen
            </button>
          </header>

          <div className="flex flex-col gap-4">
            <label htmlFor="goal-text" className="text-sm font-medium text-fyf-cream">
              Dein Ziel
            </label>
            <textarea
              id="goal-text"
              className="fyf-input h-28 resize-none"
              placeholder="Was würdest du verfolgen, wenn du niemandem etwas beweisen müsstest?"
              value={goalValue}
              onChange={(event) => {
                setGoalValue(event.target.value);
                setSelectedChip(null);
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-fyf-cream">Shortcut auswählen</span>
            <div className="flex flex-wrap gap-2">
              {GOAL_SUGGESTIONS.map((suggestion) => {
                const isActive = selectedChip === suggestion;
                return (
                  <button
                    key={suggestion}
                    type="button"
                    className={`fyf-chip-button ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedChip(suggestion);
                      setGoalValue(suggestion);
                    }}
                  >
                    {suggestion}
                  </button>
                );
              })}
              <button
                type="button"
                className="fyf-chip-button fyf-chip-button--outline"
                onClick={() => {
                  setSelectedChip(null);
                  setGoalValue('');
                }}
              >
                Eigenes Ziel
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-fyf-steel">
            <span className="text-xs uppercase tracking-wide text-fyf-mint">Reminder</span>
            <p>Everything in FYF richtet sich nach deinem Ziel. Wenn du es änderst, reagiert der Guide sofort.</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="fyf-btn fyf-btn--ghost">
              Abbrechen
            </button>
            <button
              type="button"
              className="fyf-btn inline-flex items-center gap-2"
              onClick={handleSave}
              disabled={goalValue.trim().length === 0}
            >
              Speichern
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;