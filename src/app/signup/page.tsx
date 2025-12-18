'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Auth Error:', error)
      setError(error.message)
      setLoading(false)
      return
    }
    
    if (data.user) {
      // Nach Signup immer zu Onboarding, da noch kein Profil existiert
      router.push('/onboarding')
    }
    
    setLoading(false)
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
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signup-input"
            placeholder="Passwort"
            minLength={6}
          />
        </div>
        
        <button
          onClick={handleSignup}
          disabled={loading}
          className="signup-button"
        >
          {loading ? 'Konto wird erstellt...' : 'Registrieren'}
        </button>
        
        <div className="signup-footer">
          Bereits ein Konto? <a href="/login" className="signup-link">Einloggen</a>
        </div>
      </div>
    </div>
  )
}
