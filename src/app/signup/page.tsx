'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './signup.css'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) {
        console.error('Auth Error:', authError)
        setError(authError.message)
        setLoading(false)
        return
      }
      
      if (data.user) {
        // Nach Signup immer zu Onboarding, da noch kein Profil existiert
        router.push('/onboarding')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Signup Error:', err)
      setError('Systemfehler bei der Registrierung')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">RealityCheck</h1>
        <p className="signup-subtitle">Erstelle dein Konto</p>
        
        {error && (
          <div className="signup-error">
            {error}
          </div>
        )}
        
        <div className="signup-form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="signup-input"
            placeholder="deine@email.com"
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signup-input"
            placeholder="Passwort"
            minLength={6}
            disabled={loading}
          />
        </div>
        
        <button
          onClick={handleSignup}
          disabled={loading}
          className="signup-button"
          type="button"
        >
          {loading ? 'Konto wird erstellt...' : 'Registrieren'}
        </button>
        
        <div className="signup-footer">
          Bereits ein Konto? <Link href="/login" className="signup-link">Einloggen</Link>
        </div>
      </div>
    </div>
  )
}


