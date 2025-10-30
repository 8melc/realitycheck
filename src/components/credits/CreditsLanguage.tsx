'use client';

import React from 'react';
import './credits-variables.css';

export default function CreditsLanguage() {
  return (
    <section className="credits-language fade-in-up">
      <div className="credits-language-container">
        <h2>Wie FYF spricht – auch wenn es um Geld geht</h2>
        
        <div className="language-content">
          <p>
            Im Credit-System spricht FYF sachlich und respektvoll.<br />
            Preise werden nicht verkauft, sondern erklärt.<br />
            Jeder Satz vermittelt Verlässlichkeit statt Einfluss.
          </p>
        </div>
        
        <div className="language-quotes">
          <blockquote>
            „Ein Credit entspricht zehn bewussten Minuten."
          </blockquote>
          <blockquote>
            „Credits sind Fokus, nicht Rabattpunkte."
          </blockquote>
          <blockquote>
            „Deine Entscheidung steht fest."
          </blockquote>
        </div>
      </div>
      
      <style jsx>{`
        .credits-language {
          padding: 4rem 2rem;
          background: var(--rc-bg);
          position: relative;
        }
        
        .credits-language::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--rc-noise);
          opacity: 0.08;
          pointer-events: none;
        }
        
        .credits-language-container {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        
        .credits-language h2 {
          font-family: var(--rc-font-display);
          font-size: clamp(26px, 3vw, 30px);
          font-weight: 500;
          color: var(--rc-cream);
          margin-bottom: 2rem;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        
        .language-content p {
          font-family: var(--rc-font-sans);
          font-size: 15px;
          color: var(--rc-offwhite);
          line-height: 1.6;
          margin-bottom: 3rem;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .language-quotes {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        blockquote {
          background: linear-gradient(180deg, rgba(7, 9, 11, 0.96), rgba(7, 9, 11, 0.82));
          padding: 2rem;
          border-radius: 22px;
          border-left: 4px solid var(--rc-mint);
          border: 1px solid rgba(78, 205, 196, 0.45);
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          color: var(--rc-offwhite);
          font-style: italic;
          margin: 0;
          text-align: left;
          transition: all 220ms ease;
          backdrop-filter: blur(4px);
          box-shadow: 0 14px 60px rgba(0, 0, 0, 0.45);
          position: relative;
          padding-left: 3rem;
        }
        
        blockquote::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 3px;
          background: linear-gradient(180deg, rgba(78, 205, 196, 0.6), transparent);
          border-radius: 999px;
        }
        
        blockquote:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.6);
        }
        
        @media (max-width: 620px) {
          .credits-language {
            padding: 3rem 1rem;
          }
          
          .credits-language h2 {
            font-size: 24px;
          }
          
          .language-content p {
            font-size: 14px;
          }
          
          blockquote {
            padding: 1.5rem;
            font-size: 13px;
            padding-left: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}