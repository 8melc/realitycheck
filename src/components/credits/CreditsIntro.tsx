'use client';

import React from 'react';
import './credits-variables.css';

export default function CreditsIntro() {
  return (
    <section className="credits-header fade-in-up">
      <div className="credits-header-background"></div>
      <div className="credits-header-content">
        {/* Content removed - now handled by page header */}
      </div>
      <style jsx>{`
        .credits-header {
          position: relative;
          padding: 40px 0 20px;
          background: radial-gradient(circle at top right, rgba(78, 205, 196, 0.08), transparent 60%);
          color: var(--fyf-cream);
          font-family: var(--fyf-font-display);
          min-height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .credits-header-background {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(135deg, rgba(6, 8, 10, 0.82), rgba(6, 8, 10, 0.95)),
            var(--fyf-noise);
          background-size: auto, 120px;
          opacity: 0.9;
          z-index: -1;
        }
        
        .credits-header-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          padding: 0 2rem;
          text-align: center;
        }
        
        
        
        @media (max-width: 900px) {
          .credits-header {
            padding: 30px 0 15px;
          }
        }
        
        @media (max-width: 640px) {
          .credits-header {
            padding: 20px 0 10px;
          }
          
          .credits-header-content {
            padding: 0 1rem;
          }
        }
      `}</style>
    </section>
  );
}