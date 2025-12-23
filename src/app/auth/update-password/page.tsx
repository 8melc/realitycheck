'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../auth.css'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  // Check if we have a valid session/token from password reset link
  useEffect(() => {
    const checkSession = async () => {
      setCheckingSession(true)
      
      // Check if there's a hash fragment (Supabase password reset uses hash fragments)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')

      // If we have a recovery token in the hash, Supabase SSR client will process it
      // Wait for the session to be established
      if (accessToken && type === 'recovery') {
        // Retry a few times to allow Supabase to process the hash fragment
        let attempts = 0
        const maxAttempts = 5
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 300))
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setCheckingSession(false)
            return
          }
          attempts++
        }
      } else {
        // No hash fragment, check for existing session
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Ungültiger oder abgelaufener Link. Bitte fordere einen neuen Reset-Link an.')
      }
      
      setCheckingSession(false)
    }
    
    checkSession()
  }, [])

  const validatePassword = (): boolean => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Das Passwort muss mindestens 8 Zeichen lang sein.')
    }

    if (password !== confirmPassword) {
      errors.push('Die Passwörter stimmen nicht überein.')
    }

    setPasswordErrors(errors)
    return errors.length === 0
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePassword()) {
      setError(passwordErrors[0])
      return
    }

    setLoading(true)

    try {
      // Update password using Supabase
      // Supabase automatically uses the session established from the reset link
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        if (updateError.message.includes('session') || updateError.message.includes('token') || updateError.message.includes('expired')) {
          setError('Ungültiger oder abgelaufener Link. Bitte fordere einen neuen Reset-Link an.')
        } else {
          setError(updateError.message)
        }
        setLoading(false)
        return
      }

      // Sign out after password reset (security best practice)
      await supabase.auth.signOut()
      
      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">RealityCheck</h1>
          
          <div className="auth-success">
            <p>Passwort aktualisiert. Du kannst dich jetzt anmelden.</p>
          </div>

          <Link href="/login" className="auth-button" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            Zum Login
          </Link>
        </div>
      </div>
    )
  }

  if (checkingSession) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">RealityCheck</h1>
          <div className="auth-description">
            Link wird überprüft...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">RealityCheck</h1>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="auth-form">
          <div className="auth-form-group">
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordErrors.length > 0) {
                    validatePassword()
                  }
                }}
                className="auth-input"
                placeholder="Neues Passwort"
                disabled={loading}
                required
              />
              <button 
                type="button" 
                className="auth-password-toggle"
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
            <div className="auth-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (passwordErrors.length > 0) {
                    validatePassword()
                  }
                }}
                className="auth-input"
                placeholder="Passwort bestätigen"
                disabled={loading}
                required
              />
              <button 
                type="button" 
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="auth-hint">Mindestens 8 Zeichen erforderlich</p>
            )}
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="auth-hint">Passwörter stimmen nicht überein</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 8 || password !== confirmPassword}
            className="auth-button"
          >
            {loading ? 'Verarbeite...' : 'Passwort speichern'}
          </button>
        </form>

        <div className="auth-link">
          <Link href="/login">← Zurück zum Login</Link>
        </div>
      </div>
    </div>
  )
}

