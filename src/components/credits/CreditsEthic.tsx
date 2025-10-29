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
              FYF arbeitet mit psychologischer Integrität. Jede Transaktion ist lesbar und verständlich.<br />
              Kein Rabatt, keine Verknappung, kein Druck. Nur Vertrauen.
            </p>
          </div>
          
          <div className="ethic-principles">
            <ul className="principles-list">
              <li>✓ Keine Abos</li>
              <li>✓ Keine versteckten Kosten</li>
              <li>✓ Keine Dringlichkeitstricks</li>
              <li>✓ Keine Rabatte</li>
              <li>✓ Kein Tracking deiner Käufe</li>
            </ul>
          </div>
        </div>
        
        <div className="ethic-info-box">
          FYF nutzt keine psychologischen Verkaufsmechanismen. Du entscheidest. FYF stellt nur die Frage.
        </div>
      </div>
      
      <style jsx>{`
        .credits-ethic {
          padding: 4rem 2rem;
          background: var(--fyf-bg);
          position: relative;
        }
        
        .credits-ethic::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--fyf-noise);
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
          font-family: var(--fyf-font-display);
          font-size: clamp(26px, 3vw, 30px);
          font-weight: 500;
          color: var(--fyf-cream);
          margin-bottom: 1.5rem;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        
        .ethic-text p {
          font-family: var(--fyf-font-sans);
          font-size: 15px;
          color: var(--fyf-offwhite);
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
          gap: 16px;
          grid-template-columns: repeat(5, 1fr);
        }
        
        .principles-list li {
          font-family: var(--fyf-font-sans);
          font-size: 14px;
          color: var(--fyf-offwhite);
          padding: 18px 20px 20px;
          border: 1px solid var(--fyf-border);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-height: 114px;
          position: relative;
          padding-left: 3rem;
        }
        
        .principles-list li::before {
          content: '';
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          background: var(--fyf-mint);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .principles-list li::after {
          content: '✓';
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--fyf-bg);
          font-size: 10px;
          font-weight: bold;
        }
        
        .ethic-info-box {
          background: linear-gradient(180deg, rgba(7, 9, 11, 0.96), rgba(7, 9, 11, 0.82));
          padding: 2rem;
          border-radius: 22px;
          text-align: center;
          color: var(--fyf-offwhite);
          font-style: italic;
          border-left: 4px solid var(--fyf-mint);
          border: 1px solid rgba(78, 205, 196, 0.45);
          font-family: var(--fyf-font-sans);
          font-size: 16px;
          line-height: 1.6;
          backdrop-filter: blur(4px);
          box-shadow: 0 14px 60px rgba(0, 0, 0, 0.45);
        }
        
        @media (max-width: 1280px) {
          .ethic-content {
            gap: 30px;
          }
        }
        
        @media (max-width: 900px) {
          .credits-ethic {
            padding: 3rem 1rem;
          }
          
          .ethic-content {
            gap: 25px;
          }
          
          .ethic-text h2 {
            font-size: 24px;
          }
          
          .principles-list {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 620px) {
          .principles-list {
            grid-template-columns: 1fr;
          }
          
          .principles-list li {
            font-size: 13px;
            padding: 16px 18px 18px;
            min-height: 100px;
          }
          
          .ethic-info-box {
            padding: 1.5rem;
            font-size: 15px;
          }
        }
      `}</style>
    </section>
  );
}