'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './login.css'

export default function Login() {
  const [email, setEmail] = useState('melissa@test.com')
  const [password, setPassword] = useState('RealityCheck123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showManualLink, setShowManualLink] = useState(false)
  const router = useRouter()

  // Timer für manuellen Link-Fallback
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => setShowManualLink(true), 3000);
    } else {
      setShowManualLink(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Falls schon eingeloggt, direkt zum Feedboard
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('Session aktiv, leite weiter...');
        router.push('/user/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async () => {
    console.log('--- LOGIN START ---');
    console.log('Email:', email);
    setLoading(true)
    setError('')
    
    try {
      console.log('Rufe Supabase Auth auf...');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('Supabase Login Response:', { data, authError });
      
      if (authError) {
        console.error('Auth Error Details:', authError);
        setError(authError.message)
        setLoading(false)
        return
      }
      
      if (data.user) {
        console.log('User ID:', data.user.id);
        console.log('Login erfolgreich - leite direkt weiter');
        
        // Direkter Redirect ohne Umwege
        router.push('/user/dashboard');
        router.refresh();
      } else {
        console.warn('Kein User-Objekt zurückgegeben');
        setError('Login fehlgeschlagen: Kein User gefunden.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('CRITICAL LOGIN ERROR:', err);
      setError('Systemfehler: ' + (err.message || 'Unbekannter Fehler'))
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">RealityCheck</h1>
        
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {loading && (
          <div className="login-hints" style={{ border: '1px solid var(--realitycheck-mint)', color: 'var(--realitycheck-mint)' }}>
            <p>Verbindung wird hergestellt...</p>
            {showManualLink && (
              <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Falls keine automatische Weiterleitung erfolgt: 
                <a onClick={() => {
                  const target = '/feedboard';
                  router.push(target);
                  router.refresh();
                }} style={{ textDecoration: 'underline', marginLeft: '5px', cursor: 'pointer' }}>Hier klicken</a>
              </p>
            )}
          </div>
        )}
        
        <div className="login-form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="Email Adresse"
            disabled={loading}
          />
          <div className="login-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="Passwort"
              disabled={loading}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          <div className="login-forgot-password">
            <Link href="/auth/reset-password">Passwort vergessen?</Link>
          </div>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Verarbeite...' : 'Einloggen'}
        </button>
        
        <div className="login-hints">
          <p><strong>Melissa:</strong> melissa@test.com / RealityCheck123</p>
          <p><strong>Demo:</strong> melissa.conrads@realitycheck.com / demo123!</p>
        </div>
      </div>
    </div>
  )
}
