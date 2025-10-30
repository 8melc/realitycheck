'use client';

import React from 'react';
import './credits-variables.css';

export default function CreditsEthic() {
  return (
    <section className="credits-ethic fade-in-up">
      <div className="credits-ethic-container">
        <div className="ethic-content">
          <div className="ethic-text">
            <h2>Transparenz und Ethik</h2>
            <p>
              RealityCheck arbeitet mit psychologischer Integrität. Jede Transaktion ist lesbar und verständlich.<br />
              Kein Rabatt, keine Verknappung, kein Druck. Nur Vertrauen.
            </p>
          </div>
          
          <div className="ethic-principles">
            <ul className="principles-list">
              <li>
                <span className="checkmark">✓</span>
                <span className="principle-text">Keine Abos</span>
              </li>
              <li>
                <span className="checkmark">✓</span>
                <span className="principle-text">Keine versteckten<br />Kosten</span>
              </li>
              <li>
                <span className="checkmark">✓</span>
                <span className="principle-text">Keine Dringlichkeits-<br />tricks</span>
              </li>
              <li>
                <span className="checkmark">✓</span>
                <span className="principle-text">Keine Rabatte</span>
              </li>
              <li>
                <span className="checkmark">✓</span>
                <span className="principle-text">Kein Kauf-Tracking</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="ethic-info-box">
          <p>RealityCheck nutzt keine psychologischen Verkaufsmechanismen. Du entscheidest. RealityCheck stellt nur die Frage.</p>
        </div>
      </div>
      
      <style jsx>{`
        .credits-ethic {
          padding: 4rem 2rem;
          background: var(--rc-bg);
          position: relative;
        }
        
        .credits-ethic::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--rc-noise);
          opacity: 0.08;
          pointer-events: none;
        }
        
        .credits-ethic-container {
          position: relative;
          z-index: 1;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .ethic-content {
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-bottom: 3rem;
        }
        
        .ethic-text {
          text-align: center;
        }
        
        .ethic-text h2 {
          font-family: var(--rc-font-display);
          font-size: clamp(26px, 3vw, 30px);
          font-weight: 500;
          color: var(--rc-cream);
          margin-bottom: 1.5rem;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        
        .ethic-text p {
          font-family: var(--rc-font-sans);
          font-size: 15px;
          color: var(--rc-offwhite);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .ethic-principles {
          display: flex;
          justify-content: center;
        }
        
        .principles-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 1.2rem;
          grid-template-columns: repeat(5, 1fr);
          width: 100%;
        }
        
        .principles-list li {
          font-family: var(--rc-font-sans);
          font-size: 14px;
          color: var(--rc-offwhite);
          padding: 1.25rem;
          border: 1px solid var(--rc-border);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          min-height: 90px;
          height: 100%;
        }
        
        .checkmark {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: var(--rc-mint);
          border-radius: 50%;
          color: var(--rc-bg);
          font-size: 11px;
          font-weight: bold;
          line-height: 1;
        }
        
        .principle-text {
          flex: 1;
          line-height: 1.4;
          text-align: left;
        }
        
        .ethic-info-box {
          background: rgba(78, 205, 196, 0.08);
          padding: 2rem 2.5rem;
          border-radius: 22px;
          text-align: center;
          color: var(--rc-offwhite);
          font-style: italic;
          border: 1px solid rgba(78, 205, 196, 0.35);
          font-family: var(--rc-font-sans);
          font-size: 16px;
          line-height: 1.65;
          backdrop-filter: blur(4px);
          box-shadow: 0 14px 60px rgba(0, 0, 0, 0.45);
          max-width: 100%;
        }
        
        .ethic-info-box p {
          margin: 0;
          padding: 0;
          color: var(--rc-offwhite);
        }
        
        /* Tablet - 2 columns */
        @media (max-width: 1280px) {
          .principles-list {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          
          .principles-list li {
            min-height: 95px;
          }
        }
        
        /* Mobile - 3 columns */
        @media (max-width: 900px) {
          .credits-ethic {
            padding: 3rem 1.5rem;
          }
          
          .ethic-content {
            gap: 30px;
          }
          
          .ethic-text h2 {
            font-size: 24px;
          }
          
          .principles-list {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.875rem;
          }
          
          .principles-list li {
            min-height: 85px;
            padding: 1rem 0.875rem;
            font-size: 13px;
          }
          
          .checkmark {
            width: 18px;
            height: 18px;
            font-size: 10px;
          }
        }
        
        /* Small Mobile - Single column */
        @media (max-width: 620px) {
          .credits-ethic {
            padding: 2.5rem 1rem;
          }
          
          .principles-list {
            grid-template-columns: 1fr;
            gap: 0.875rem;
          }
          
          .principles-list li {
            min-height: 80px;
            padding: 1rem 1rem;
            font-size: 13px;
          }
          
          .ethic-info-box {
            padding: 1.5rem 1.5rem;
            font-size: 15px;
          }
        }
      `}</style>
    </section>
  );
}