'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to ziel settings as default
    router.replace('/user/settings/ziel');
  }, [router]);

  return (
    <div className="settings-main-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--rc-mint)] mx-auto"></div>
      <p style={{ color: '#B8BCC8', marginTop: '10px' }}>Weiterleitung...</p>
    </div>
  );
}
