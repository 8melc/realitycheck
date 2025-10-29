import Link from 'next/link'
import TransparencyGrid from '@/components/TransparencyGrid'
import { transparencyContent } from '@/data/transparencyContent'
import './transparency.css'

export default function Transparenz() {
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
        TRANSPARENZ
      </h1>

      {/* Intro Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '700',
          color: '#FFF8E7',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Transparenz ist kein Feature. Es ist unser System.
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: '#B8BCC8',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Wir geben dir nicht mehr Zeit – wir geben sie dir zurück.
        </p>
      </div>

            {/* Transparency Grid - Compact Lexicon Pattern */}
            <section className="px-6" style={{ padding: '40px clamp(20px, 4vw, 56px) 40px' }}>
              <div className="max-w-7xl mx-auto">
                <TransparencyGrid tiles={transparencyContent.tiles} />
              </div>
            </section>
    </div>
  )
}





