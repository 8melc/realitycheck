'use client';

import { useEffect, useState } from 'react';

const CONSENT_COOKIE = 'fyf-cookie-consent';
const LIFE_WEEKS_COOKIE = 'fyf-life-weeks';
const CONSENT_MAX_AGE_DAYS = 180;

type ConsentStatus = 'accepted' | 'declined';

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (name: string, value: string, days = CONSENT_MAX_AGE_DAYS) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncWithCookie = () => {
      const consent = readCookie(CONSENT_COOKIE);
      setVisible(!consent);
    };

    syncWithCookie();

    if (typeof window === 'undefined') return;

    window.addEventListener('fyf-cookie-consent-change', syncWithCookie);
    window.addEventListener('focus', syncWithCookie);
    window.addEventListener('visibilitychange', syncWithCookie);

    return () => {
      window.removeEventListener('fyf-cookie-consent-change', syncWithCookie);
      window.removeEventListener('focus', syncWithCookie);
      window.removeEventListener('visibilitychange', syncWithCookie);
    };
  }, []);

  const handleConsent = (status: ConsentStatus) => {
    writeCookie(CONSENT_COOKIE, status);
    if (status === 'declined') {
      deleteCookie(LIFE_WEEKS_COOKIE);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('fyf-cookie-consent-change'));
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 mb-6 max-w-2xl rounded-2xl border border-white/10 bg-fyf-carbon/95 p-6 shadow-2xl">
        <div className="space-y-4 text-left">
          <h2 className="font-righteous text-xl text-fyf-cream">Cookies &amp; lokale Speicherung</h2>
          <p className="font-roboto-mono text-sm leading-relaxed text-fyf-steel">
            Wir verwenden funktionale Cookies, um deine Eingaben auf der „Life in Weeks“-Seite zu speichern.
            Ohne deine Zustimmung werden keine Daten abgelegt. Weitere Informationen findest du in unserer{' '}
            <a href="/transparenz" className="text-fyf-mint underline-offset-2 hover:underline">
              Transparenz &amp; Datenschutz
            </a>
            .
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => handleConsent('declined')}
              className="w-full rounded-full border border-fyf-steel/60 px-6 py-3 font-roboto-mono text-sm uppercase tracking-[0.08em] text-fyf-steel transition hover:border-fyf-steel hover:text-fyf-cream sm:w-auto"
            >
              Nur notwendige Cookies
            </button>
            <button
              onClick={() => handleConsent('accepted')}
              className="w-full rounded-full bg-fyf-mint px-6 py-3 font-righteous text-base uppercase tracking-[0.08em] text-fyf-noir transition hover:bg-fyf-mint/90 sm:w-auto"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
