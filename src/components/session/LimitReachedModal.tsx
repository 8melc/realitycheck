import { useEffect, useRef } from 'react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onLogout: () => void;
  onContinue?: () => void; // Optional: "Trotzdem weiter" Button
}

const LimitReachedModal = ({ isOpen, onLogout, onContinue }: LimitReachedModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Focus first focusable element
    firstFocusableRef.current?.focus();

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="limit-modal">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-fyf-noir/80 backdrop-blur-sm z-50"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="limit-modal-title"
        aria-describedby="limit-modal-description"
      >
        <div className="w-full max-w-md">
          <div className="fyf-card motion-fade-up">
            <div className="flex flex-col items-center text-center gap-6">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-fyf-coral flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-fyf-noir"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3">
                <h2 
                  id="limit-modal-title"
                  className="fyf-heading text-fyf-coral"
                >
                  Tageslimit erreicht
                </h2>
                <p 
                  id="limit-modal-description"
                  className="text-fyf-cream"
                >
                  Dein Tageslimit ist durch. Die Welt geht nicht unter, aber dein Kopf braucht Pause.
                </p>
                <p className="text-fyf-steel text-sm">
                  Logout und morgen weiter – oder bewusst trotzdem bleiben.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full">
                <button
                  ref={firstFocusableRef}
                  onClick={onLogout}
                  className="fyf-btn fyf-btn--primary w-full"
                >
                  Jetzt abmelden
                </button>
                {onContinue && (
                  <button
                    onClick={onContinue}
                    className="fyf-btn fyf-btn--ghost w-full text-fyf-steel hover:text-fyf-cream"
                  >
                    Trotzdem weiter
                  </button>
                )}
              </div>

              {/* Additional Info */}
              <div className="text-xs text-fyf-steel">
                <p>
                  Dein Limit wird täglich um Mitternacht zurückgesetzt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedModal;
