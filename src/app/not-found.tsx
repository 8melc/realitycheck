export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0A0A0A',
      color: '#FFF8E7',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '900',
        background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '20px'
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#4ECDC4',
        marginBottom: '12px'
      }}>
        Seite nicht gefunden
      </h2>
      <p style={{
        fontSize: '1rem',
        color: '#B8BCC8',
        marginBottom: '30px',
        maxWidth: '400px'
      }}>
        Die gesuchte Seite existiert nicht oder wurde verschoben.
      </p>
      <a 
        href="/"
        style={{
          padding: '12px 24px',
          background: '#FF6B6B',
          color: '#0A0A0A',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          display: 'inline-block'
        }}
      >
        Zur Startseite
      </a>
    </div>
  );
}
