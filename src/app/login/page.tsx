'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('testdemo@test.com')
  const [password, setPassword] = useState('demo123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    
    const { data, error } = await supabase.auth.signInWithPassword({
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
      // Check ob user_profile existiert
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      
      if (profile) {
        router.push('/user/dashboard')  // Profil existiert → Dashboard
      } else {
        router.push('/onboarding')      // Kein Profil → Onboarding
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900">RealityCheck</h1>
        
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
            placeholder="testdemo@test.com"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="demo123!"
          />
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
        
        <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-xl">
          testdemo@test.com / demo123!
        </div>
      </div>
    </div>
  )
}
