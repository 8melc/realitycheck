'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await fetch('/api/profile/credits');
        if (response.ok) {
          const data = await response.json();
          setCredits(data.balance || 0);
        }
      } catch (error) {
        console.error('[CreditsDisplay] Error loading credits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCredits();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--rc-steel, #9ca3af)',
        fontSize: '0.875rem'
      }}>
        <span>Credits: ...</span>
      </div>
    );
  }

  return (
    <Link 
      href="/user/settings/credits"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--rc-mint, #4ecdc4)',
        fontSize: '0.875rem',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'opacity 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      <span>Credits:</span>
      <span style={{ fontWeight: '700', color: 'var(--rc-mint, #4ecdc4)' }}>
        {credits !== null ? credits : 0}
      </span>
    </Link>
  );
}

