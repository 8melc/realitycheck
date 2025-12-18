'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLifeInWeeksDataForUser } from '@/lib/domain/lifeInWeeks'
import type { UserProfile } from '@/lib/types/database.types'

interface PeopleProfile extends UserProfile {
  avatar_url?: string
  timeFacts?: {
    weeksRemaining: number
    percentageLived: number
    remainingSummers: number
  }
}

export default function People() {
  const [people, setPeople] = useState<PeopleProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch('/api/people')
        
        // Try to parse JSON, but handle errors gracefully
        let data: any = {}
        try {
          const text = await response.text()
          data = text ? JSON.parse(text) : {}
        } catch (parseError) {
          console.error('People API - Failed to parse response as JSON:', parseError)
          setError(`Server error: ${response.status} ${response.statusText}`)
          setLoading(false)
          return
        }
        
        if (!response.ok) {
          // Try to get raw response body for debugging
          let errorText = ''
          try {
            const clonedResponse = response.clone()
            errorText = await clonedResponse.text()
          } catch (e) {
            console.warn('Could not read response body:', e)
          }
          
          console.error('People API error response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries()),
            data,
            hasData: !!data,
            errorKey: data?.error,
            detailsKey: data?.details,
            rawBody: errorText || '(empty)'
          })
          
          // Try to extract meaningful error message
          let errorMessage = `Failed to fetch people (${response.status})`
          if (data?.error) {
            errorMessage = data.error
          } else if (data?.details) {
            errorMessage = data.details
          } else if (errorText) {
            try {
              const parsedError = JSON.parse(errorText)
              errorMessage = parsedError.error || parsedError.details || errorText
            } catch {
              errorMessage = errorText.substring(0, 200) // Limit length
            }
          }
          
          setError(errorMessage)
          setLoading(false)
          return
        }
        
        if (data.error) {
          console.error('People API returned error in data:', data)
          setError(data.error || data.details || 'Failed to load people')
          setLoading(false)
          return
        }
        
        // Debug: Log what we received
        console.log('People Page - Received data:', {
          success: data.success,
          count: data.count,
          profilesLength: data.profiles?.length || 0,
          firstProfile: data.profiles?.[0] || null
        })
        
        // Berechne Zeit-Fakten für jedes Profil
        const profilesWithFacts: PeopleProfile[] = (data.profiles || []).map((profile: UserProfile) => {
          const lifeData = getLifeInWeeksDataForUser(
            profile.birth_date,
            profile.target_age
          )
          
          return {
            ...profile,
            timeFacts: lifeData ? {
              weeksRemaining: lifeData.weeksRemaining,
              percentageLived: lifeData.percentageLived,
              remainingSummers: lifeData.remainingSummers,
            } : undefined,
          }
        })
        
        console.log('People Page - Processed profiles:', profilesWithFacts.length)
        setPeople(profilesWithFacts)
      } catch (err: any) {
        console.error('Error fetching people:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        })
        setError(err.message || 'Failed to load people')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPeople()
  }, [])

  if (loading) {
    return (
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '60px 20px 40px',
        background: '#0A0A0A',
        color: '#FFF8E7',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        <p style={{ color: '#B8BCC8' }}>Lade Profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '60px 20px 40px',
        background: '#0A0A0A',
        color: '#FFF8E7',
        minHeight: '100vh'
      }}>
        <div style={{
          background: 'rgba(240, 138, 143, 0.1)',
          border: '1px solid #F08A8F',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#F08A8F',
            marginBottom: '12px'
          }}>
            Fehler beim Laden der Profile
          </h2>
          <p style={{
            color: '#B8BCC8',
            marginBottom: '12px',
            lineHeight: '1.6'
          }}>
            {error}
          </p>
          <p style={{
            color: '#70B1AF',
            fontSize: '0.9rem',
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(112, 177, 175, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(112, 177, 175, 0.2)'
          }}>
            <strong>Hinweis:</strong> Falls du "RLS policy" oder "permission denied" siehst, 
            müssen die Row Level Security Policies in Supabase angepasst werden, 
            damit alle Profile öffentlich lesbar sind.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '60px 20px 40px',
      background: '#0A0A0A',
      color: '#FFF8E7',
      minHeight: '100vh'
    }}>
      {/* Title */}
      <h1 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 'clamp(4rem, 8vw, 7rem)',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        background: 'linear-gradient(90deg, #F08A8F 0%, #70B1AF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        PEOPLE
      </h1>

      {/* Editorial Intro */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '700',
          color: '#FFF8E7',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Perspektive ist Kapital.
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: '#B8BCC8',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Echte Zeitperspektiven. Keine Role-Models – Orientierung, Widerrede, Umweg.
        </p>
      </div>

      {/* People List */}
      {people.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#B8BCC8'
        }}>
          <p>Noch keine Profile vorhanden.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px',
          marginBottom: '60px'
        }}>
          {people.map((person) => (
            <Link
              key={person.user_id}
              href={`/people/profile/${person.user_id}`}
              style={{
                textDecoration: 'none',
                display: 'block'
              }}
            >
              <div
                style={{
                  border: '1px solid rgba(87, 110, 109, 0.3)',
                  borderRadius: '20px',
                  padding: '28px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  background: 'var(--gradient-coral-mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {person.avatar_url ? (
                    <img 
                      src={person.avatar_url} 
                      alt={person.display_name || ''} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (person.display_name || 'U').substring(0, 1)
                  )}
                </div>

                {/* Name */}
                <h3 style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#FFF8E7',
                  marginBottom: '8px',
                  lineHeight: '1.3'
                }}>
                  {person.display_name || 'Unbekannt'}
                </h3>

                {/* Focus Topic */}
                {person.focus_topic && (
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#70B1AF',
                    fontWeight: '600',
                    marginBottom: '12px',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }}>
                    {person.focus_topic}
                  </div>
                )}

                {/* Bio */}
                {person.bio && (
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#B8BCC8',
                    lineHeight: '1.5',
                    marginBottom: '20px',
                    display: '-webkit-box',
                    WebkitLineClamp: '3',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {person.bio}
                  </p>
                )}

              {/* Zeit-Fakten */}
              {person.timeFacts && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginTop: '20px'
                }}>
                  <div style={{
                    padding: '12px',
                    background: 'rgba(112, 177, 175, 0.1)',
                    border: '1px solid rgba(112, 177, 175, 0.2)',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#70B1AF',
                      marginBottom: '4px'
                    }}>
                      {person.timeFacts.weeksRemaining.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#B8BCC8'
                    }}>
                      Wochen übrig
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: 'rgba(240, 138, 143, 0.1)',
                    border: '1px solid rgba(240, 138, 143, 0.2)',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#F08A8F',
                      marginBottom: '4px'
                    }}>
                      {person.timeFacts.percentageLived}%
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#B8BCC8'
                    }}>
                      gelebt
                    </div>
                  </div>

                  {person.timeFacts.remainingSummers > 0 && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        color: '#FFF8E7',
                        marginBottom: '4px'
                      }}>
                        {person.timeFacts.remainingSummers}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#B8BCC8'
                      }}>
                        Sommer übrig
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Guide Personality */}
              {person.guide_personality && (
                <div style={{
                  marginTop: '20px',
                  padding: '8px 12px',
                  background: 'rgba(112, 177, 175, 0.08)',
                  border: '1px solid rgba(112, 177, 175, 0.15)',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  color: '#70B1AF',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {person.guide_personality}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  )
}
