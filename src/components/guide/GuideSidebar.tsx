'use client';

import { useState, useEffect, useRef } from 'react';

const SECTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'actions', label: 'Aktionen' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'zeit-profil', label: 'Zeit-Profil' },
  { id: 'energie-feeds', label: 'Energie-Feeds' },
  { id: 'tageslimit', label: 'Tageslimit' },
  { id: 'filter', label: 'Filter' },
  { id: 'journey', label: 'Journey' },
  { id: 'feedback', label: 'Feedback' },
];

interface GuideSidebarProps {
  activeSection?: string;
}

export default function GuideSidebar({ activeSection }: GuideSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [active, setActive] = useState('intro');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Set up intersection observer for active section highlighting
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId) {
              setActive(sectionId);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-20% 0px -60% 0px',
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('.guide-section');
    sections.forEach(section => {
      if (observerRef.current) {
        observerRef.current.observe(section);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false); // Close mobile menu after click
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="guide-sidebar desktop-only">
        <nav className="guide-sidebar-nav" aria-label="Dashboard Navigation">
          {SECTIONS.map(section => (
            <button
              key={section.id}
              type="button"
              className={`guide-sidebar-item ${active === section.id ? 'active' : ''}`}
              onClick={() => scrollToSection(section.id)}
              aria-current={active === section.id ? 'page' : undefined}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        className="guide-mobile-toggle mobile-only"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
      >
        <span className="guide-hamburger-line" />
        <span className="guide-hamburger-line" />
        <span className="guide-hamburger-line" />
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="guide-mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="guide-sidebar mobile-menu" aria-label="Mobile Dashboard Navigation">
            <nav className="guide-sidebar-nav">
              {SECTIONS.map(section => (
                <button
                  key={section.id}
                  type="button"
                  className={`guide-sidebar-item ${active === section.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                  aria-current={active === section.id ? 'page' : undefined}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
