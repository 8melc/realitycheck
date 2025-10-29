'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function HeaderNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Check if we're on the home page
  const isHomePage = pathname === '/'
  
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

        {/* CTA Button - Rechts */}
        <div className="header-nav-cta">
          <Link 
            href={isHomePage ? "/life-weeks" : "/guide/dashboard"} 
            className="cta-button"
          >
            {isHomePage ? "Start" : "Dashboard"}
          </Link>
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
            <Link 
              href={isHomePage ? "/life-weeks" : "/guide/dashboard"} 
              className="mobile-cta-button" 
              onClick={toggleMobileMenu}
            >
              {isHomePage ? "Start" : "Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
