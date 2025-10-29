'use client';

import React, { useState } from 'react';
import './credits-variables.css';

export default function CreditsSlider() {
  const [hourValue, setHourValue] = useState(5);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHourValue(parseFloat(e.target.value));
  };
  
  const creditValue = (hourValue / 6).toFixed(2);
  
  return (
    <section className="credits-slider fade-in-up">
      <div className="credits-slider-container">
        <h2>Wie viel ist dir eine Stunde Zeit wert?</h2>
        
        <div className="slider-wrapper">
          <input 
            type="range" 
            id="valueInput" 
            min="1" 
            max="10" 
            step="0.1"
            value={hourValue}
            onChange={handleSliderChange}
            className="value-slider"
          />
          
          <div className="slider-labels">
            <span>1 €</span>
            <span>10 €</span>
          </div>
        </div>
        
        <div className="calculation-display">
          <span className="credit-value">= {creditValue} € pro Credit</span>
        </div>
        
        <div className="privacy-note">
          <small>Dein Wert bleibt privat. FYF bewertet nicht, was du zahlst.</small>
        </div>
      </div>
      
      <style jsx>{`
        .credits-slider {
          padding: 4rem 2rem;
          background: var(--fyf-bg);
          position: relative;
        }
        
        .credits-slider::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--fyf-noise);
          opacity: 0.08;
          pointer-events: none;
        }
        
        .credits-slider-container {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        
        .credits-slider h2 {
          font-family: var(--fyf-font-display);
          font-size: clamp(26px, 3vw, 30px);
          font-weight: 500;
          color: var(--fyf-cream);
          margin-bottom: 3rem;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        
        .slider-wrapper {
          margin-bottom: 2rem;
          background: linear-gradient(180deg, rgba(7, 9, 12, 0.92), rgba(7, 9, 12, 0.82));
          border-radius: 22px;
          border: 1px solid rgba(78, 205, 196, 0.25);
          padding: 32px;
          backdrop-filter: blur(4px);
          box-shadow: 0 14px 60px rgba(0, 0, 0, 0.45);
        }
        
        .value-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: var(--fyf-subtle);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          margin-bottom: 1rem;
          transition: all 220ms ease;
        }
        
        .value-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--fyf-mint);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: all 220ms ease;
        }
        
        .value-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(78, 205, 196, 0.4);
        }
        
        .value-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--fyf-mint);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-family: var(--fyf-font-sans);
          font-size: 14px;
          color: var(--fyf-muted);
          margin-top: 0.5rem;
        }
        
        .calculation-display {
          margin-bottom: 2rem;
        }
        
        .credit-value {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 24px;
          font-weight: 500;
          color: var(--fyf-mint);
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem 2rem;
          border-radius: 18px;
          border: 1px solid var(--fyf-border);
          display: inline-block;
          box-shadow: 0 12px 32px rgba(78, 205, 196, 0.28);
        }
        
        .privacy-note {
          color: var(--fyf-muted);
          font-family: var(--fyf-font-sans);
          font-size: 14px;
          font-style: italic;
        }
        
        @media (max-width: 620px) {
          .credits-slider {
            padding: 3rem 1rem;
          }
          
          .credits-slider h2 {
            font-size: 24px;
            margin-bottom: 2rem;
          }
          
          .slider-wrapper {
            padding: 24px;
          }
          
          .credit-value {
            font-size: 20px;
            padding: 0.75rem 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}