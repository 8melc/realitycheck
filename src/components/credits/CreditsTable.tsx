'use client';

import React from 'react';
import './credits-variables.css';

export default function CreditsTable() {
  return (
    <section className="credits-table fade-in-up">
      <div className="credits-table-container">
        <h2>Wie funktioniert das System?</h2>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Aktion</th>
                <th>Bedeutung</th>
                <th>Beispiel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Earn</strong></td>
                <td>Für bewusste Handlungen erhältst du Credits.</td>
                <td className="example-text">7 Tage unter deinem Limit → +3 Credits</td>
              </tr>
              <tr>
                <td><strong>Burn</strong></td>
                <td>Nutzung erfordert Credits.</td>
                <td className="example-text">Verlängerung der Appzeit um 45 Minuten → –2 Credits</td>
              </tr>
              <tr>
                <td><strong>Buy</strong></td>
                <td>Credits kannst du freiwillig kaufen.</td>
                <td className="example-text">10 Credits = 5 € (Standardwert)</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="table-note">
          Jeder Credit steht für zehn bewusste Minuten deiner Zeit.
        </div>
      </div>
      
      <style jsx>{`
        .credits-table {
          padding: 4rem 2rem;
          background: var(--fyf-bg);
          position: relative;
        }
        
        .credits-table::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--fyf-noise);
          opacity: 0.08;
          pointer-events: none;
        }
        
        .credits-table-container {
          position: relative;
          z-index: 1;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .credits-table h2 {
          font-family: var(--fyf-font-display);
          font-size: clamp(26px, 3vw, 30px);
          font-weight: 500;
          color: var(--fyf-cream);
          margin-bottom: 2rem;
          text-align: center;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        
        .table-wrapper {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 26px;
          overflow: hidden;
          border: 1px solid var(--fyf-border);
          box-shadow: var(--fyf-shadow);
          margin-bottom: 1.5rem;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 1.5rem;
          text-align: left;
          border-bottom: 1px solid var(--fyf-border);
        }
        
        th {
          background: rgba(12, 14, 16, 0.68);
          font-family: var(--fyf-font-sans);
          font-weight: 600;
          color: var(--fyf-cream);
          font-size: 16px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        
        td {
          font-family: var(--fyf-font-sans);
          color: var(--fyf-offwhite);
          font-size: 16px;
          line-height: 1.5;
        }
        
        td strong {
          color: var(--fyf-cream);
          font-weight: 600;
        }
        
        .example-text {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          color: var(--fyf-mint);
          font-weight: 500;
        }
        
        .table-note {
          text-align: center;
          color: var(--fyf-muted);
          font-style: italic;
          font-family: var(--fyf-font-sans);
          font-size: 15px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          border-left: 4px solid var(--fyf-mint);
          border: 1px solid var(--fyf-border);
        }
        
        @media (max-width: 768px) {
          .credits-table {
            padding: 3rem 1rem;
          }
          
          th, td {
            padding: 1rem;
            font-size: 14px;
          }
          
          .credits-table h2 {
            font-size: 24px;
          }
        }
        
        @media (max-width: 620px) {
          table {
            font-size: 13px;
          }
          
          th, td {
            padding: 0.75rem;
          }
          
          .example-text {
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
}