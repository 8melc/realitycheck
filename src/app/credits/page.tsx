'use client';

import React from 'react';
import CreditsIntro from '@/components/credits/CreditsIntro';
import CreditsCore from '@/components/credits/CreditsCore';
import CreditsTable from '@/components/credits/CreditsTable';
import CreditsPurchaseFlow from '@/components/credits/CreditsPurchaseFlow';
import CreditsSlider from '@/components/credits/CreditsSlider';
import CreditsScenarios from '@/components/credits/CreditsScenarios';
import CreditsEthic from '@/components/credits/CreditsEthic';
import CreditsLanguage from '@/components/credits/CreditsLanguage';
import CreditsFooter from '@/components/credits/CreditsFooter';

export default function CreditsPage() {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          /* Reality Check Color System */
          --realitycheck-noir: #0A0A0A;
          --realitycheck-carbon: #1A1A1A;
          --realitycheck-charcoal: #2D2D3F;
          --realitycheck-coral: #FF6B6B;
          --realitycheck-mint: #4ECDC4;
          --realitycheck-cream: #FFF8E7;
          --realitycheck-steel: #B8BCC8;

          /* Gradients */
          --gradient-dark: linear-gradient(135deg, #0A0A0A 0%, #2D2D3F 100%);
          --gradient-coral-mint: linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%);

          /* Typography */
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', -apple-system, sans-serif;
        }

        /* Title */
        .about-title {
          font-family: var(--font-display);
          font-size: clamp(4rem, 8vw, 7rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          background: var(--gradient-coral-mint);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
          margin-bottom: 20px;
        }

        .subline {
          font-family: var(--font-body);
          font-size: 1.2rem;
          color: var(--realitycheck-steel);
          text-align: center;
          margin-bottom: 60px;
          font-weight: 400;
          line-height: 1.5;
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 20px 0;
        }
      `}</style>
      
      <div className="header-container">
        <h1 className="about-title">CREDITS</h1>
        <p className="subline">
          Reality Check führt eine eigene Logik von Wert ein:<br />
          nicht Zeitverkauf, sondern Zeitbewusstsein.<br />
          Jede Credit-Entscheidung ist freiwillig und transparent –<br />
          weil Selbstverantwortung nicht manipuliert werden soll.
        </p>
      </div>
      
      <main id="realitycheck-credits-page">
        <CreditsIntro />
        <CreditsCore />
        <CreditsTable />
        <CreditsPurchaseFlow />
        <CreditsSlider />
        <CreditsScenarios />
        <CreditsEthic />
        <CreditsLanguage />
        <CreditsFooter />
      </main>
    </>
  );
}