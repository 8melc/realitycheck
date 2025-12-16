'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const limitReached = searchParams.get('limitReached') === '1'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      
      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }
  
  return (
    <main className="min-h-screen bg-fyf-noir flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-4xl font-bold text-fyf-coral">
            RealityCheck
          </Link>
          <p className="text-fyf-steel mt-2">Welcome back</p>
        </div>

        {/* Limit Reached Banner */}
        {limitReached && (
          <div className="mb-6 p-4 rounded-lg border border-fyf-coral bg-fyf-coral/10">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-fyf-coral flex items-center justify-center">
                <span className="text-fyf-noir text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="text-fyf-coral font-semibold text-sm mb-1">
                  Daily limit reached
                </h3>
                <p className="text-fyf-steel text-xs">
                  Your limit resets daily at midnight. You can start again tomorrow.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-fyf-charcoal p-8 rounded-xl border border-fyf-smoke">
          <h1 className="font-display text-2xl font-bold mb-6 text-fyf-cream">
            Sign In
          </h1>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-fyf-coral/10 border border-fyf-coral text-fyf-coral text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-fyf-steel mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-fyf-carbon border border-fyf-smoke text-fyf-cream px-4 py-3 rounded-lg focus:border-fyf-coral focus:outline-none"
                placeholder="test@test.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-fyf-steel mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-fyf-carbon border border-fyf-smoke text-fyf-cream px-4 py-3 rounded-lg focus:border-fyf-coral focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fyf-coral hover:bg-fyf-coral-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-fyf-steel text-sm">
              <Link href="/" className="text-fyf-mint hover:text-fyf-mint-dark">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}