'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        alert('Fehler beim Logout: ' + error.message);
        setIsLoggingOut(false);
        return;
      }
      
      // Redirect to login
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout exception:', err);
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="cta-button"
      style={{
        padding: '8px 16px',
        fontSize: '0.875rem',
        opacity: isLoggingOut ? 0.6 : 1,
        cursor: isLoggingOut ? 'not-allowed' : 'pointer',
        background: 'transparent',
        border: '1px solid rgba(112, 177, 175, 0.3)',
        color: '#70B1AF'
      }}
    >
      {isLoggingOut ? 'Logout...' : 'Logout'}
    </button>
  );
}


