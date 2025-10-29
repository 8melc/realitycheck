'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isVoicePlaying, setIsVoicePlaying] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleVoicePlay = () => {
    setIsVoicePlaying(!isVoicePlaying)
    if (isVoicePlaying) {
      // Simulate audio playing
      setTimeout(() => {
        setIsVoicePlaying(false)
      }, 30000) // 30 seconds
    }
  }

  const handleGuideToggle = () => {
    setIsGuideOpen(!isGuideOpen)
  }

  // Close guide popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const guideTip = document.getElementById('guideTip')
      const guidePopup = document.getElementById('guidePopup')
      if (guideTip && guidePopup && !guideTip.contains(e.target as Node) && !guidePopup.contains(e.target as Node)) {
        setIsGuideOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGuideOpen) {
        setIsGuideOpen(false)
      }
      
      if (e.key === 'g' || e.key === 'G') {
        setIsGuideOpen(!isGuideOpen)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isGuideOpen])

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const parallax = document.querySelector('.bg-animation') as HTMLElement
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.3}px)`
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoading) {
    return (
      <>
        <style jsx>{`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0A0A0A;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 1;
            transition: opacity 0.5s ease;
          }

          .loading-overlay.hidden {
            opacity: 0;
            pointer-events: none;
          }

          .loading-text {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2rem;
            font-weight: 900;
            background: linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: loadingPulse 1.5s ease-in-out infinite;
          }

          @keyframes loadingPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
        `}</style>
        <div className="loading-overlay">
          <div className="loading-text">LOADING PROFILE...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --fyf-noir: #0A0A0A;
          --fyf-carbon: #1A1A1A;
          --fyf-charcoal: #2D2D3F;
          --fyf-coral: #FF6B6B;
          --fyf-mint: #4ECDC4;
          --fyf-cream: #FFF8E7;
          --fyf-steel: #B8BCC8;
          --spotify-green: #1DB954;
          --gradient-dark: linear-gradient(135deg, #0A0A0A 0%, #2D2D3F 100%);
          --gradient-coral-mint: linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%);
          --gradient-spotify: linear-gradient(135deg, #1DB954 0%, #191414 100%);
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', -apple-system, sans-serif;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: var(--font-body);
          background: var(--fyf-noir);
          color: var(--fyf-cream);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* Animated Background */
        .bg-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          background: 
              radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
              var(--gradient-dark);
        }

        .noise {
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          opacity: 0.02;
          z-index: 1;
          pointer-events: none;
          background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" /%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" /%3E%3C/svg%3E');
        }

        /* Container */
        .profile-container {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        /* Back Button */
        .back-button {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--fyf-cream);
          padding: 12px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-family: var(--font-display);
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-button:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: var(--fyf-coral);
          color: var(--fyf-coral);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          margin-bottom: 60px;
          text-align: center;
          animation: heroFadeIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Profile Image */
        .profile-image-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin: 0 auto 30px;
        }

        .profile-image {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          object-fit: cover;
          border: 3px solid transparent;
          background: linear-gradient(var(--fyf-carbon), var(--fyf-carbon)) padding-box,
                      var(--gradient-coral-mint) border-box;
          animation: profilePulse 4s ease-in-out infinite;
        }

        @keyframes profilePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .online-indicator {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          background: var(--fyf-mint);
          border: 3px solid var(--fyf-carbon);
          border-radius: 50%;
          animation: onlinePulse 2s ease-in-out infinite;
        }

        @keyframes onlinePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        /* Name & Role */
        .profile-name {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
          background: var(--gradient-coral-mint);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }

        .profile-role {
          font-size: 1.3rem;
          color: var(--fyf-mint);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          margin-bottom: 25px;
        }

        /* Zeit Badge */
        .zeit-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid var(--fyf-coral);
          padding: 10px 24px;
          border-radius: 100px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--fyf-coral);
          margin-bottom: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .zeit-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.2);
          background: rgba(255, 107, 107, 0.15);
        }

        .zeit-countdown {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(255, 107, 107, 0.1);
          animation: zeitProgress 60s linear infinite;
        }

        @keyframes zeitProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Music DNA Section */
        .music-dna {
          background: linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, rgba(25, 20, 20, 0.2) 100%);
          border: 1px solid rgba(29, 185, 84, 0.2);
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }

        .music-dna::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(29, 185, 84, 0.1) 0%, transparent 70%);
          animation: spotifyGlow 8s ease-in-out infinite;
        }

        @keyframes spotifyGlow {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }

        .music-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .spotify-logo {
          color: var(--spotify-green);
          font-size: 2rem;
        }

        .music-match {
          background: var(--gradient-coral-mint);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          font-size: 1.5rem;
        }

        .top-artists {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .artist-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .artist-chip::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: var(--spotify-green);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.5s ease;
          opacity: 0.1;
        }

        .artist-chip:hover::before {
          width: 100%;
          height: 100%;
        }

        .artist-chip:hover {
          transform: translateY(-2px);
          border-color: var(--spotify-green);
          color: var(--fyf-cream);
        }

        .currently-playing {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 12px;
          position: relative;
          z-index: 1;
        }

        .album-art {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
          animation: spin 20s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .currently-playing:hover .album-art {
          animation-play-state: paused;
        }

        .track-info {
          flex: 1;
        }

        .track-name {
          font-weight: 600;
          color: var(--fyf-cream);
          margin-bottom: 3px;
        }

        .artist-name {
          font-size: 0.85rem;
          color: var(--fyf-steel);
        }

        .sound-wave {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 20px;
        }

        .wave-bar {
          width: 3px;
          background: var(--spotify-green);
          border-radius: 3px;
          animation: wave 1s ease-in-out infinite;
        }

        .wave-bar:nth-child(1) { height: 40%; animation-delay: 0s; }
        .wave-bar:nth-child(2) { height: 60%; animation-delay: 0.1s; }
        .wave-bar:nth-child(3) { height: 100%; animation-delay: 0.2s; }
        .wave-bar:nth-child(4) { height: 80%; animation-delay: 0.3s; }
        .wave-bar:nth-child(5) { height: 50%; animation-delay: 0.4s; }

        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }

        /* Voice Introduction */
        .voice-intro {
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.05) 0%, rgba(255, 107, 107, 0.05) 100%);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .voice-wave-container {
          position: relative;
          height: 80px;
          margin: 20px 0;
          cursor: pointer;
        }

        .voice-wave-static {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
        }

        .voice-bar {
          width: 4px;
          background: var(--gradient-coral-mint);
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .voice-bar:nth-child(odd) { height: 30%; }
        .voice-bar:nth-child(even) { height: 60%; }
        .voice-bar:nth-child(3n) { height: 100%; }
        .voice-bar:nth-child(5n) { height: 45%; }
        .voice-bar:nth-child(7n) { height: 80%; }

        .voice-wave-container.playing .voice-bar {
          animation: voiceWave 1s ease-in-out infinite;
        }

        .voice-bar:nth-child(1) { animation-delay: 0s; }
        .voice-bar:nth-child(2) { animation-delay: 0.05s; }
        .voice-bar:nth-child(3) { animation-delay: 0.1s; }
        .voice-bar:nth-child(4) { animation-delay: 0.15s; }
        .voice-bar:nth-child(5) { animation-delay: 0.2s; }
        .voice-bar:nth-child(6) { animation-delay: 0.25s; }
        .voice-bar:nth-child(7) { animation-delay: 0.3s; }
        .voice-bar:nth-child(8) { animation-delay: 0.35s; }
        .voice-bar:nth-child(9) { animation-delay: 0.4s; }
        .voice-bar:nth-child(10) { animation-delay: 0.45s; }
        .voice-bar:nth-child(11) { animation-delay: 0.5s; }
        .voice-bar:nth-child(12) { animation-delay: 0.55s; }
        .voice-bar:nth-child(13) { animation-delay: 0.6s; }
        .voice-bar:nth-child(14) { animation-delay: 0.65s; }
        .voice-bar:nth-child(15) { animation-delay: 0.7s; }
        .voice-bar:nth-child(16) { animation-delay: 0.75s; }
        .voice-bar:nth-child(17) { animation-delay: 0.8s; }
        .voice-bar:nth-child(18) { animation-delay: 0.85s; }
        .voice-bar:nth-child(19) { animation-delay: 0.9s; }
        .voice-bar:nth-child(20) { animation-delay: 0.95s; }

        @keyframes voiceWave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.3); }
        }

        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: rgba(255, 107, 107, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }

        .play-button:hover {
          transform: translate(-50%, -50%) scale(1.1);
          background: var(--fyf-coral);
        }

        .voice-wave-container.playing .play-button {
          opacity: 0;
          pointer-events: none;
        }

        .voice-label {
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--fyf-mint);
          margin-bottom: 10px;
          font-size: 1.1rem;
        }

        .voice-duration {
          font-size: 0.9rem;
          color: var(--fyf-steel);
          margin-top: 10px;
        }

        /* Current Focus Section - Blog-style */
        .current-focus {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.03) 0%, rgba(78, 205, 196, 0.03) 100%);
          border-left: 4px solid var(--fyf-coral);
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }

        .current-focus::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, var(--fyf-coral), var(--fyf-mint));
          border-radius: 12px;
          opacity: 0.05;
          z-index: 0;
        }

        .focus-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .focus-icon {
          font-size: 1.5rem;
        }

        .focus-label {
          font-family: var(--font-display);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--fyf-coral);
          font-weight: 700;
        }

        .focus-content {
          position: relative;
          z-index: 1;
        }

        .focus-topic {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--fyf-cream);
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .focus-description {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--fyf-steel);
        }

        .focus-description em {
          color: var(--fyf-mint);
          font-style: normal;
          font-weight: 600;
        }

        /* Q&A Grid */
        .qa-section {
          margin-bottom: 60px;
        }

        .qa-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .qa-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          position: relative;
        }

        .qa-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--gradient-coral-mint);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .qa-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border-color: rgba(78, 205, 196, 0.3);
        }

        .qa-card:hover::before {
          opacity: 0.03;
        }

        .qa-type-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          color: var(--fyf-mint);
          z-index: 2;
        }

        .qa-media {
          height: 200px;
          overflow: hidden;
          position: relative;
          background: var(--fyf-carbon);
        }

        .qa-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.6s ease;
        }

        .qa-card:hover .qa-media img {
          transform: scale(1.1);
          filter: brightness(1.1);
        }

        .qa-media video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qa-content {
          padding: 20px;
        }

        .qa-question {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--fyf-cream);
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .qa-answer {
          font-size: 0.9rem;
          color: var(--fyf-steel);
          line-height: 1.5;
        }

        /* Mood/Interests Section */
        .interests-section {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
        }

        .interests-title {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--fyf-cream);
          margin-bottom: 20px;
        }

        .interests-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .interest-tag {
          background: rgba(78, 205, 196, 0.1);
          border: 1px solid rgba(78, 205, 196, 0.2);
          padding: 10px 18px;
          border-radius: 100px;
          font-size: 0.9rem;
          color: var(--fyf-mint);
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .interest-tag::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: var(--fyf-mint);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.5s ease;
          opacity: 0.1;
        }

        .interest-tag:hover::before {
          width: 150%;
          height: 150%;
        }

        .interest-tag:hover {
          transform: translateY(-2px);
          color: var(--fyf-cream);
          border-color: var(--fyf-mint);
        }

        /* Time Stats */
        .time-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(78, 205, 196, 0.3);
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          background: var(--gradient-coral-mint);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--fyf-steel);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* CTA Section */
        .cta-section {
          text-align: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(78, 205, 196, 0.05) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%);
          animation: ctaGlow 10s linear infinite;
        }

        @keyframes ctaGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cta-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 10px;
          color: var(--fyf-cream);
          position: relative;
          z-index: 1;
        }

        .cta-subtitle {
          font-size: 1rem;
          color: var(--fyf-steel);
          margin-bottom: 30px;
          position: relative;
          z-index: 1;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .btn-primary {
          padding: 14px 32px;
          background: var(--fyf-coral);
          color: var(--fyf-noir);
          border: 2px solid var(--fyf-coral);
          border-radius: 12px;
          font-family: var(--font-display);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.6s ease;
        }

        .btn-primary:hover::before {
          width: 300%;
          height: 300%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
        }

        .btn-secondary {
          padding: 14px 32px;
          background: transparent;
          color: var(--fyf-mint);
          border: 2px solid var(--fyf-mint);
          border-radius: 12px;
          font-family: var(--font-display);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: var(--fyf-mint);
          color: var(--fyf-noir);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
        }

        /* Guide Tooltip */
        .guide-tip {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background: var(--gradient-coral-mint);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.5rem;
          color: white;
        }

        .guide-tip:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }

        .guide-popup {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 320px;
          background: var(--fyf-carbon);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          opacity: 0;
          pointer-events: none;
          transform: translateY(20px);
          transition: all 0.3s ease;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .guide-popup.visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        .guide-popup-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .guide-avatar {
          width: 40px;
          height: 40px;
          background: var(--gradient-coral-mint);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .guide-name {
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--fyf-cream);
        }

        .guide-message {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--fyf-steel);
          margin-bottom: 15px;
        }

        .guide-message em {
          color: var(--fyf-mint);
          font-style: normal;
          font-weight: 600;
        }

        .guide-actions {
          display: flex;
          gap: 10px;
        }

        .guide-btn {
          flex: 1;
          padding: 8px 16px;
          background: rgba(78, 205, 196, 0.1);
          border: 1px solid rgba(78, 205, 196, 0.3);
          color: var(--fyf-mint);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .guide-btn:hover {
          background: var(--fyf-mint);
          color: var(--fyf-noir);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .profile-container {
            padding: 20px 15px;
          }

          .profile-name {
            font-size: 2.5rem;
          }

          .qa-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .guide-tip {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }

          .guide-popup {
            right: 15px;
            left: 15px;
            width: auto;
          }

          .time-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      {/* Background Effects */}
      <div className="bg-animation"></div>
      <div className="noise"></div>

      {/* Back Button */}
      <Link href="/people" className="back-button">
        <i className="fas fa-arrow-left"></i>
        Zurück zu People
      </Link>

      {/* Main Container */}
      <div className="profile-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="profile-image-container">
            <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=500&auto=format&fit=crop" 
                 alt="Sarah Chen" 
                 className="profile-image" />
            <div className="online-indicator"></div>
          </div>

          <h1 className="profile-name">Sarah Chen</h1>
          <p className="profile-role">Digital Nomad & Krypto Pioneer</p>
          
          <div className="zeit-badge">
            <div className="zeit-countdown"></div>
            <i className="far fa-hourglass-half"></i>
            <span>Noch 32 Sommerurlaube</span>
          </div>
        </section>

        {/* Spotify Music DNA */}
        <section className="music-dna">
          <div className="music-header">
            <i className="fab fa-spotify spotify-logo"></i>
            <div className="music-match">82% Match</div>
          </div>
          
          <div className="top-artists">
            <div className="artist-chip">Moderat</div>
            <div className="artist-chip">FKA twigs</div>
            <div className="artist-chip">James Blake</div>
            <div className="artist-chip">Four Tet</div>
            <div className="artist-chip">Caribou</div>
          </div>

          <div className="currently-playing">
            <img src="https://i.scdn.co/image/ab67616d0000b273a9f6c04ba168640b48aa5795" 
                 alt="Album Art" 
                 className="album-art" />
            <div className="track-info">
              <div className="track-name">A New Error</div>
              <div className="artist-name">Moderat</div>
            </div>
            <div className="sound-wave">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          </div>
        </section>

        {/* Voice Introduction */}
        <section className="voice-intro">
          <div className="voice-label">Sarah's 30-Sekunden Intro</div>
          <div className={`voice-wave-container ${isVoicePlaying ? 'playing' : ''}`} onClick={handleVoicePlay}>
            <div className="voice-wave-static">
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
            </div>
            <div className="play-button">
              <i className={`fas ${isVoicePlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </div>
          </div>
          <div className="voice-duration">0:30 · Über Zeitwohlstand & Remote Work</div>
        </section>

        {/* Current Focus Section */}
        <section className="current-focus">
          <div className="focus-header">
            <span className="focus-icon">💭</span>
            <span className="focus-label">Mein aktuelles Thema</span>
          </div>
          <div className="focus-content">
            <h3 className="focus-topic">Unabhängigkeit – aber nicht finanziell</h3>
            <p className="focus-description">
              Ich merke immer mehr, dass echte Freiheit nicht bedeutet, <em>mehr Geld auf dem Konto</em> zu haben,
              sondern zu erkennen, <em>wo ich mich abhängig gemacht habe</em> – von Erwartungen, von Status,
              von der Meinung anderer. Mich beschäftigt gerade: <em>Wo lebe ich mein Leben für andere?</em>
              Wo habe ich Strukturen geschaffen, die mich einengen, statt mir Raum zu geben?
              Unabhängigkeit ist für mich der Moment, in dem ich <em>selbst entscheide</em>,
              was mir wichtig ist – und nicht das System, die Gesellschaft oder mein Umfeld.
            </p>
          </div>
        </section>

        {/* Time Stats */}
        <section className="time-stats">
          <div className="stat-card">
            <div className="stat-number">5</div>
            <div className="stat-label">Jahre Nomad</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">42</div>
            <div className="stat-label">Länder bereist</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1.2k</div>
            <div className="stat-label">Remote Hours</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">∞</div>
            <div className="stat-label">Zeit-Freiheit</div>
          </div>
        </section>

        {/* Q&A Section */}
        <section className="qa-section">
          <div className="qa-grid">
            {/* Photo Q&A */}
            <div className="qa-card">
              <div className="qa-type-badge">📸 Photo</div>
              <div className="qa-media">
                <img src="https://images.unsplash.com/photo-1519452575417-564c1401ecc0?q=80&w=800&auto=format&fit=crop" 
                     alt="Beach Workspace" />
              </div>
              <div className="qa-content">
                <div className="qa-question">Wo arbeitest du am liebsten?</div>
                <div className="qa-answer">Morgens am Strand, nachmittags im Co-Working. Balance ist alles.</div>
              </div>
            </div>

            {/* Video Q&A */}
            <div className="qa-card">
              <div className="qa-type-badge">🎥 Video</div>
              <div className="qa-media">
                <img src="https://images.unsplash.com/photo-1484807352052-23338990c6c6?q=80&w=800&auto=format&fit=crop" 
                     alt="Workspace Setup" />
              </div>
              <div className="qa-content">
                <div className="qa-question">Dein Setup in 30 Sekunden?</div>
                <div className="qa-answer">Minimalistisch, effizient, überall einsetzbar. Weniger ist mehr.</div>
              </div>
            </div>

            {/* Voice Q&A */}
            <div className="qa-card">
              <div className="qa-type-badge">🎙️ Voice</div>
              <div className="qa-media" style={{background: 'var(--gradient-coral-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div className="sound-wave" style={{transform: 'scale(2)'}}>
                  <div className="wave-bar" style={{background: 'white'}}></div>
                  <div className="wave-bar" style={{background: 'white'}}></div>
                  <div className="wave-bar" style={{background: 'white'}}></div>
                  <div className="wave-bar" style={{background: 'white'}}></div>
                  <div className="wave-bar" style={{background: 'white'}}></div>
                </div>
              </div>
              <div className="qa-content">
                <div className="qa-question">Was bedeutet Freiheit für dich?</div>
                <div className="qa-answer">Hör dir meine Gedanken dazu an - 45 Sekunden pure Ehrlichkeit.</div>
              </div>
            </div>

            {/* Location Q&A */}
            <div className="qa-card">
              <div className="qa-type-badge">📍 Location</div>
              <div className="qa-media">
                <img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop" 
                     alt="Bali Beach" />
              </div>
              <div className="qa-content">
                <div className="qa-question">Aktueller Standort?</div>
                <div className="qa-answer">Canggu, Bali. UTC+8, perfekt für Europa & Asia Calls.</div>
              </div>
            </div>

            {/* Philosophy Q&A */}
            <div className="qa-card">
              <div className="qa-type-badge">💭 Mindset</div>
              <div className="qa-media" style={{background: 'linear-gradient(135deg, var(--fyf-charcoal), var(--fyf-carbon))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'}}>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '3rem', marginBottom: '10px'}}>⏰</div>
                  <div style={{fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--fyf-mint)'}}>Zeit &gt; Geld</div>
                </div>
              </div>
              <div className="qa-content">
                <div className="qa-question">Deine wichtigste Erkenntnis?</div>
                <div className="qa-answer">Zeit ist die einzige Währung, die wirklich zählt. Alles andere ist ersetzbar.</div>
              </div>
            </div>

            {/* Spotify Playlist Q&A */}
            <div className="qa-card">
              <div className="qa-type-badge">🎵 Playlist</div>
              <div className="qa-media" style={{background: 'var(--gradient-spotify)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <i className="fab fa-spotify" style={{fontSize: '4rem', color: 'white'}}></i>
              </div>
              <div className="qa-content">
                <div className="qa-question">Deine Focus-Playlist?</div>
                <div className="qa-answer">"Deep Work Flows" - 4h Electronic, Ambient, Zero Vocals.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Interests Section */}
        <section className="interests-section">
          <h3 className="interests-title">Sarah's Universe</h3>
          <div className="interests-grid">
            <div className="interest-tag">🏝️ Remote Work</div>
            <div className="interest-tag">₿ Bitcoin/DeFi</div>
            <div className="interest-tag">🧘 Mindfulness</div>
            <div className="interest-tag">🏄 Surfing</div>
            <div className="interest-tag">📚 Stoicism</div>
            <div className="interest-tag">🎧 Electronic Music</div>
            <div className="interest-tag">🍃 Sustainability</div>
            <div className="interest-tag">🚀 Web3</div>
            <div className="interest-tag">☕ Coffee Culture</div>
            <div className="interest-tag">🎨 Digital Art</div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2 className="cta-title">Ready to Connect?</h2>
          <p className="cta-subtitle">Sarah hat Zeit für 3 neue Connections diese Woche</p>
          <div className="cta-buttons">
            <button className="btn-primary">
              <i className="fas fa-video"></i> Video Call buchen
            </button>
            <button className="btn-secondary">
              <i className="fas fa-comment"></i> Message starten
            </button>
          </div>
        </section>
      </div>

      {/* Guide Assistant */}
      <div className="guide-tip" id="guideTip" onClick={handleGuideToggle}>G</div>
      <div className={`guide-popup ${isGuideOpen ? 'visible' : ''}`} id="guidePopup">
        <div className="guide-popup-header">
          <div className="guide-avatar">G</div>
          <div className="guide-name">Dein Guide</div>
        </div>
        <div className="guide-message">
          Sarah matcht zu <em>82%</em> mit deinem Profil. Ihr habt <em>3 gemeinsame Interessen</em> 
          und ähnliche Spotify-DNA. Sie ist aktuell in deiner Zeitzone und hat diese Woche noch Kapazität.
        </div>
        <div className="guide-actions">
          <div className="guide-btn">Mehr Details</div>
          <div className="guide-btn">Andere Matches</div>
        </div>
      </div>
    </>
  )
}
