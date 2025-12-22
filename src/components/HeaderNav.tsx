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
    let isMounted = true;
    
    const fetchProfile = async (userId: string, email: string) => {
      try {
        const { data, error, status } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (!isMounted) return;

        if (data?.display_name) {
          setDisplayName(data.display_name);
        } else {
          // Fallback to email prefix if no display name
          setDisplayName(email.split('@')[0]);
        }
      } catch (err) {
        console.error('HeaderNav - Profile fetch error:', err);
        if (isMounted) setDisplayName(email.split('@')[0]);
      }
    };

    const checkAuth = async () => {
      console.log('HeaderNav - Checking auth...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        
        if (!isMounted) return;
        setIsAuthenticated(!!currentUser);
        
        if (currentUser) {
          console.log('HeaderNav - User found:', currentUser.email);
          // Fetch profile in the background, don't block
          fetchProfile(currentUser.id, currentUser.email || '');
        }
      } catch (error) {
        console.error('HeaderNav Unexpected Error:', error);
        if (isMounted) setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('HeaderNav - Auth change:', event);
      if (!isMounted) return;
      
      const user = session?.user || null;
      setIsAuthenticated(!!user);
      
      if (user) {
        fetchProfile(user.id, user.email || '');
      } else {
        setDisplayName(null);
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
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
        <div className="header-nav-cta" style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: 'fit-content' }}>
          {isAuthenticated ? (
            <>
              {displayName && (
                <span className="desktop-only" style={{ color: '#70B1AF', fontSize: '0.875rem', fontWeight: '500' }}>
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link 
                href="/login" 
                className="cta-button"
                style={{ background: 'transparent', border: '1px solid rgba(78, 205, 196, 0.4)', padding: '0.5rem 1.25rem' }}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="cta-button"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Sign Up
              </Link>
            </div>
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
                  <div style={{ color: '#70B1AF', marginBottom: '12px', fontSize: '0.9rem', fontWeight: '500' }}>
                    {displayName}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <Link 
                    href="/user/dashboard" 
                    className="mobile-cta-button" 
                    onClick={toggleMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <div style={{ marginTop: '4px' }}>
                    <LogoutButton />
                  </div>
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
