'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getLifeInWeeksDataForUser } from '@/lib/domain/lifeInWeeks';
import type { UserProfile } from '@/lib/types/database.types';
import '../profile.css';

interface ProfileData extends UserProfile {
  primary_goal?: {
    title: string;
  } | null;
}

// Helper function to calculate age from birth_date
function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = (params.slug as string) || '';
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/people/${userId}`, { cache: 'no-store' });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Profil nicht gefunden');
          } else {
            const data = await response.json();
            setError(data.error || 'Fehler beim Laden des Profils');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Fehler beim Laden des Profils');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-shell">
          <p style={{ color: '#B8BCC8', textAlign: 'center', padding: '60px 20px' }}>
            Lade Profil...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-shell">
          <Link href="/people" className="profile-back">
            ← Zurück
          </Link>
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#F08A8F'
          }}>
            <h2 style={{ marginBottom: '12px' }}>Fehler</h2>
            <p>{error || 'Profil nicht gefunden'}</p>
          </div>
        </div>
      </div>
    );
  }

  const lifeData = getLifeInWeeksDataForUser(profile.birth_date, profile.target_age);
  const age = calculateAge(profile.birth_date);
  const yearsLeft = age !== null && profile.target_age ? profile.target_age - age : null;

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <Link href="/people" className="profile-back">
          ← Zurück
        </Link>

        <header className="profile-hero">
          <div className="profile-hero__left">
            <h1 className="profile-name">{profile.display_name || 'Unbekannt'}</h1>
            {age !== null && yearsLeft !== null && (
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem',
                margin: '8px 0'
              }}>
                {age} / {yearsLeft} Jahre übrig
              </p>
            )}
            {lifeData && (
              <div className="life-chip" style={{ marginTop: '12px' }}>
                <span className="life-chip__label">Leben gelebt</span>
                <span className="life-chip__value">{lifeData.percentageLived}%</span>
              </div>
            )}
          </div>
          <div className="profile-hero__right">
            {lifeData && (
              <div className="life-metrics">
                <div className="metric">
                  <div className="metric__label">Wochen gelebt</div>
                  <div className="metric__value">{lifeData.weeksLived.toLocaleString('de-DE')}</div>
                </div>
                <div className="metric">
                  <div className="metric__label">Wochen übrig</div>
                  <div className="metric__value">{lifeData.weeksRemaining.toLocaleString('de-DE')}</div>
                </div>
                {age !== null && yearsLeft !== null && (
                  <div className="metric">
                    <div className="metric__label">Alter / Restjahre</div>
                    <div className="metric__value">
                      {age} / {yearsLeft}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="profile-grid">
          {/* Ziel-Bereich */}
          <section className="card">
            <div className="card__label">Woran diese Person arbeitet</div>
            <p className="card__body">
              {profile.primary_goal?.title || 'Diese Person hat noch kein Ziel definiert.'}
            </p>
          </section>

          {/* Aktueller Fokus */}
          <section className="card">
            <div className="card__label">Aktueller Fokus</div>
            {profile.focus_topic ? (
              <p className="card__body">{profile.focus_topic}</p>
            ) : (
              <p className="card__body" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Kein Fokus definiert.
              </p>
            )}
          </section>

          {/* Leben in Zahlen */}
          {lifeData && (
            <section className="card">
              <div className="card__label">Leben in Zahlen</div>
              <div className="life-grid">
                {age !== null && (
                  <div className="mini-metric">
                    <div className="mini-metric__value">{age}</div>
                    <div className="mini-metric__label">Jahre gelebt</div>
                  </div>
                )}
                {yearsLeft !== null && (
                  <div className="mini-metric">
                    <div className="mini-metric__value">{yearsLeft}</div>
                    <div className="mini-metric__label">Jahre übrig</div>
                  </div>
                )}
                <div className="mini-metric">
                  <div className="mini-metric__value">{lifeData.weeksLived.toLocaleString('de-DE')}</div>
                  <div className="mini-metric__label">Wochen gelebt</div>
                </div>
                <div className="mini-metric">
                  <div className="mini-metric__value">{lifeData.weeksRemaining.toLocaleString('de-DE')}</div>
                  <div className="mini-metric__label">Wochen übrig</div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
