'use client'

import { useState } from 'react'

export default function BusinessPage() {
  const [earnPercentage, setEarnPercentage] = useState(20)
  const [buyPercentage, setBuyPercentage] = useState(80)

  const handleEarnChange = (value: number) => {
    setEarnPercentage(value)
    setBuyPercentage(100 - value)
  }

  const handleBuyChange = (value: number) => {
    setBuyPercentage(value)
    setEarnPercentage(100 - value)
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          /* FYF Color System */
          --fyf-bg: #06080a;
          --fyf-layer: rgba(6, 8, 10, 0.94);
          --fyf-mint: #4ecdc4;
          --fyf-offwhite: rgba(255, 255, 255, 0.88);
          --fyf-muted: rgba(255, 255, 255, 0.62);
          --fyf-subtle: rgba(255, 255, 255, 0.18);
          --fyf-border: rgba(255, 255, 255, 0.08);
          --fyf-border-strong: rgba(78, 205, 196, 0.45);
          --fyf-shadow: 0 22px 48px rgba(0, 0, 0, 0.45);
          --fyf-noise: url('data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMSIgY3k9IjQiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48Y2lyY2xlIGN4PSI2IiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjxjaXJjbGUgY3g9IjExIiBjeT0iMTAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=');
          
          /* Typography */
          --fyf-font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          --fyf-font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          --fyf-cream: #F2F0EA;
          --fyf-steel: rgba(255, 255, 255, 0.62);
        }

        /* Title */
        .reality-title {
          font-family: var(--fyf-font-display);
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: var(--fyf-cream);
          text-align: center;
          margin-bottom: 20px;
        }

        .subline {
          font-family: var(--fyf-font-sans);
          font-size: 1.1rem;
          color: var(--fyf-steel);
          text-align: center;
          margin-bottom: 60px;
          font-weight: 400;
          line-height: 1.5;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 20px 0;
        }

        /* Page Styles */
        #reality-check-page {
          background: var(--fyf-bg);
          color: var(--fyf-cream);
          font-family: var(--fyf-font-sans);
          min-height: 100vh;
        }

        .section {
          padding: 4rem 2rem;
          background: var(--fyf-bg);
          position: relative;
        }

        .section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--fyf-noise);
          opacity: 0.08;
          pointer-events: none;
        }

        .section-container {
          position: relative;
          z-index: 1;
          max-width: 1000px;
          margin: 0 auto;
        }

        .section-container-wide {
          position: relative;
          z-index: 1;
          width: 100%;
          margin: 0;
          padding: 0 1rem;
        }

        .section h2 {
          font-family: var(--fyf-font-display);
          font-size: clamp(24px, 3vw, 28px);
          font-weight: 600;
          color: var(--fyf-cream);
          margin-bottom: 2rem;
          text-align: center;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }

        .section p {
          color: var(--fyf-steel);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 2rem;
          text-align: center;
        }

        /* Input Styles */
        .input-field {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--fyf-cream);
          font-family: var(--fyf-font-sans);
          font-size: 14px;
          width: 100%;
          transition: border-color 220ms ease;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--fyf-mint);
        }

        .input-field::placeholder {
          color: var(--fyf-muted);
        }

        .input-number {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--fyf-cream);
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          text-align: center;
          width: 80px;
        }

        .input-number:focus {
          outline: none;
          border-color: var(--fyf-mint);
        }

        .select-field {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--fyf-cream);
          font-family: var(--fyf-font-sans);
          font-size: 14px;
          width: 100%;
        }

        .select-field:focus {
          outline: none;
          border-color: var(--fyf-mint);
        }

        /* Static Table Styles - Credits Page Pattern */
        .table-wrapper {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 26px;
          overflow: hidden;
          border: 1px solid var(--fyf-border);
          box-shadow: var(--fyf-shadow);
          margin-bottom: 1.5rem;
          width: 100%;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: auto;
          min-width: 100%;
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

        /* Distribution Box */
        .distribution-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .distribution-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .distribution-item h3 {
          font-family: var(--fyf-font-sans);
          font-weight: 600;
          color: var(--fyf-cream);
          margin-bottom: 1rem;
          font-size: 16px;
        }

        .distribution-visual {
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--fyf-border);
          display: flex;
        }

        .distribution-earn {
          background: linear-gradient(90deg, #4CAF50, #66BB6A);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .distribution-buy {
          background: linear-gradient(90deg, #2196F3, #42A5F5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        /* Flow Box */
        .flow-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .flow-text {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 16px;
          color: var(--fyf-mint);
          text-align: center;
          line-height: 1.8;
        }

        .flow-compact {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          color: var(--fyf-muted);
          text-align: center;
          margin-top: 1rem;
        }

        /* Modular System Box */
        .modular-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .modular-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .modular-item h4 {
          font-family: var(--fyf-font-sans);
          font-weight: 600;
          color: var(--fyf-cream);
          margin-bottom: 0.5rem;
          font-size: 14px;
        }

        .modular-item p {
          color: var(--fyf-muted);
          font-size: 13px;
          text-align: left;
          margin: 0;
        }

        /* Update Reminder */
        .update-reminder {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 8px;
          padding: 1rem 1.5rem;
          text-align: center;
          color: var(--fyf-muted);
          font-size: 13px;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .section {
            padding: 3rem 1rem;
          }
          
          .section-container-wide {
            padding: 0 0.5rem;
          }
          
          .distribution-grid,
          .modular-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          th, td {
            padding: 1rem;
            font-size: 13px;
          }
        }

        @media (max-width: 620px) {
          .table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          table {
            font-size: 12px;
            min-width: 800px;
          }
          
          th, td {
            padding: 0.75rem;
            white-space: nowrap;
          }
          
          th:first-child,
          td:first-child {
            position: sticky;
            left: 0;
            background: rgba(12, 14, 16, 0.9);
            z-index: 1;
          }
        }
      `}</style>
      
      <div className="header-container">
        <h1 className="reality-title">REALITYCHECK</h1>
        <p className="subline">
          Businessplan & Credit-Arithmetik<br />
          Diese Seite ist das Fundament des RealityCheck-Business. Hier stehen alle zentralen Annahmen und Zahlen auf einen Blick.
        </p>
      </div>
      
      <main id="reality-check-page">
        {/* Section 2: Earn vs. Buy Distribution */}
        <section className="section">
          <div className="section-container">
            <h2>Earn vs. Buy – Credit-Verteilung</h2>
            <p>
              Credits werden entweder durch aktive Teilnahme und Nutzung (Earn) oder direkt im System durch Kauf (Buy) generiert. Die Standardverteilung liegt bei 20 % Earn und 80 % Buy – diese Werte sind direkt editierbar und wirken sich live auf alle nachfolgenden Tabellen und Berechnungen aus.
            </p>
            <p style={{ fontStyle: 'italic', color: 'var(--fyf-muted)', fontSize: '14px', marginTop: '1rem' }}>
              20 % Earn, 80 % Buy basiert auf Erfahrungswerten: Nur ein kleiner Teil nutzt Earn-Mechanismen regelmäßig, der Großteil kauft Credits direkt.
            </p>

            <div className="distribution-box">
              <div className="distribution-grid">
                <div className="distribution-item">
                  <h3>Earn (Aktive Teilnahme)</h3>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={earnPercentage}
                    onChange={(e) => handleEarnChange(Number(e.target.value))}
                    className="input-number"
                  />
                  <span style={{ color: 'var(--fyf-muted)', marginLeft: '8px' }}>%</span>
                </div>
                <div className="distribution-item">
                  <h3>Buy (Direkter Kauf)</h3>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={buyPercentage}
                    onChange={(e) => handleBuyChange(Number(e.target.value))}
                    className="input-number"
                  />
                  <span style={{ color: 'var(--fyf-muted)', marginLeft: '8px' }}>%</span>
                </div>
              </div>

              <div className="distribution-visual">
                <div 
                  className="distribution-earn"
                  style={{ width: `${earnPercentage}%` }}
                >
                  Earn {earnPercentage}%
                </div>
                <div 
                  className="distribution-buy"
                  style={{ width: `${buyPercentage}%` }}
                >
                  Buy {buyPercentage}%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Products, Services & Events Monetization */}
        <section className="section">
          <div className="section-container-wide">
            <h2>Digitale Produkte, Events & Time Objects – Monetarisierung</h2>
            <p>
              Der Rollout startet mit digitalen Formaten, die direkt an die Plattform und ans Event-System andocken. Physische Produkte wie Time Objects (Designobjekte, Poster etc.) folgen als Erweiterung und Premiumlinie, sobald die digitale Basis trägt.
            </p>
            <p style={{ fontStyle: 'italic', color: 'var(--fyf-muted)', fontSize: '14px', marginTop: '1rem' }}>
              Phase 1 = digitale Produkte und Events; Phase 2 = physische Objekte (zuerst Break-even abwarten). Alle digitalen Produkte sind im System komplett verrechenbar (Credits oder Euro), keine zusätzliche Logistik notwendig.
            </p>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Phase</th>
                    <th>Produkt</th>
                    <th>Beschreibung & Logik</th>
                    <th>Beispielpreis</th>
                    <th>Erlösmodell</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="example-text">1</td>
                    <td><strong>Event-Tickets</strong></td>
                    <td>Zugang zu digitalen Workshops, Live-Sessions, Community-Events</td>
                    <td className="example-text">10–100 € (je nach Format)</td>
                    <td>Direkt, auch ➔ Credits</td>
                    <td>Aktiv, MVP</td>
                  </tr>
                  <tr>
                    <td className="example-text">1</td>
                    <td><strong>Focus Deck</strong></td>
                    <td>Digitales Reflexions-Kartenset, interaktiv im Account/onboarding</td>
                    <td className="example-text">5–8 € / 18–24 Credits</td>
                    <td>Direkt, auch ➔ Bundle</td>
                    <td>Startprodukt</td>
                  </tr>
                  <tr>
                    <td className="example-text">1</td>
                    <td><strong>Worksheets/Downloads</strong></td>
                    <td>Digitale Journals, Methoden-Sheets, Templates zum Download</td>
                    <td className="example-text">2–6 € / 8–20 Credits</td>
                    <td>Direktverkauf</td>
                    <td>Start (MVP)</td>
                  </tr>
                  <tr>
                    <td className="example-text">2</td>
                    <td><strong>Time Objects</strong></td>
                    <td>Physisches Premiumprodukt: Poster, Wochenblock, Desk-Piece. Erst live, wenn digitale Kernprodukte die Gewinnzone erreicht haben.</td>
                    <td className="example-text">20–60 € (Roadmap)</td>
                    <td>Direktverkauf</td>
                    <td>erst ab Phase 2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 4: Money Machine - Flow & Value Creation */}
        <section className="section">
          <div className="section-container">
            <h2>Money Machine – Flow & Wertschöpfung</h2>

            <div className="flow-box">
              <div className="flow-text">
                <strong>Useraktion</strong> → <strong>Creditsale</strong> → <strong>Einnahmen</strong> → <strong>Fixkosten</strong> → <strong>Marge</strong>
              </div>
              <div className="flow-compact">
                Sämtliche Umsätze entstehen direkt durch Credit/Produktbuchung<br />
                Systemwert ist die Marge nach Abzug der monatlichen Fixkosten
              </div>
            </div>

            <div className="flow-box" style={{ marginTop: '1rem', background: 'rgba(78, 205, 196, 0.1)', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
              <h4 style={{ color: 'var(--fyf-cream)', marginBottom: '1rem', fontSize: '16px' }}>Rechenbeispiel/Systemfluss</h4>
              <div className="flow-text" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                <strong>Beispiel:</strong> 1.000 User buchen 10 Events à 20 Credits = 200.000 Credits × 0,30 € = 60.000 € Einnahmen, 40.000 € Kosten, 20.000 € Marge.
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--fyf-border)' }}>
              <h4 style={{ color: 'var(--fyf-cream)', marginBottom: '1.5rem', fontSize: '16px', fontWeight: '600' }}>Fixkosten & Break-even</h4>
              
              <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Kostenart</th>
                      <th>Monatlicher Wert (Schätzung)</th>
                      <th>Erläuterung/Bemerkung</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Betrieb & Hosting</strong></td>
                      <td className="example-text"><strong>1.000 €</strong></td>
                      <td>Server, Security, Grundinfrastruktur</td>
                    </tr>
                    <tr>
                      <td><strong>KI-/API-Tools</strong></td>
                      <td className="example-text">250 €</td>
                      <td>externe Services</td>
                    </tr>
                    <tr>
                      <td><strong>Support/Backoffice</strong></td>
                      <td className="example-text">300 €</td>
                      <td>Basis-Support, Abwicklung</td>
                    </tr>
                    <tr>
                      <td><strong>Marketing-Basis</strong></td>
                      <td className="example-text">250 €</td>
                      <td>Website, Socials, laufende Sichtbarkeit</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid var(--fyf-border)' }}>
                      <td><strong>Summe Fixkosten</strong></td>
                      <td className="example-text"><strong>1.800 €</strong></td>
                      <td>Minimum-/Lean-Betrieb</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
                <h4 style={{ color: 'var(--fyf-cream)', marginBottom: '1rem', fontSize: '16px' }}>Break-even</h4>
                <div className="flow-text" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Ab ca. <strong>3.500 aktiven Nutzer:innen</strong> deckt das Modell die monatlichen Fixkosten (gerechnet bei Ø 8 Credits/U, 0,30 € p.Credit).
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: What-If Scenarios & Case Calculator */}
        <section className="section">
          <div className="section-container">
            <h2>Was-wäre-wenn – Szenarien & Case-Rechner</h2>
            <p>
              Alle Zahlen und Annahmen können flexibel angepasst werden. Teste hier verschiedene Szenarien, um zu sehen, wo sich Marge, Kosten und Produktmix verändern.
            </p>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Szenario</th>
                    <th>Userzahl</th>
                    <th>Earn-Rate</th>
                    <th>Annahmen</th>
                    <th>Umsatz</th>
                    <th>Kosten</th>
                    <th>Marge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Konservativ</strong></td>
                    <td className="example-text">2.500</td>
                    <td className="example-text">10%</td>
                    <td>Niedrige Earn-Rate (10%), wenig Events, wenig Downloads</td>
                    <td className="example-text">14.000 €</td>
                    <td className="example-text">7.900 €</td>
                    <td className="example-text">6.100 €</td>
                  </tr>
                  <tr>
                    <td><strong>Realistisch</strong></td>
                    <td className="example-text">5.000</td>
                    <td className="example-text">25%</td>
                    <td>Standard-Package-Nutzung (Earn 25%), normale Credits/User</td>
                    <td className="example-text">31.000 €</td>
                    <td className="example-text">11.500 €</td>
                    <td className="example-text">19.500 €</td>
                  </tr>
                  <tr>
                    <td><strong>Optimistisch</strong></td>
                    <td className="example-text">10.000</td>
                    <td className="example-text">45%</td>
                    <td>Viele Upgrades, hohe Event-Nutzung (Earn 45%), viele aktive User</td>
                    <td className="example-text">74.500 €</td>
                    <td className="example-text">21.200 €</td>
                    <td className="example-text">53.300 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
