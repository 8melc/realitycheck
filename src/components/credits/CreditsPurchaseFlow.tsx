'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import './credits-variables.css';

type PaymentMethod = 'paypal' | 'card';

type CreditPackage = {
  id: string;
  credits: number;
  label: string;
  priceEuro: number;
  description: string;
};

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    credits: 10,
    label: '10 Credits',
    priceEuro: 4,
    description: 'Für kurze Tests oder spontane Sessions.'
  },
  {
    id: 'focus',
    credits: 25,
    label: '25 Credits',
    priceEuro: 7.5,
    description: 'Einstieg in den Fokus – 0,30 € pro Credit.'
  },
  {
    id: 'deep',
    credits: 50,
    label: '50 Credits',
    priceEuro: 14,
    description: 'Für regelmäßige Nutzung, günstiger pro Credit.'
  },
  {
    id: 'studio',
    credits: 100,
    label: '100 Credits',
    priceEuro: 26,
    description: 'Team- oder Projektumfang, reduziert auf 0,26 €.'
  },
  {
    id: 'collective',
    credits: 1000,
    label: '1.000 Credits',
    priceEuro: 240,
    description: 'Community-/Company-Paket, maximale Ersparnis.'
  }
];

const paymentOptions: { id: PaymentMethod; label: string; helper: string }[] = [
  {
    id: 'paypal',
    label: 'PayPal',
    helper: 'Direkte Zahlung, Rechnung wird per E-Mail zugestellt.'
  },
  {
    id: 'card',
    label: 'Kreditkarte',
    helper: 'Visa/Mastercard, Abbuchung inklusive Rechnungsbeleg.'
  }
];

export default function CreditsPurchaseFlow() {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selectedPackage = useMemo(
    () => creditPackages.find((pkg) => pkg.id === selectedPackageId) ?? null,
    [selectedPackageId]
  );

  const pricePerCredit = selectedPackage
    ? selectedPackage.priceEuro / selectedPackage.credits
    : null;
  const operatingCosts = selectedPackage ? selectedPackage.credits * 0.2 : null;
  const contributionMargin =
    selectedPackage && operatingCosts !== null
      ? selectedPackage.priceEuro - operatingCosts
      : null;

  const currentStep = isConfirmed
    ? 4
    : paymentMethod
    ? 3
    : selectedPackage
    ? 2
    : 1;

  const steps = [
    { step: 1, title: 'Menge wählen', description: 'Paket nach Bedarf aussuchen.' },
    {
      step: 2,
      title: 'Preis prüfen',
      description: 'Kosten & Betriebskosten transparent sehen.'
    },
    {
      step: 3,
      title: 'Zahlung wählen',
      description: 'PayPal oder Kreditkarte selektieren.'
    },
    {
      step: 4,
      title: 'Bestätigung',
      description: 'Rechnungsinfo erhalten & Credits aktiv.'
    }
  ];

  const handleConfirm = () => {
    if (!selectedPackage || !paymentMethod) {
      return;
    }
    setIsConfirmed(true);
  };

  const formatCurrency = (value: number | null) =>
    value === null
      ? '–'
      : new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2
        }).format(value);

  return (
    <section className="credits-purchase-flow fade-in-up">
      <div className="flow-container">
        <header className="flow-header">
          <h2>Credits kaufen – klar und transparent</h2>
          <p>
            Keine Abos, kein Upsell. Du wählst selbst, wie viele Credits du brauchst und
            siehst, welcher Anteil den Betrieb deckt. Der Rest bleibt für Produktaufbau
            und Community.
          </p>
        </header>

        <div className="flow-steps">
          {steps.map((item) => (
            <div
              key={item.step}
              className={`flow-step ${currentStep >= item.step ? 'active' : ''}`}
            >
              <div className="step-number">{item.step}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="packages-grid">
          {creditPackages.map((pkg) => {
            const isSelected = pkg.id === selectedPackageId;
            return (
              <button
                key={pkg.id}
                type="button"
                className={`package-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedPackageId(pkg.id);
                  setIsConfirmed(false);
                }}
                aria-pressed={isSelected}
              >
                <div className="package-header">
                  <span className="package-label">{pkg.label}</span>
                  <span className="package-price">{formatCurrency(pkg.priceEuro)}</span>
                </div>
                <p>{pkg.description}</p>
                <div className="package-meta">
                  <span>
                    {`≈ ${(pkg.priceEuro / pkg.credits)
                      .toFixed(2)
                      .replace('.', ',')} € pro Credit`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flow-panels">
          <div className="cost-panel">
            <h3>Kostenübersicht</h3>
            <dl>
              <div>
                <dt>Gewähltes Paket</dt>
                <dd>
                  {selectedPackage
                    ? `${selectedPackage.credits} Credits`
                    : 'Noch keine Auswahl'}
                </dd>
              </div>
              <div>
                <dt>Preis</dt>
                <dd>{formatCurrency(selectedPackage?.priceEuro ?? null)}</dd>
              </div>
              <div>
                <dt>Betriebskosten (0,20 €/Credit)</dt>
                <dd>{formatCurrency(operatingCosts)}</dd>
              </div>
              <div>
                <dt>Beitrag Produkt/Community</dt>
                <dd>{formatCurrency(contributionMargin)}</dd>
              </div>
              <div>
                <dt>Preis je Credit</dt>
                <dd>
                  {pricePerCredit
                    ? `${pricePerCredit.toFixed(2).replace('.', ',')} €`
                    : '–'}
                </dd>
              </div>
            </dl>
            <p className="cost-hint">
              Mindestpreis 0,30 € je Credit. Größere Pakete senken den Stückpreis, die
              0,20 € Betriebskosten bleiben konstant.
            </p>
          </div>

          <div className="payment-panel">
            <h3>Zahlungsart</h3>
            <div className="payment-options">
              {paymentOptions.map((option) => {
                const isActive = paymentMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`payment-card ${isActive ? 'selected' : ''}`}
                    onClick={() => {
                      setPaymentMethod(option.id);
                      setIsConfirmed(false);
                    }}
                    aria-pressed={isActive}
                  >
                    <span className="payment-label">{option.label}</span>
                    <span className="payment-helper">{option.helper}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="confirm-button"
              onClick={handleConfirm}
              disabled={!selectedPackage || !paymentMethod || isConfirmed}
            >
              Kauf abschließen
            </button>

            <p className="confirmation-hint">
              Nach Abschluss erhältst du eine Bestätigung mit Rechnungsnummer und
              Download-Link. Credits werden sofort deinem Dashboard gutgeschrieben.
            </p>
          </div>
        </div>

        {isConfirmed && selectedPackage && (
          <div className="confirmation-card">
            <h3>Bestätigung</h3>
            <p>
              Kauf registriert: <strong>{selectedPackage.credits} Credits</strong> für{' '}
              <strong>{formatCurrency(selectedPackage.priceEuro)}</strong> via{' '}
              {paymentMethod === 'paypal' ? 'PayPal' : 'Kreditkarte'}.
            </p>
            <ul>
              <li>Rechnung FYF-{new Date().getFullYear()}-{selectedPackage.credits}</li>
              <li>Versand an: melissa.conrads@fyf.app (Beispieladresse)</li>
              <li>Credits sofort aktiv, Übersicht im Dashboard unter „Käufe & Belege“.</li>
            </ul>
          </div>
        )}

        <div className="faq-panel">
          <details>
            <summary>Was zahle ich, warum, was bleibt übrig?</summary>
            <div className="faq-body">
              <p>
                Jeder Kauf deckt zuerst Betriebskosten von <strong>0,20 € pro Credit</strong>.
                Damit werden Infrastruktur, Datenhaltung und Support bezahlt. Alles
                darüber fließt in Produktentwicklung und unabhängige Inhalte. Du siehst
                jederzeit, wie sich der Preis zusammensetzt.
              </p>
              <p>
                Mehr Hintergründe findest du im{' '}
                <Link href="/transparenz">Transparenzbereich</Link> sowie in den{' '}
                <Link href="/credits#faq">FAQ zu Credits</Link>.
              </p>
            </div>
          </details>
        </div>
      </div>

      <style jsx>{`
        .credits-purchase-flow {
          padding: 4rem 2rem;
          background: var(--fyf-bg);
          position: relative;
          color: var(--fyf-offwhite);
        }

        .credits-purchase-flow::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--fyf-noise);
          opacity: 0.08;
          pointer-events: none;
        }

        .flow-container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .flow-header h2 {
          font-family: var(--fyf-font-display);
          font-size: clamp(28px, 4vw, 36px);
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--fyf-cream);
          letter-spacing: -0.01em;
        }

        .flow-header p {
          font-family: var(--fyf-font-sans);
          font-size: 17px;
          line-height: 1.6;
          color: var(--fyf-muted);
          max-width: 760px;
        }

        .flow-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .flow-step {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--fyf-border);
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          transition: border 200ms ease, transform 200ms ease;
        }

        .flow-step.active {
          border-color: var(--fyf-border-strong);
          transform: translateY(-4px);
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: rgba(78, 205, 196, 0.22);
          color: var(--fyf-mint);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .flow-step h3 {
          margin: 0;
          font-size: 18px;
          font-family: var(--fyf-font-display);
          color: var(--fyf-cream);
        }

        .flow-step p {
          margin: 0.35rem 0 0;
          font-size: 15px;
          color: var(--fyf-muted);
        }

        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .package-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 22px;
          padding: 1.5rem;
          text-align: left;
          cursor: pointer;
          transition: transform 200ms ease, border 200ms ease, box-shadow 200ms ease;
          color: inherit;
        }

        .package-card:hover {
          transform: translateY(-6px);
          border-color: rgba(78, 205, 196, 0.4);
          box-shadow: var(--fyf-shadow);
        }

        .package-card.selected {
          border-color: var(--fyf-border-strong);
          box-shadow: 0 18px 40px rgba(78, 205, 196, 0.25);
        }

        .package-card:focus-visible {
          outline: 2px solid var(--fyf-mint);
          outline-offset: 2px;
        }

        .package-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.75rem;
          gap: 1rem;
        }

        .package-label {
          font-family: var(--fyf-font-display);
          font-size: 20px;
          color: var(--fyf-cream);
        }

        .package-price {
          font-family: var(--fyf-font-display);
          font-size: 18px;
          color: var(--fyf-mint);
        }

        .package-card p {
          margin: 0;
          font-size: 15px;
          color: var(--fyf-muted);
        }

        .package-meta {
          margin-top: 1rem;
          font-size: 14px;
          color: var(--fyf-muted);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .flow-panels {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .cost-panel,
        .payment-panel {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--fyf-border);
          border-radius: 24px;
          padding: 2rem;
          grid-column: span 6;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .cost-panel h3,
        .payment-panel h3 {
          margin: 0;
          font-family: var(--fyf-font-display);
          font-size: 20px;
          color: var(--fyf-cream);
        }

        dl {
          margin: 0;
          display: grid;
          gap: 0.75rem;
        }

        dl div {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1.5rem;
        }

        dt {
          font-size: 14px;
          color: var(--fyf-muted);
        }

        dd {
          font-size: 15px;
          color: var(--fyf-offwhite);
          margin: 0;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .cost-hint {
          margin: 0;
          font-size: 14px;
          color: var(--fyf-muted);
          line-height: 1.5;
        }

        .payment-options {
          display: grid;
          gap: 1rem;
        }

        .payment-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--fyf-border);
          border-radius: 18px;
          padding: 1.25rem;
          text-align: left;
          cursor: pointer;
          transition: transform 200ms ease, border 200ms ease, box-shadow 200ms ease;
          color: inherit;
        }

        .payment-card:hover {
          transform: translateY(-4px);
          border-color: rgba(78, 205, 196, 0.3);
          box-shadow: var(--fyf-shadow);
        }

        .payment-card.selected {
          border-color: var(--fyf-border-strong);
          box-shadow: 0 16px 32px rgba(78, 205, 196, 0.18);
        }

        .payment-label {
          display: block;
          font-family: var(--fyf-font-display);
          font-size: 18px;
          color: var(--fyf-cream);
          margin-bottom: 0.5rem;
        }

        .payment-helper {
          font-size: 14px;
          color: var(--fyf-muted);
        }

        .confirm-button {
          margin-top: 0.5rem;
          background: var(--fyf-mint);
          color: #041716;
          border: none;
          border-radius: 999px;
          padding: 0.95rem 1.75rem;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease;
        }

        .confirm-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 16px 28px rgba(78, 205, 196, 0.32);
        }

        .confirm-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .confirmation-hint {
          margin: 0;
          font-size: 14px;
          color: var(--fyf-muted);
        }

        .confirmation-card {
          background: rgba(78, 205, 196, 0.1);
          border: 1px solid rgba(78, 205, 196, 0.35);
          border-radius: 22px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .confirmation-card h3 {
          margin: 0;
          font-size: 19px;
          font-family: var(--fyf-font-display);
          color: var(--fyf-cream);
        }

        .confirmation-card p {
          margin: 0;
          font-size: 15px;
          color: var(--fyf-offwhite);
        }

        .confirmation-card ul {
          margin: 0;
          padding-left: 1.1rem;
          color: var(--fyf-muted);
          font-size: 14px;
        }

        .faq-panel {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--fyf-border);
          border-radius: 20px;
          padding: 1.5rem;
        }

        details {
          cursor: pointer;
        }

        summary {
          font-family: var(--fyf-font-display);
          font-size: 18px;
          color: var(--fyf-cream);
          list-style: none;
        }

        summary::marker {
          display: none;
        }

        summary::-webkit-details-marker {
          display: none;
        }

        .faq-body {
          margin-top: 1rem;
          font-size: 15px;
          color: var(--fyf-muted);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-body a {
          color: var(--fyf-mint);
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          .flow-panels {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }

          .cost-panel,
          .payment-panel {
            grid-column: span 6;
          }
        }

        @media (max-width: 768px) {
          .credits-purchase-flow {
            padding: 3rem 1rem;
          }

          .flow-header p {
            font-size: 16px;
          }

          .package-card {
            padding: 1.25rem;
          }

          .cost-panel,
          .payment-panel {
            padding: 1.5rem;
          }
        }

        @media (max-width: 540px) {
          .packages-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }

          dl div {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.4rem;
          }

          .flow-steps {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}
