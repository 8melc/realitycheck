'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const limitReached = searchParams.get('limitReached') === '1'
  
  return (
    <main className="min-h-screen bg-fyf-noir flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-4xl font-bold text-fyf-coral">
            FYF
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
          
          <p className="text-fyf-steel text-sm mb-6">
            No traditional account needed. Just enter your birth date.
          </p>
          
          <form className="space-y-4">
            <div>
              <label className="block text-fyf-steel mb-2">Birth Date</label>
              <input
                type="date"
                className="w-full bg-fyf-carbon border border-fyf-smoke text-fyf-cream px-4 py-3 rounded-lg focus:border-fyf-coral focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-fyf-steel mb-2">Life Expectancy (optional)</label>
              <input
                type="number"
                min="18"
                max="120"
                className="w-full bg-fyf-carbon border border-fyf-smoke text-fyf-cream px-4 py-3 rounded-lg focus:border-fyf-coral focus:outline-none"
                placeholder="e.g. 80"
              />
              <p className="text-fyf-steel text-xs mt-1">
                Default: 80 years
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-fyf-coral hover:bg-fyf-coral-dark text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Visualize Time
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