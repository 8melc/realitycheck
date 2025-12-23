'use client'

export default function CompletionStep() {
  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group" style={{ 
          textAlign: 'center', 
          maxWidth: '600px', 
          margin: '0 auto',
          paddingTop: '2rem'
        }}>
          <h1 className="step-title" style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
            fontWeight: 700, 
            marginBottom: '1rem',
            color: 'var(--rc-cream, #f3efe8)'
          }}>
            Dein Profil ist fast vollständig eingerichtet
          </h1>

          <p className="step-subtitle" style={{ 
            fontSize: '1rem', 
            marginBottom: '2rem',
            color: 'var(--rc-steel, #9ca3af)',
            lineHeight: '1.6'
          }}>
            Ab jetzt beginnt die eigentliche Arbeit. Dein Guide nutzt dein Ziel und deine Einstellungen, um dich im Alltag zu begleiten – nicht zu motivieren, sondern wach zu halten.
          </p>
        </div>
      </div>
    </div>
  )
}

