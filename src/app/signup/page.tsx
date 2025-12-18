'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900">RealityCheck</h1>
        <p className="text-center text-gray-600">Erstelle dein Konto</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="deine@email.com"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="Passwort"
            minLength={6}
          />
        </div>
        
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Registrieren'}
        </button>
        
        <div className="text-center">
          <a href="/login" className="text-blue-600 hover:underline text-sm">
            Bereits ein Konto? Einloggen
          </a>
        </div>
      </div>
    </div>
  )
}
