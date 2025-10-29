'use client'

import { useState } from 'react'
import { QuestionSubmission } from '@/types/people'

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
}

export default function QuestionModal({ isOpen, onClose, personName }: QuestionModalProps) {
  const [formData, setFormData] = useState<QuestionSubmission>({
    userName: '',
    userEmail: '',
    questionText: '',
    targetPerson: personName
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would send to your backend
      console.log('Question submitted:', formData);
      
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        setFormData({
          userName: '',
          userEmail: '',
          questionText: '',
          targetPerson: personName
        });
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Frage an {personName}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {submitStatus === 'success' ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Frage übermittelt</h3>
            <p>Deine Frage wurde erfolgreich übermittelt und wird moderiert.</p>
          </div>
        ) : (
          <>
            <div className="moderation-notice">
              <div className="notice-icon">ℹ</div>
              <p>Fragen werden moderiert; kein Networking oder Kontakttausch. FYF schützt Privatsphäre und Substanz vor Viralität.</p>
            </div>

            <form onSubmit={handleSubmit} className="question-form">
              <div className="form-group">
                <label htmlFor="userName">Dein Name</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                  placeholder="Wie soll {personName} dich nennen?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="userEmail">E-Mail</label>
                <input
                  type="email"
                  id="userEmail"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="Für Rückfragen (wird nicht weitergegeben)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="questionText">Deine Frage</label>
                <textarea
                  id="questionText"
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Was möchtest du von {personName} wissen?"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Wird übermittelt...' : 'Frage stellen'}
                </button>
              </div>
            </form>

            {submitStatus === 'error' && (
              <div className="error-message">
                <p>Fehler beim Übermitteln. Bitte versuche es erneut.</p>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-container {
          background: var(--fyf-carbon);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--fyf-cream);
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          color: var(--fyf-steel);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 107, 107, 0.1);
          color: var(--fyf-coral);
        }

        .moderation-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(78, 205, 196, 0.1);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 12px;
          padding: 16px 20px;
          margin: 24px 32px;
        }

        .notice-icon {
          color: var(--fyf-mint);
          font-weight: bold;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .moderation-notice p {
          color: var(--fyf-steel);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }

        .question-form {
          padding: 0 32px 32px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--fyf-cream);
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--fyf-cream);
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--fyf-mint);
          background: rgba(78, 205, 196, 0.05);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: var(--fyf-steel);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
        }

        .cancel-button,
        .submit-button {
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .cancel-button {
          background: transparent;
          color: var(--fyf-steel);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cancel-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--fyf-cream);
        }

        .submit-button {
          background: var(--fyf-coral);
          color: var(--fyf-noir);
          border: 2px solid var(--fyf-coral);
        }

        .submit-button:hover:not(:disabled) {
          background: transparent;
          color: var(--fyf-coral);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          text-align: center;
          padding: 40px 32px;
        }

        .success-icon {
          width: 60px;
          height: 60px;
          background: var(--fyf-mint);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: var(--fyf-noir);
          margin: 0 auto 20px;
        }

        .success-message h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--fyf-cream);
          margin-bottom: 12px;
        }

        .success-message p {
          color: var(--fyf-steel);
          line-height: 1.5;
        }

        .error-message {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin: 16px 32px 0;
        }

        .error-message p {
          color: var(--fyf-coral);
          font-size: 0.9rem;
          margin: 0;
          text-align: center;
        }

        @media (max-width: 768px) {
          .modal-container {
            margin: 10px;
            max-width: none;
          }

          .modal-header,
          .question-form {
            padding-left: 20px;
            padding-right: 20px;
          }

          .moderation-notice {
            margin-left: 20px;
            margin-right: 20px;
          }

          .form-actions {
            flex-direction: column;
          }

          .cancel-button,
          .submit-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
