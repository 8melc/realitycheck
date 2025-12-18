'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { UserProfile, ProfileWithGoal, calculateTimeStats } from '@/types/profile'

// Buchstaben-Avatar Component
function LetterAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
  ];
  
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div className={`${colors[colorIndex]} w-full h-full flex items-center justify-center text-white text-6xl font-bold`}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams()
  const userId = params.slug as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileWithGoal | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true)
        setError(null)

        console.log('Loading profile for userId:', userId)

        const response = await fetch(`/api/people/${userId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data: ProfileWithGoal = await response.json()
        console.log('Profile loaded:', data)
        
        setProfileData(data)
      } catch (err: any) {
        console.error('Profile load error:', err)
        setError(err.message || 'Fehler beim Laden des Profils')
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadProfile()
    }
  }, [userId])

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Lädt Profil...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold mb-4">Profil nicht gefunden</h1>
          <p className="text-gray-400 mb-8">{error || 'Dieses Profil existiert nicht oder ist nicht öffentlich.'}</p>
          <Link 
            href="/people"
            className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
          >
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    )
  }

  // Calculate time stats
  const timeStats = calculateTimeStats(profileData)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Navigation */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/people" className="text-gray-400 hover:text-white transition">
            ← Zurück
          </Link>
          <div className="text-sm text-gray-500">
            {timeStats.percentageLived}% gelebt
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Profile Image & Basic Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Avatar */}
              <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-gray-900">
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt={profileData.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LetterAvatar name={profileData.display_name} />
                )}
              </div>

              {/* Name & Stats */}
              <h1 className="text-3xl font-bold mb-2">{profileData.display_name}</h1>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Wochen gelebt</span>
                  <span className="font-mono">{timeStats.weeksLived.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Wochen übrig</span>
                  <span className="font-mono text-orange-400">{timeStats.weeksRemaining.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Zielalter</span>
                  <span className="font-mono">{profileData.target_age} Jahre</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Guide Persönlichkeit</span>
                  <span className="capitalize">{profileData.guide_personality}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Focus */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Bio Section */}
            {profileData.bio && (
              <section>
                <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Über mich</h2>
                <p className="text-xl leading-relaxed text-gray-300">
                  {profileData.bio}
                </p>
              </section>
            )}

            {/* Current Focus */}
            {profileData.focus_topic && (
              <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Aktueller Fokus</h2>
                <p className="text-2xl font-medium">
                  {profileData.focus_topic}
                </p>
              </section>
            )}

            {/* Primary Goal */}
            {profileData.primary_goal && (
              <section>
                <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Hauptziel</h2>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20">
                  <p className="text-xl font-medium">
                    {profileData.primary_goal.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-2 capitalize">
                    Status: {profileData.primary_goal.status}
                  </p>
                </div>
              </section>
            )}

            {/* Time Visualization */}
            <section>
              <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Leben in Zahlen</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-4xl font-bold mb-2">{timeStats.yearsLived}</div>
                  <div className="text-sm text-gray-400">Jahre gelebt</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-4xl font-bold text-orange-400 mb-2">{timeStats.yearsRemaining}</div>
                  <div className="text-sm text-gray-400">Jahre übrig</div>
                </div>
              </div>
            </section>

            {/* Guide Personality Explanation */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Guide-Persönlichkeit</h2>
              <div className="space-y-3 text-gray-400">
                {profileData.guide_personality === 'straight' && (
                  <p>Direkter, ehrlicher Guide-Stil. Keine Umschweife, klare Ansagen.</p>
                )}
                {profileData.guide_personality === 'provokant' && (
                  <p>Provokanter, herausfordernder Guide-Stil. Hinterfragt Status Quo.</p>
                )}
                {profileData.guide_personality === 'freundlich' && (
                  <p>Freundlicher, unterstützender Guide-Stil. Motivierend und empathisch.</p>
                )}
                {profileData.guide_personality === 'balanced' && (
                  <p>Ausgewogener Guide-Stil. Mix aus Direktheit und Empathie.</p>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}