'use client';

import React from 'react';
import './credits-variables.css';

export default function CreditsFooter() {
  return (
    <footer className="credits-footer fade-in-up">
      <div className="credits-footer-container">
        <p>FYF verkauft keine Zeit. Wir geben ihr nur eine Form, damit du sie sehen kannst.</p>
      </div>
      
      <style jsx>{`
        .credits-footer {
          background: var(--fyf-bg);
          color: var(--fyf-cream);
          padding: 120px 0;
          text-align: center;
          position: relative;
          border-top: 1px solid rgba(78, 205, 196, 0.15);
        }
        
        .credits-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 0.5px;
          background: var(--fyf-mint);
        }
        
        .credits-footer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--fyf-noise);
          opacity: 0.08;
          pointer-events: none;
        }
        
        .credits-footer-container {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .credits-footer p {
          font-family: var(--fyf-font-display);
          font-size: 18px;
          font-style: italic;
          line-height: 1.6;
          margin: 0;
          color: var(--fyf-cream);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 620px) {
          .credits-footer {
            padding: 80px 0;
          }
          
          .credits-footer p {
            font-size: 16px;
          }
        }
      `}</style>
    </footer>
  );
}