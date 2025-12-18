'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import LogoutButton from '@/components/LogoutButton'

export default function HeaderNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  
  // Check if we're on the home page
  const isHomePage = pathname === '/'
  
  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
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
        <div className="header-nav-cta" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/user/dashboard" 
                    className="cta-button"
                  >
                    Dashboard
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="cta-button"
                >
                  Login
                </Link>
              )}
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
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
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
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
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
                  <Link 
                    href="/login" 
                    className="mobile-cta-button" 
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
