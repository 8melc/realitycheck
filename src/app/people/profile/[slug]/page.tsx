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
  goal_direction?: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null;
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
            <h1 className="profile-name">{profile.display_name || 'Anonym'}</h1>
            {age !== null && yearsLeft !== null && (
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem',
                margin: '8px 0'
              }}>
                {age} / {yearsLeft} Jahre übrig
              </p>
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
                {lifeData && (
                  <div className="metric">
                    <div className="metric__label">Gelebt</div>
                    <div className="metric__value">{lifeData.percentageLived}%</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="profile-grid">
          {/* Ziel / Fokus */}
          <section className="card">
            <div className="card__label">Fokus</div>
            {(() => {
              const goalText = profile.primary_goal?.title || 
                (profile.goal_direction === 'freedom' ? 'Freiheit' :
                 profile.goal_direction === 'clarity' ? 'Klarheit' :
                 profile.goal_direction === 'growth' ? 'Wachstum' :
                 profile.goal_direction === 'balance' ? 'Balance' :
                 profile.goal_direction === 'meaning' ? 'Sinn' : null)
              
              return goalText ? (
                <p className="card__body">{goalText}</p>
              ) : (
                <p className="card__body" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Kein Fokus definiert
                </p>
              )
            })()}
          </section>
        </div>
      </div>
    </div>
  );
}
