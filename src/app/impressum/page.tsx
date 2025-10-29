import Link from 'next/link'
import './impressum.css'

export default function Impressum() {
  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '60px 20px 40px',
      background: '#0A0A0A',
      color: '#FFF8E7',
      minHeight: '100vh'
    }}>

      {/* Title */}
      <h1 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 'clamp(4rem, 8vw, 7rem)',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        IMPRESSUM
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '1.25rem',
        textAlign: 'center',
        marginBottom: '60px',
        color: '#B8B8B8',
        fontFamily: 'Inter, sans-serif'
      }}>
        Angaben gemäß § 5 TMG
      </p>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.8',
        fontSize: '1.1rem'
      }}>
        
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4ECDC4',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Verantwortlicher Dienstanbieter
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Verantwortlicher Dienstanbieter i.S.v. § 5 DDG (ehem. TMG) für die gannaca GmbH & Co. KG ist
          </p>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(78, 205, 196, 0.2)',
            marginBottom: '20px'
          }}>
            <p style={{ marginBottom: '8px', fontWeight: '600' }}>Herr Christopher Patrick Peterka</p>
            <p style={{ marginBottom: '8px' }}>Geschäftsführer</p>
            <p style={{ marginBottom: '8px' }}>gannaca GmbH & Co. KG</p>
            <p style={{ marginBottom: '8px' }}>Luftschiff-Platz 26</p>
            <p style={{ marginBottom: '8px' }}>50733 Köln</p>
            <p style={{ marginBottom: '8px' }}>Deutschland</p>
            <p style={{ marginBottom: '8px' }}>
              Tel.: <a href="tel:+4916092269672" style={{ color: '#4ECDC4', textDecoration: 'none' }}>+49 160 922 696 72</a>
            </p>
            <p style={{ marginBottom: '8px' }}>
              E-Mail: <a href="mailto:peterka@gannaca.com" style={{ color: '#4ECDC4', textDecoration: 'none' }}>peterka@gannaca.com</a>
            </p>
            <p>
              Website: <a href="https://www.gannaca.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#4ECDC4', textDecoration: 'none' }}>www.gannaca.com</a>
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4ECDC4',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Hinweis zur Marke „RealityCheck"
          </h2>
          <p style={{ marginBottom: '16px' }}>
            RealityCheck ist eine eingetragene Marke der gannaca GmbH & Co. KG.
          </p>
          <p>
            Betreiberin dieser Website ist die gannaca GmbH & Co. KG.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4ECDC4',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Registereintragungen
          </h2>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(78, 205, 196, 0.2)'
          }}>
            <p style={{ marginBottom: '8px' }}>gannaca GmbH & Co. KG</p>
            <p style={{ marginBottom: '8px' }}>Amtsgericht Köln HRA 23235</p>
            <p style={{ marginBottom: '8px' }}>Komplementärin: gannaca Verwaltungs GmbH</p>
            <p>Amtsgericht Köln HRB 56092</p>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4ECDC4',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Umsatzsteuer-ID
          </h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:
          </p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#4ECDC4',
            marginTop: '8px'
          }}>
            DE814575529
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4ECDC4',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Sonstige Angaben
          </h2>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(78, 205, 196, 0.2)'
          }}>
            <p style={{ marginBottom: '8px' }}>Sitz der Gesellschaft: Köln</p>
            <p style={{ marginBottom: '8px' }}>Geschäftsführer: Christopher P. Peterka</p>
            <p style={{ marginBottom: '8px' }}>Copyright: © gannaca GmbH & Co. KG 2002–2025</p>
            <p>Alle Rechte vorbehalten.</p>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4ECDC4',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Rechtlicher Hinweis
          </h2>
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 107, 107, 0.3)'
          }}>
            <p style={{ marginBottom: '16px' }}>
              Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Als Diensteanbieter ist die gannaca GmbH & Co. KG gemäß § 7 Abs. 1 DDG (ehemals TMG) i.V.m. Art. 4 bis 8 DSA [VO (EU) 2022/2065] für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Alle veröffentlichten Informationen sind durch die gannaca GmbH & Co. KG autorisiert.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Die Rechte für das verwendete Bild- und Filmmaterial liegen bei der gannaca GmbH & Co. KG.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Layout und Gestaltung dieser Präsentation sowie die enthaltenen Informationen sind gemäß dem Urheberrechtsgesetz geschützt.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Eingetragene und nicht eingetragene Warenzeichen der gannaca GmbH & Co. KG oder Dritter dürfen ohne vorherige schriftliche Zustimmung nicht in Werbematerialien oder anderen Veröffentlichungen verwendet werden.
            </p>
            <p>
              Alle Angaben erfolgen ohne Gewähr. Eine Haftung für Schäden, die sich aus der Verwendung der veröffentlichten Inhalte ergeben, ist ausgeschlossen.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4ECDC4',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Weitere rechtliche Informationen
          </h2>
          <p>
            Hier finden Sie unsere{' '}
            <a 
              href="https://www.gannaca.de/agb" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#4ECDC4', 
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              AGB
            </a>
            {' '}und{' '}
            <a 
              href="https://www.realitycheck.de/datenschutz" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#4ECDC4', 
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Datenschutzerklärung
            </a>
            .
          </p>
        </section>

      </div>
    </div>
  )
}
