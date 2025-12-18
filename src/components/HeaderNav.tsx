'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useClickOutside } from '@/hooks/useClickOutside'
import { supabase } from '@/lib/supabase/client'
import LogoutButton from '@/components/LogoutButton'
import './HeaderNav.css'

export default function HeaderNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const pathname = usePathname()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  
  // Click outside to close mobile menu
  useClickOutside(mobileMenuRef, () => setIsMobileMenuOpen(false), isMobileMenuOpen, ['.mobile-menu-toggle'])
  
  // Check if we're on the home page
  const isHomePage = pathname === '/'
  
  // Check auth status and fetch profile
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
        
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .single()
            
          if (profile) {
            setDisplayName(profile.display_name)
          }
        }
      } catch (error) {
        setIsAuthenticated(false)
        setDisplayName(null)
      }
    }
    
    checkAuthAndProfile()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', session.user.id)
          .single()
        setDisplayName(profile?.display_name || null)
      } else {
        setDisplayName(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="header-nav">
      <div className="header-nav-container">
        {/* Logo - Links */}
        <div className="header-nav-brand">
          <Link href="/" className="brand-link">
            RealityCheck
          </Link>
        </div>

        {/* Desktop Navigation - Zentriert */}
        <nav className="header-nav-links">
          <Link href="/feedboard" className="nav-link">Guide</Link>
          <Link href="/people" className="nav-link">People</Link>
          <Link href="/access" className="nav-link">Access</Link>
          <Link href="/transparenz" className="nav-link">About us</Link>
        </nav>

        {/* Auth Buttons - Rechts */}
        <div className="header-nav-cta" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              {displayName && (
                <span style={{ color: '#70B1AF', fontSize: '0.875rem', fontWeight: '500' }}>
                  {displayName}
                </span>
              )}
              <Link 
                href="/user/dashboard" 
                className="cta-button"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="cta-button"
                style={{ background: 'transparent', border: '1px solid rgba(78, 205, 196, 0.4)' }}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="cta-button"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        ref={mobileMenuRef}
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
      >
        <div className="mobile-menu-content">
          <div className="mobile-brand">
            <Link href="/" className="mobile-brand-link" onClick={toggleMobileMenu}>
              RealityCheck
            </Link>
          </div>
          <nav className="mobile-nav-links">
            <Link href="/feedboard" className="mobile-nav-link" onClick={toggleMobileMenu}>Guide</Link>
            <Link href="/people" className="mobile-nav-link" onClick={toggleMobileMenu}>People</Link>
            <Link href="/access" className="mobile-nav-link" onClick={toggleMobileMenu}>Access</Link>
            <Link href="/transparenz" className="mobile-nav-link" onClick={toggleMobileMenu}>About us</Link>
          </nav>
          <div className="mobile-cta">
            {isAuthenticated ? (
              <>
                {displayName && (
                  <div style={{ color: '#70B1AF', marginBottom: '8px', fontSize: '0.9rem' }}>
                    {displayName}
                  </div>
                )}
                <Link 
                  href="/user/dashboard" 
                  className="mobile-cta-button" 
                  onClick={toggleMobileMenu}
                >
                  Dashboard
                </Link>
                <div style={{ marginTop: '12px' }}>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <Link 
                  href="/login" 
                  className="mobile-nav-link" 
                  style={{ textAlign: 'center', border: '1px solid rgba(112, 177, 175, 0.3)', borderRadius: '8px', padding: '12px' }}
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="mobile-cta-button" 
                  onClick={toggleMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
