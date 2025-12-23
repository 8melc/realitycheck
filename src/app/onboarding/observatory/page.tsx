'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getLifeInWeeksDataForUser } from '@/lib/domain/lifeInWeeks'
import type { UserProfile } from '@/lib/types/database.types'

// Helper function to calculate age from birth_date
function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

interface ProfilePreview {
  display_name: string | null
  birth_date: string | null
  target_age: number | null
  primary_goal?: { title: string } | null
  goal_direction?: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null
}

export default function ObservatoryOnboarding() {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState(0)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfilePreview | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [bio, setBio] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load profile data for preview
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          const rawProfile = data.rawProfile || data.profile
          
          if (rawProfile) {
            setProfile({
              display_name: rawProfile.display_name,
              birth_date: rawProfile.birth_date,
              target_age: rawProfile.target_age,
              primary_goal: data.primaryGoal ? { title: data.primaryGoal.title } : null,
              goal_direction: rawProfile.goal_direction || null,
            })
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleNext = () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/profile/observatory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublic,
          bio: bio.trim() || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Fehler: ${error.error || 'Unbekannter Fehler'}`)
        return
      }

      // Redirect to people page
      router.push('/people')
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Fehler beim Speichern. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#FFF8E7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: '#B8BCC8' }}>Lade...</p>
      </div>
    )
  }

  // Screen 1: Was ist People?
  if (currentScreen === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#FFF8E7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '700',
          marginBottom: '32px',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          People
        </h1>
        
        <div style={{
          fontSize: '1.2rem',
          lineHeight: '1.8',
          color: '#B8BCC8',
          textAlign: 'center',
          marginBottom: '48px',
          maxWidth: '600px'
        }}>
          <p style={{ marginBottom: '24px' }}>
            RealityCheck verbindet Menschen über Zeit.
          </p>
          <p style={{ marginBottom: '24px' }}>
            Im People-Bereich werden Menschen sichtbar<br />
            durch wenige, wesentliche Signale:<br />
            Zeit, Ziel und Fortschritt.
          </p>
          <p>
            Du entscheidest bewusst,<br />
            ob du Teil dieses Bereichs sein möchtest.
          </p>
        </div>

        <button
          onClick={handleNext}
          style={{
            padding: '16px 32px',
            background: '#70B1AF',
            color: '#0A0A0A',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#5A9E9C'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#70B1AF'
          }}
        >
          Weiter
        </button>
      </div>
    )
  }

  // Screen 2: Live Preview
  if (currentScreen === 1) {
    if (!profile || !profile.birth_date || !profile.target_age) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0A0A0A',
          color: '#FFF8E7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}>
          <p style={{ color: '#F08A8F' }}>
            Profil nicht vollständig. Bitte vervollständige zuerst das System-Onboarding.
          </p>
        </div>
      )
    }

    const age = calculateAge(profile.birth_date)
    const yearsLeft = age !== null && profile.target_age ? profile.target_age - age : null
    const lifeData = getLifeInWeeksDataForUser(profile.birth_date, profile.target_age)
    
    const goalText = profile.primary_goal?.title || 
      (profile.goal_direction === 'freedom' ? 'Freiheit' :
       profile.goal_direction === 'clarity' ? 'Klarheit' :
       profile.goal_direction === 'growth' ? 'Wachstum' :
       profile.goal_direction === 'balance' ? 'Balance' :
       profile.goal_direction === 'meaning' ? 'Sinn' : null)

    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#FFF8E7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: '700',
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          So erscheinst du im People-Bereich
        </h1>

        {/* Preview Card */}
        <div style={{
          border: '1px solid rgba(87, 110, 109, 0.3)',
          borderRadius: '20px',
          padding: '28px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '48px'
        }}>
          <h3 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#FFF8E7',
            marginBottom: '12px',
            lineHeight: '1.3'
          }}>
            {profile.display_name || 'Anonym'}
          </h3>

          {age !== null && yearsLeft !== null && (
            <div style={{
              fontSize: '0.95rem',
              color: '#B8BCC8',
              marginBottom: '16px'
            }}>
              {age} / {yearsLeft} Jahre übrig
            </div>
          )}

          {lifeData && (
            <>
              <div style={{
                fontSize: '0.95rem',
                color: '#B8BCC8',
                marginBottom: '16px'
              }}>
                {lifeData.weeksLived.toLocaleString('de-DE')} / {lifeData.weeksRemaining.toLocaleString('de-DE')} Wochen
              </div>

              <div style={{
                fontSize: '0.95rem',
                color: '#B8BCC8',
                marginBottom: '16px'
              }}>
                {lifeData.percentageLived}% gelebt
              </div>
            </>
          )}

          <div style={{ marginBottom: '16px' }}>
            {goalText ? (
              <p style={{
                fontSize: '0.95rem',
                color: '#B8BCC8',
                lineHeight: '1.5',
                margin: 0
              }}>
                {goalText}
              </p>
            ) : (
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(184, 188, 200, 0.5)',
                lineHeight: '1.5',
                margin: 0
              }}>
                Kein Fokus definiert
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleNext}
          style={{
            padding: '16px 32px',
            background: '#70B1AF',
            color: '#0A0A0A',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#5A9E9C'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#70B1AF'
          }}
        >
          Weiter
        </button>
      </div>
    )
  }

  // Screen 3: Entscheidung
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      color: '#FFF8E7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: '700',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        Deine Entscheidung
      </h1>
      
      <p style={{
        fontSize: '1rem',
        color: '#B8BCC8',
        textAlign: 'center',
        marginBottom: '48px'
      }}>
        Du legst fest, ob und wie du im People-Bereich sichtbar bist.
      </p>

      <div style={{
        width: '100%',
        marginBottom: '32px'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          marginBottom: '24px'
        }}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={{
              width: '24px',
              height: '24px',
              cursor: 'pointer'
            }}
          />
          <span style={{
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Im People-Bereich sichtbar sein
          </span>
        </label>
        
        <p style={{
          fontSize: '0.9rem',
          color: '#B8BCC8',
          marginTop: '12px',
          marginBottom: '24px',
          paddingLeft: '40px',
          lineHeight: '1.5'
        }}>
          Im People-Bereich sehen andere Mitglieder dein Profil:<br />
          Name, Alter in Lebenszeit, Zielstatus und – falls angegeben – deine Kurzbeschreibung.
        </p>

        {isPublic && (
          <div style={{ marginTop: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              color: '#B8BCC8',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Kurzbeschreibung für andere (optional · max. 120 Zeichen)
            </label>
            
            <p style={{
              fontSize: '0.85rem',
              color: '#B8BCC8',
              marginBottom: '12px',
              lineHeight: '1.5'
            }}>
              Ein kurzer Satz, der anderen zeigt, wo du gerade stehst.<br />
              Kein Pitch, kein Profiltext – eher ein ehrlicher Status.
            </p>
            
            <textarea
              value={bio}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= 120) {
                  setBio(text)
                }
              }}
              placeholder='z. B.: Ich versuche gerade, meinen Fokus zurückzuholen und bewusster mit meiner Zeit umzugehen.'
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#FFF8E7',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{
              fontSize: '0.85rem',
              color: '#B8BCC8',
              marginTop: '8px',
              textAlign: 'right'
            }}>
              {bio.length}/120
            </div>
          </div>
        )}

        <p style={{
          fontSize: '0.9rem',
          color: '#B8BCC8',
          marginTop: '24px',
          fontStyle: 'italic'
        }}>
          Diese Entscheidung kannst du jederzeit in deinen Profileinstellungen ändern.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          padding: '16px 32px',
          background: submitting ? '#4A7A78' : '#70B1AF',
          color: '#0A0A0A',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: '600',
          fontFamily: 'Space Grotesk, sans-serif',
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: submitting ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!submitting) {
            e.currentTarget.style.background = '#5A9E9C'
          }
        }}
        onMouseLeave={(e) => {
          if (!submitting) {
            e.currentTarget.style.background = '#70B1AF'
          }
        }}
      >
        {submitting ? 'Speichere...' : 'People-Bereich betreten'}
      </button>
    </div>
  )
}

