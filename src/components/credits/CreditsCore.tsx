'use client';

import React from 'react';
import './credits-variables.css';

export default function CreditsCore() {
  return (
    <section className="credits-cards fade-in-up">
      <div className="credits-cards-container">
        <div className="feed-card feedboard-hover">
          <div className="card-icon">
            <img src="/icons/credits/earn.svg" alt="Earn" />
          </div>
          <h3>Earn</h3>
          <p>Du erhältst Credits durch bewusstes Verhalten – nicht durch Aktivität.</p>
        </div>
        
        <div className="feed-card feedboard-hover">
          <div className="card-icon">
            <img src="/icons/credits/burn.svg" alt="Burn" />
          </div>
          <h3>Burn</h3>
          <p>Du investierst Credits, wenn du Zeit verlängern oder bewusst nutzen möchtest.</p>
        </div>
        
        <div className="feed-card feedboard-hover">
          <div className="card-icon">
            <img src="/icons/credits/buy.svg" alt="Buy" />
          </div>
          <h3>Buy</h3>
          <p>Du kannst Credits kaufen, um deinem Fokus einen Wert zu geben – selbstbestimmt und fair.</p>
        </div>
      </div>
      
      <div className="principle-footer">
        Credits verändern nicht, was du tust – sie verändern, wie du entscheidest.
      </div>
      
      <style jsx>{`
        .credits-cards {
          padding: 4rem 2rem;
          background: var(--fyf-bg);
          position: relative;
        }
        
        .credits-cards::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--fyf-noise);
          opacity: 0.12;
          pointer-events: none;
        }
        
        .credits-cards-container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 28px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .feed-card {
          grid-column: span 4;
          position: relative;
          isolation: isolate;
          border-radius: 26px;
          overflow: hidden;
          min-height: 280px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          padding: 50px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 24px;
        }
        
        .feed-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(78, 205, 196, 0.08), transparent 60%);
          opacity: 0;
          transition: opacity 220ms ease;
        }
        
        .feed-card:hover::after {
          opacity: 1;
        }
        
        .card-icon {
          margin-bottom: 0;
        }
        
        .card-icon img {
          width: 48px;
          height: 48px;
        }
        
        .feed-card h3 {
          font-family: var(--fyf-font-display);
          font-size: 22px;
          font-weight: 500;
          color: var(--fyf-mint);
          margin: 0;
          letter-spacing: -0.01em;
        }
        
        .feed-card p {
          font-family: var(--fyf-font-sans);
          font-size: 16px;
          color: var(--fyf-offwhite);
          line-height: 1.6;
          margin: 0;
          opacity: 0.82;
        }
        
        .principle-footer {
          position: relative;
          z-index: 1;
          text-align: center;
          font-style: italic;
          color: var(--fyf-muted);
          margin-top: 3rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          border: 1px solid var(--fyf-border);
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          font-family: var(--fyf-font-sans);
          font-size: 16px;
        }
        
        @media (max-width: 1280px) {
          .credits-cards-container {
            grid-template-columns: repeat(8, minmax(0, 1fr));
          }
          
          .feed-card {
            grid-column: span 4;
          }
        }
        
        @media (max-width: 900px) {
          .credits-cards {
            padding: 3rem 1rem;
          }
          
          .credits-cards-container {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 20px;
          }
          
          .feed-card {
            grid-column: span 4;
            min-height: 240px;
            padding: 40px 32px;
          }
        }
        
        @media (max-width: 620px) {
          .feed-card {
            padding: 32px 24px;
            min-height: 220px;
          }
          
          .feed-card h3 {
            font-size: 20px;
          }
          
          .feed-card p {
            font-size: 15px;
          }
        }
      `}</style>
    </section>
  );
}