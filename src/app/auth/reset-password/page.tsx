'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../auth.css'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const redirectTo = `${window.location.origin}/auth/update-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      // Always show success message (security: no email enumeration)
      // Supabase always returns success to prevent email enumeration
      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
      setLoading(false)
    }
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

        {success ? (
          <div className="auth-success">
            <p>Wenn die Mail existiert, hast du gerade einen Link erhalten.</p>
            <p className="auth-success-note">Bitte überprüfe dein E-Mail-Postfach.</p>
          </div>
        ) : (
          <>
            <p className="auth-description">
              Wir senden dir einen Link, um dein Passwort zurückzusetzen.
            </p>

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="auth-form-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="E-Mail-Adresse"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading ? 'Verarbeite...' : 'Reset-Link senden'}
              </button>
            </form>
          </>
        )}

        <div className="auth-link">
          <Link href="/login">← Zurück zum Login</Link>
        </div>
      </div>
    </div>
  )
}

