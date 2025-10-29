'use client'

import { useState } from 'react'
import { Person } from '@/types/people'

export default function People() {
  const [people] = useState<Person[]>([
    {
      name: "Sarah Chen",
      bio: "Digital Nomad, Krypto-Pionierin, Weltbürgerin",
      claim: "Freiheit ist tägliche Disziplin.",
      tags: ["Krypto", "Remote Work", "Minimalismus"],
      offer: "Q&A, Lernpfad: Ortsunabhängigkeit starten",
      questions: [
        {
          q: "Was hat dich am meisten gebremst?",
          a: "Die Angst, aus festen Strukturen zu fallen – und dann zu merken, wie wenig es braucht, um frei zu sein."
        }
      ],
      cta: [
        { label: "Frage stellen", action: "openQuestionModal" },
        { label: "Profil anzeigen", url: "/profile" }
      ],
      category: "Brüche",
      isSpotlight: true,
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
    },
    {
      name: "Nico Richter",
      bio: "Pflegekraft, Nachbar, Alltagsmensch",
      claim: "Zeit ist, was ich daraus mache – auch wenn ich wenig davon habe.",
      tags: ["Schichtarbeit", "Resilienz", "Menschlichkeit"],
      offer: "Impulse für Alltagsfokus, Anti-Ausbrennen",
      questions: [
        {
          q: "Was lernst du im Schichtdienst über Zeit?",
          a: "Du musst lernen, Pausen zu feiern – auch, wenn sie nur kurz sind."
        }
      ],
      cta: [
        { label: "Frage stellen", action: "openQuestionModal" }
      ],
      category: "Konventionell",
      profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
    },
    {
      name: "Mila Weber",
      bio: "Gesellschaftskritikerin, Urbanistin, Pragmatikerin",
      claim: "Zeitverschwendung ist politisch.",
      tags: ["Stadtleben", "Ökologie", "Work-Life-Realität"],
      offer: "Mentoring für nachhaltige Alltagsentscheidungen",
      questions: [
        {
          q: "Welchen Fehler macht unsere Gesellschaft beim Umgang mit Zeit?",
          a: "Wir lassen uns Workflows diktieren, statt eigene zu finden."
        }
      ],
      cta: [
        { label: "Frage stellen", action: "openQuestionModal" },
        { label: "Podcast hören", url: "/podcast/mila-weber" }
      ],
      category: "Radikal",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
    },
    {
      name: "Lena Müller",
      bio: "Hackathon-Enthusiastin, Solopreneurin, Zeitforscherin",
      claim: "Weniger multitasken, mehr Zeitwahrnehmung.",
      tags: ["Tech", "Fokus", "Produktivität"],
      offer: "Praktische Zeit-Tipps, Mini-Workshops",
      questions: [
        {
          q: "Dein bester Tipp gegen Zeitzerstreuung?",
          a: "Arbeite in 25-Minuten-Einheiten und mach dann fünf Minuten Pause – wie ein Computer."
        }
      ],
      cta: [
        { label: "Frage stellen", action: "openQuestionModal" },
        { label: "Workshop buchen", url: "/events/lena-mueller" }
      ],
      category: "Konventionell",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
    },
    {
      name: "Carlos Rodrigues",
      bio: "Soziologe, Achtsamkeitslehrer, Aktivist",
      claim: "Zeit ist politische Macht.",
      tags: ["Gesellschaft", "Achtsamkeit", "Aktivismus"],
      offer: "Impulse und Essays, Podcast-Gast",
      questions: [
        {
          q: "Was bedeutet Zeit für dich?",
          a: "Ein gemeinsames Gut, das wir schützen müssen."
        }
      ],
      cta: [
        { label: "Frage stellen", action: "openQuestionModal" },
        { label: "Podcast hören", url: "/podcast/carlos-rodrigues" }
      ],
      category: "Radikal",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
    },
    {
      name: "Mina Kim",
      bio: "Künstlerin, Urban Explorer, Minimalistin",
      claim: "Zeit ist Kunst und Raum zur Selbstfindung.",
      tags: ["Kunst", "Stadt", "Selbstfindung"],
      offer: "Visuelle Storys, Ausstellungen",
      questions: [
        {
          q: "Was inspiriert dich zur Zeitgestaltung?",
          a: "Das Alltägliche neu zu sehen – mit offenen Augen und offenem Geist."
        }
      ],
      cta: [
        { label: "Frage stellen", action: "openQuestionModal" },
        { label: "Mehr entdecken", url: "/stories/mina-kim" }
      ],
      category: "Brüche",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
    }
  ])

  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Get unique tags for filter
  const allTags = Array.from(new Set(people.flatMap(person => person.tags)))

  // Get spotlight profile
  const spotlightProfile = people.find(person => person.isSpotlight)
  const regularProfiles = people.filter(person => !person.isSpotlight)

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Get category styling
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Brüche':
        return {
          borderColor: '#F08A8F',
          borderWidth: '1px',
          background: 'rgba(240, 138, 143, 0.03)'
        }
      case 'Radikal':
        return {
          borderColor: '#70B1AF',
          borderWidth: '1px',
          background: 'rgba(112, 177, 175, 0.03)'
        }
      default: // Konventionell
        return {
          borderColor: 'rgba(87, 110, 109, 0.3)',
          borderWidth: '1px',
          background: 'rgba(255, 255, 255, 0.01)'
        }
    }
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
          FYF empfiehlt dir echte Zeitperspektiven. Keine Role-Models – Orientierung, Widerrede, Umweg. Was inspiriert dich? Was provoziert dich?
        </p>
              </div>

      {/* Editorial Safeguard Band */}
      <div style={{
        background: 'rgba(112, 177, 175, 0.05)',
        border: '1px solid rgba(112, 177, 175, 0.15)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '50px',
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <p style={{
          fontSize: '1rem',
          color: '#70B1AF',
          lineHeight: '1.5',
          margin: '0',
          fontWeight: '500'
        }}>
          FYF schützt Haltung und Privatsphäre. Keine Likes, keine Netzwerke, keine Verkaufsräume – sondern Stimmen, die Zeit neu denken.
        </p>
              </div>

      {/* Tag Filter */}
      <div style={{
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: '8px 16px',
                background: selectedTags.includes(tag) ? '#70B1AF' : 'transparent',
                color: selectedTags.includes(tag) ? '#0A0A0A' : '#B8BCC8',
                border: selectedTags.includes(tag) ? '1px solid #70B1AF' : '1px solid rgba(87, 110, 109, 0.3)',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={() => setSelectedTags([])}
            style={{
              marginTop: '16px',
              padding: '6px 12px',
              background: 'transparent',
              color: '#F08A8F',
              border: '1px solid rgba(240, 138, 143, 0.3)',
              borderRadius: '16px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            Filter zurücksetzen
          </button>
        )}
                </div>

      {/* Spotlight Card */}
      {spotlightProfile && (
        <div style={{
          marginBottom: '60px',
          background: 'rgba(240, 138, 143, 0.05)',
          border: '1px solid #F08A8F',
          borderRadius: '24px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Spotlight Label */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F08A8F',
            color: '#0A0A0A',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '600',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Anti-Vorbild der Woche
              </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr 2fr',
            gap: '40px',
            alignItems: 'start'
          }}>
            {/* Profile Image */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              flexShrink: 0
            }}>
              <img
                src={spotlightProfile.profileImage}
                alt={spotlightProfile.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
                </div>

            {/* Left: Basic Info */}
            <div>
              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '2.2rem',
                fontWeight: '700',
                color: '#FFF8E7',
                marginBottom: '12px',
                lineHeight: '1.2'
              }}>
                {spotlightProfile.name}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#70B1AF',
                fontStyle: 'italic',
                marginBottom: '20px',
                fontWeight: '400',
                lineHeight: '1.4'
              }}>
                {spotlightProfile.bio}
              </p>
              <p style={{
                fontSize: '1.1rem',
                color: '#B8BCC8',
                fontStyle: 'italic',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}>
                "{spotlightProfile.claim}"
              </p>
              
              {/* Tags */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '32px'
              }}>
                {spotlightProfile.tags.map((tag, index) => (
                  <span key={index} style={{
                    background: 'rgba(112, 177, 175, 0.1)',
                    border: '1px solid rgba(112, 177, 175, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
                    color: '#70B1AF',
                    fontWeight: '500'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button style={{
                  padding: '14px 28px',
                  background: '#F08A8F',
                  color: '#0A0A0A',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  Frage stellen
                </button>
                
                {spotlightProfile.cta.filter(cta => cta.action !== 'openQuestionModal').map((cta, ctaIndex) => (
                  <a
                    key={ctaIndex}
                    href={cta.url}
                    style={{
                      padding: '12px 24px',
                      background: 'transparent',
                      color: '#F08A8F',
                      border: '1px solid #F08A8F',
                      borderRadius: '8px',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: '500',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'block'
                    }}
                  >
                    {cta.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Q&A */}
            <div>
              {spotlightProfile.questions.map((qa, index) => (
                <div key={index} style={{ marginBottom: '32px' }}>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: '#FFF8E7',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                  }}>
                    {qa.q}
                  </p>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#B8BCC8',
                    lineHeight: '1.6',
                    paddingLeft: '20px',
                    borderLeft: '2px solid rgba(112, 177, 175, 0.3)'
                  }}>
                    {qa.a}
                  </p>
                </div>
              ))}
            </div>
            </div>
          </div>
        )}

      {/* Regular Profiles Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        marginBottom: '60px'
      }}>
        {regularProfiles.map((person, index) => (
          <div key={index} style={{
            ...getCategoryStyle(person.category),
            border: '1px solid',
            borderRadius: '20px',
            padding: '28px',
            transition: 'all 0.3s ease',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(10px)'
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
            {/* Category Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: person.category === 'Radikal' ? '#70B1AF' : 
                         person.category === 'Brüche' ? '#F08A8F' : 'rgba(87, 110, 109, 0.3)',
              color: person.category === 'Radikal' || person.category === 'Brüche' ? '#0A0A0A' : '#B8BCC8',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: '600',
              fontFamily: 'Space Grotesk, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {person.category}
            </div>

            {/* Profile Image */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              marginBottom: '20px',
              marginTop: '20px'
            }}>
              <img
                src={person.profileImage}
                alt={person.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.3rem',
                fontWeight: '700',
                color: '#FFF8E7',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                {person.name}
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: '#70B1AF',
                fontStyle: 'italic',
                marginBottom: '12px',
                fontWeight: '400',
                lineHeight: '1.4'
              }}>
                {person.bio}
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: '#B8BCC8',
                fontStyle: 'italic',
                lineHeight: '1.4',
                marginBottom: '0'
              }}>
                "{person.claim}"
              </p>
            </div>

            {/* Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '20px'
            }}>
              {person.tags.slice(0, 3).map((tag, tagIndex) => (
                <span key={tagIndex} style={{
                  background: 'rgba(112, 177, 175, 0.08)',
                  border: '1px solid rgba(112, 177, 175, 0.15)',
                  padding: '4px 8px',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  color: '#70B1AF',
                  fontWeight: '500'
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Single Q&A */}
            <div style={{ marginBottom: '24px' }}>
              {person.questions.slice(0, 1).map((qa, qaIndex) => (
                <div key={qaIndex}>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    color: '#FFF8E7',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {qa.q}
                  </p>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#B8BCC8',
                    lineHeight: '1.5',
                    paddingLeft: '12px',
                    borderLeft: '2px solid rgba(112, 177, 175, 0.2)'
                  }}>
                    {qa.a}
                  </p>
              </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button style={{
                padding: '12px 20px',
                background: '#F08A8F',
                color: '#0A0A0A',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}>
                Frage stellen
              </button>
              
              {person.cta.filter(cta => cta.action !== 'openQuestionModal').map((cta, ctaIndex) => (
                <a
                  key={ctaIndex}
                  href={cta.url}
                  style={{
                    padding: '10px 18px',
                    background: 'transparent',
                    color: '#F08A8F',
                    border: '1px solid #F08A8F',
                    borderRadius: '8px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '500',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  {cta.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}