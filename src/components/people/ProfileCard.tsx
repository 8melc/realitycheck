'use client'

import { Person } from '@/types/people'

interface ProfileCardProps {
  person: Person;
  onAskQuestion: (personName: string) => void;
}

export default function ProfileCard({ person, onAskQuestion }: ProfileCardProps) {
  const handleAskQuestion = () => {
    onAskQuestion(person.name);
  };

  const handleSecondaryCTA = (cta: any) => {
    if (cta.url) {
      window.open(cta.url, '_blank');
    }
  };

  return (
    <div className="profile-card">
      {/* Header */}
      <div className="profile-header">
        <h3 className="profile-name">{person.name}</h3>
        <p className="profile-bio">{person.bio}</p>
        <p className="profile-claim">"{person.claim}"</p>
      </div>

      {/* Tags */}
      <div className="profile-tags">
        {person.tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
          </span>
        ))}
      </div>

      {/* Offer */}
      <div className="profile-offer">
        <p className="offer-text">{person.offer}</p>
      </div>

      {/* Q&A Section */}
      <div className="qa-section">
        {person.questions.map((qa, index) => (
          <div key={index} className="qa-item">
            <p className="question">{qa.q}</p>
            <p className="answer">{qa.a}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="profile-ctas">
        <button 
          className="cta-primary"
          onClick={handleAskQuestion}
        >
          Frage stellen
        </button>
        
        {person.cta.filter(cta => cta.action !== 'openQuestionModal').map((cta, index) => (
          <button
            key={index}
            className="cta-secondary"
            onClick={() => handleSecondaryCTA(cta)}
          >
            {cta.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .profile-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .profile-card:hover {
          transform: translateY(-4px);
          border-color: rgba(78, 205, 196, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .profile-header {
          margin-bottom: 24px;
        }

        .profile-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--fyf-cream);
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .profile-bio {
          font-size: 0.9rem;
          color: var(--fyf-mint);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .profile-claim {
          font-size: 1rem;
          color: var(--fyf-steel);
          font-style: italic;
          line-height: 1.5;
          margin-bottom: 0;
        }

        .profile-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tag {
          background: rgba(78, 205, 196, 0.1);
          border: 1px solid rgba(78, 205, 196, 0.2);
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.8rem;
          color: var(--fyf-mint);
          font-weight: 500;
        }

        .profile-offer {
          margin-bottom: 24px;
        }

        .offer-text {
          font-size: 0.9rem;
          color: var(--fyf-steel);
          line-height: 1.4;
        }

        .qa-section {
          margin-bottom: 32px;
        }

        .qa-item {
          margin-bottom: 20px;
        }

        .qa-item:last-child {
          margin-bottom: 0;
        }

        .question {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--fyf-cream);
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .answer {
          font-size: 0.9rem;
          color: var(--fyf-steel);
          line-height: 1.5;
          padding-left: 16px;
          border-left: 2px solid rgba(78, 205, 196, 0.3);
        }

        .profile-ctas {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cta-primary {
          padding: 12px 24px;
          background: var(--fyf-coral);
          color: var(--fyf-noir);
          border: 2px solid var(--fyf-coral);
          border-radius: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .cta-primary:hover {
          background: transparent;
          color: var(--fyf-coral);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }

        .cta-secondary {
          padding: 10px 20px;
          background: transparent;
          color: var(--fyf-mint);
          border: 1px solid rgba(78, 205, 196, 0.3);
          border-radius: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .cta-secondary:hover {
          background: rgba(78, 205, 196, 0.1);
          border-color: var(--fyf-mint);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .profile-card {
            padding: 24px;
          }

          .profile-name {
            font-size: 1.3rem;
          }

          .profile-tags {
            gap: 6px;
          }

          .tag {
            font-size: 0.75rem;
            padding: 4px 10px;
          }
        }
      `}</style>
    </div>
  );
}
