'use client';

import React from 'react';
import './credits-variables.css';

export default function CreditsScenarios() {
  return (
    <section className="credits-scenarios fade-in-up">
      <div className="credits-scenarios-container">
        <h2>SZENARIEN VON CREDITS IM ALLTAG</h2>
        
        <div className="scenarios-grid">
          {/* Scenario 1: Zeitlimit erreicht */}
          <div className="scenario-card">
            <h3>Zeitlimit erreicht</h3>
            <p className="scenario-description">Nutzer erreicht 45 Minuten. Dialog öffnet sich.</p>
            <div className="scenario-action">
              „Du kannst weitermachen (2 Credits) oder pausieren."
            </div>
            <p className="scenario-concept">Entscheidung zwischen Fokus und Freiraum.</p>
          </div>

          {/* Scenario 2: Credit gekauft */}
          <div className="scenario-card">
            <h3>Credit gekauft</h3>
            <p className="scenario-description">Wallet leer. Button öffnet seriösen Dialog.</p>
            <div className="scenario-action">
              „Ein Credit = 10 bewusste Minuten."
            </div>
            <p className="scenario-concept">Kauf als Symbol für Eigenverantwortung.</p>
          </div>

          {/* Scenario 3: Ziel erreicht */}
          <div className="scenario-card">
            <h3>Ziel erreicht</h3>
            <p className="scenario-description">Nutzer bleibt 30 Tage unter Limit.</p>
            <div className="scenario-action">
              „Du hast dein Limit gehalten. +3 Credits."
            </div>
            <p className="scenario-concept">Vertrauen in Selbstdisziplin.</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .credits-scenarios {
          padding: 80px 0;
          background: var(--fyf-noir);
          color: var(--fyf-cream);
        }

        .credits-scenarios-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .credits-scenarios h2 {
          font-family: var(--fyf-font-display);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          text-align: center;
          margin-bottom: 60px;
          color: var(--fyf-cream);
        }

        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .scenario-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 16px;
          padding: 30px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .scenario-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.05) 0%, rgba(255, 107, 107, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .scenario-card:hover::before {
          opacity: 1;
        }

        .scenario-card:hover {
          transform: translateY(-4px);
          border-color: rgba(78, 205, 196, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .scenario-card h3 {
          font-family: var(--fyf-font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--fyf-cream);
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .scenario-description {
          font-family: var(--fyf-font-sans);
          font-size: 0.95rem;
          color: var(--fyf-steel);
          margin-bottom: 20px;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }

        .scenario-action {
          background: rgba(78, 205, 196, 0.1);
          border: 1px solid rgba(78, 205, 196, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
          font-family: var(--fyf-font-sans);
          font-size: 0.9rem;
          color: var(--fyf-mint);
          font-weight: 500;
          line-height: 1.4;
          position: relative;
          z-index: 1;
        }

        .scenario-concept {
          font-family: var(--fyf-font-sans);
          font-size: 0.85rem;
          color: var(--fyf-steel);
          font-style: italic;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .credits-scenarios {
            padding: 60px 0;
          }

          .credits-scenarios-container {
            padding: 0 1rem;
          }

          .scenarios-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .scenario-card {
            padding: 24px;
          }

          .scenario-card h3 {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .credits-scenarios h2 {
            font-size: 1.8rem;
            margin-bottom: 40px;
          }

          .scenario-card {
            padding: 20px;
          }

          .scenario-action {
            padding: 12px 16px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </section>
  );
}