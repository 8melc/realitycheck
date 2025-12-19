'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import '../profile.css';

type Profile = {
  name: string;
  handle: string;
  bio: string;
  focus: string;
  goal: string;
  life: {
    weeksLived: number;
    weeksRemaining: number;
    percentLived: number;
    age: number;
    yearsLeft: number;
  };
  invested: string[];
  guidePersonality?: string;
};

const profiles: Record<string, Profile> = {
  'melissa-conrads': {
    name: 'Melissa Conrads',
    handle: 'MC',
    bio: 'Ich bin gerne unter Menschen, mir fehlt aber Struktur Social Life & Verpflichtungen unter einen Hut zubekommen.',
    focus: 'Ein Jahr kein Bullshit-Meeting',
    goal: 'Mehr Struktur, weniger Flächenbrand.',
    life: {
      weeksLived: 1480,
      weeksRemaining: 3059,
      percentLived: 33,
      age: 28,
      yearsLeft: 59,
    },
    invested: ['philosophie', 'reisen'],
    guidePersonality: 'wirkung',
  },
};

const fallbackProfile: Profile = {
  name: 'FYF Person',
  handle: 'FYF',
  bio: 'Kurztext fehlt. Ergänze dein Profil, damit der Guide dir relevanter antwortet.',
  focus: 'Aktueller Fokus folgt.',
  goal: 'Setze dein Primärziel in deinem Profil.',
  life: {
    weeksLived: 1000,
    weeksRemaining: 2000,
    percentLived: 33,
    age: 30,
    yearsLeft: 50,
  },
  invested: ['Zeit', 'Fokus'],
  guidePersonality: 'straight',
};

export default function ProfilePage() {
  const params = useParams();
  const slug = (params.slug as string) || '';
  const profile = profiles[slug] || fallbackProfile;

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <Link href="/people" className="profile-back">
          ← Zurück
        </Link>

        <header className="profile-hero">
          <div className="profile-hero__left">
            <div className="profile-handle">{profile.handle}</div>
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-goal">{profile.goal}</p>
            <div className="profile-tags">
              <span className="pill pill-contrast">{profile.focus}</span>
              {profile.guidePersonality && (
                <span className="pill pill-muted">Guide: {profile.guidePersonality}</span>
              )}
            </div>
          </div>
          <div className="profile-hero__right">
            <div className="life-chip">
              <span className="life-chip__label">Leben gelebt</span>
              <span className="life-chip__value">{profile.life.percentLived}%</span>
            </div>
            <div className="life-metrics">
              <div className="metric">
                <div className="metric__label">Wochen gelebt</div>
                <div className="metric__value">{profile.life.weeksLived.toLocaleString('de-DE')}</div>
              </div>
              <div className="metric">
                <div className="metric__label">Wochen übrig</div>
                <div className="metric__value">{profile.life.weeksRemaining.toLocaleString('de-DE')}</div>
              </div>
              <div className="metric">
                <div className="metric__label">Alter / Restjahre</div>
                <div className="metric__value">
                  {profile.life.age} / {profile.life.yearsLeft}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="profile-grid">
          <section className="card">
            <div className="card__label">Über mich</div>
            <p className="card__body">{profile.bio}</p>
          </section>

          <section className="card">
            <div className="card__label">Aktueller Fokus</div>
            <h3 className="card__title">{profile.focus}</h3>
            <p className="card__hint">Keine Motivationsfloskeln – nur Klarheit für die nächsten Wochen.</p>
          </section>

          <section className="card">
            <div className="card__label">Investierte Zeit</div>
            <div className="tags">
              {profile.invested.map((tag) => (
                <span key={tag} className="pill pill-muted">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card__label">Leben in Zahlen</div>
            <div className="life-grid">
              <div className="mini-metric">
                <div className="mini-metric__value">{profile.life.age}</div>
                <div className="mini-metric__label">Jahre gelebt</div>
              </div>
              <div className="mini-metric">
                <div className="mini-metric__value">{profile.life.yearsLeft}</div>
                <div className="mini-metric__label">Jahre übrig</div>
              </div>
              <div className="mini-metric">
                <div className="mini-metric__value">{profile.life.weeksLived}</div>
                <div className="mini-metric__label">Wochen gelebt</div>
              </div>
              <div className="mini-metric">
                <div className="mini-metric__value">{profile.life.weeksRemaining}</div>
                <div className="mini-metric__label">Wochen übrig</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
