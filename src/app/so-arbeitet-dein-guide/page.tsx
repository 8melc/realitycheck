'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TransparencyWidget from '@/components/dashboard/TransparencyWidget';
import { useGuideStore } from '@/stores/guideStore';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/database.types';

// Philosophy and Lifestyle options (matching dashboard)
const philosophyOptions = [
  { value: 'dividende', label: 'Zeit als Dividende', description: 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.' },
  { value: 'wirkung', label: 'Wirkung statt Erledigung', description: 'Für mich zählt Wirkung, nicht nur Erledigungen – meine Zeit soll Sinn stiften.' },
  { value: 'limitiert', label: 'Bewusste Limitierung', description: 'Jede Stunde ist limitiert – ich will sie bewusst gegen das eintauschen, was zählt.' },
  { value: 'balance', label: 'Kalender-Depot Balance', description: 'Ich will mein Kalender-Depot so balancieren, dass Flow, Pause und Wachstum sich abwechseln.' },
  { value: 'no-waste', label: 'Keine Zeitverschwendung', description: 'Zeitverschwendung ist für mich das Einzige, was ich mir wirklich nie leisten will.' },
];

const lifestyleOptions = [
  { value: 'digital-nomad', label: 'Digital Nomad', description: 'Arbeite, wo du gerade bist.' },
  { value: 'remote-worker', label: 'Remote Worker', description: 'Homeoffice ist mein Orbit.' },
  { value: 'office-player', label: 'Office Player', description: '9-to-5, aber meinen Regeln.' },
  { value: 'hybrid', label: 'Hybrid', description: 'Stadt und Rückzug im Wechsel.' },
  { value: 'creator', label: 'Creator', description: 'Ich kreiere, Fokus ist fluide.' },
  { value: 'sidepreneur', label: 'Sidepreneur', description: 'Mehrere Projekte, voller Drive.' },
  { value: 'explorer', label: 'Explorer', description: 'Ich teste ständig neue Routinen.' },
  { value: 'caretaker', label: 'Caretaker', description: 'Ich halte andere am Laufen.' },
  { value: 'teamplayer', label: 'Teamplayer', description: 'Ich tanke Energie im Miteinander.' },
  { value: 'rebel', label: 'Rebel', description: 'Kein klassisches Lebensmodell.' },
  { value: 'family-flow', label: 'Family Flow', description: 'Familie ist mein Taktgeber.' },
  { value: 'minimalist', label: 'Minimalist', description: 'Weniger Zeug, mehr Fokus.' },
  { value: 'old-school', label: 'Old School', description: 'Feste Strukturen, klare Slots.' },
  { value: 'standard', label: 'Standard', description: 'Standard-Lebensstil.' },
];

export default function SoArbeitetDeinGuide() {
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [timePhilosophy, setTimePhilosophy] = useState<string>('Nicht gesetzt');
  const [lifestyle, setLifestyle] = useState<string>('Nicht gesetzt');
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { guideTone, nudgingFrequency, initializeFromAPI } = useGuideStore();

  // Initialize guide settings from API on mount
  useEffect(() => {
    initializeFromAPI();
  }, [initializeFromAPI]);

  // Load user data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load profile
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle<UserProfile>();

        if (userProfile) {
          const guidePersonality = userProfile.guide_personality || 'dividende';
          const lifestyleValue = (userProfile as any).lifestyle || 'standard';
          
          setTimePhilosophy(
            philosophyOptions.find(opt => opt.value === guidePersonality)?.label || 'Nicht gesetzt'
          );
          setLifestyle(
            lifestyleOptions.find(opt => opt.value === lifestyleValue)?.label || 'Nicht gesetzt'
          );
          setSpotifyConnected((userProfile as any).spotify_linked || false);
        }

        // Load primary goal
        const { data: primaryGoal } = await supabase
          .from('user_goals')
          .select('title')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .maybeSingle();

        setUserGoal((primaryGoal as any)?.title || userProfile?.focus_topic || null);

        // Load interests
        const interestsRes = await fetch('/api/profile/interests');
        if (interestsRes.ok) {
          const interestsData = await interestsRes.json();
          setInterests(interestsData.map((i: any) => i.label));
        }

        // Load projects
        const projectsRes = await fetch('/api/profile/projects');
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.map((p: any) => p.title));
        }
      } catch (error) {
        console.error('Error loading transparency data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '60px 20px 40px',
        background: '#0A0A0A',
        color: '#FFF8E7',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--rc-mint)]"></div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '60px 20px 40px',
      background: '#0A0A0A',
      color: '#FFF8E7',
      minHeight: '100vh'
    }}>
      {/* Title */}
      <h1 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        fontWeight: '700',
        textTransform: 'none',
        letterSpacing: '-0.02em',
        color: '#FFF8E7',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        So arbeitet dein Guide
      </h1>

      {/* Intro Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '700',
          color: '#FFF8E7',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Transparenz ist kein Feature. Es ist unser System.
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: '#B8BCC8',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Wir geben dir nicht mehr Zeit – wir geben sie dir zurück.
        </p>
      </div>

      {/* Transparency Widget - Read-only */}
      <div style={{ marginBottom: '60px' }}>
        <TransparencyWidget
          userGoal={userGoal}
          interests={interests}
          projects={projects}
          timePhilosophy={timePhilosophy}
          lifestyle={lifestyle}
          spotifyConnected={spotifyConnected}
          guideTone={guideTone}
          nudgingFrequency={nudgingFrequency === 'high' ? 'Intensiv' : nudgingFrequency === 'low' ? 'Minimal' : nudgingFrequency === 'off' ? 'Aus' : 'Standard'}
        />
      </div>

      {/* Settings Link */}
      <div style={{
        textAlign: 'center',
        paddingTop: '40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Link 
          href="/user/settings/ziel" 
          className="text-[var(--rc-mint)] hover:underline text-sm uppercase font-bold inline-flex items-center gap-2"
          style={{
            color: 'var(--rc-mint)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          Einstellungen öffnen →
        </Link>
      </div>
    </div>
  );
}


