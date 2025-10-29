'use client';

import { useGuideState } from '@/hooks/useGuideState';
import GuideActionsSection from '@/components/guide/GuideActionsSection';
import GuideConversationSection from '@/components/guide/GuideConversationSection';
import GuideSettings from '@/components/guide/GuideSettings';
import ProfileSummary from '@/components/profile/ProfileSummary';
import Sidebar from '@/components/profile/Sidebar';
import TimeStyleCard from '@/components/profile/TimeStyleCard';
import EnergyFeeds from '@/components/profile/EnergyFeeds';
import UsageLimitSettings from '@/components/profile/UsageLimitSettings';
import FilterTodoCard from '@/components/profile/FilterTodoCard';
import JourneyTimeline from '@/components/profile/JourneyTimeline';
import MotivationFeed from '@/components/profile/MotivationFeed';
import LifeWeeksPreview from '@/components/profile/LifeWeeksPreview';
import GoalModal from '@/components/profile/GoalModal';
import { Profile } from '@/types/profile';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useUsageStore } from '@/stores/usageStore';
import { useGuideStore } from '@/stores/guideStore';
import { getGuideText } from '@/lib/guideTone';
import './page.css';

// Mock profile data - TODO: Replace with real profile from API/context
const mockProfile: Profile = {
  id: 'mock-user-1',
  identity: {
    name: 'Mara Jensen',
    email: 'mara@example.com',
    avatarUrl: '/MaraJensen_ProfilePicture.avif',
    birthdate: '1990-04-12T00:00:00.000Z',
    targetAge: 85,
  },
  goal: {
    text: 'Freiheit spüren, bevor ich 50 bin',
    source: 'chip',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  timePhilosophy: {
    optionId: 'time-investment',
    label: 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.',
    selectedAt: new Date().toISOString(),
  },
  lifestyle: {
    optionId: 'digital-nomad',
    label: 'Digital Nomad – Ich reise und arbeite von überall.',
    selectedAt: new Date().toISOString(),
  },
  interests: [
    { id: 'interest-1', label: 'Krypto & Blockchain' },
    { id: 'interest-2', label: 'Kunst & Design' },
    { id: 'interest-3', label: 'Philosophie' },
    { id: 'interest-4', label: 'Reisen' },
  ],
  projects: [
    {
      id: 'project-1',
      title: 'FYF Guide Prototype',
      status: 'active',
      description: 'Tägliche Iterationen an Content und Matching-Mechanik.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'project-2',
      title: 'Nomad Retreat Aufbau',
      status: 'active',
      description: 'Co-living Retreat in Lissabon vorbereiten.',
      updatedAt: new Date().toISOString(),
    },
  ],
  musicDNA: {
    genres: ['Electronic', 'Ambient', 'Indie'],
    spotifyLinked: false,
  },
  progress: {
    guideStatus: 'warming-up',
    actionCount: 4,
    streak: 2,
    lastAction: new Date().toISOString(),
  },
  journey: [
    {
      id: 'journey-1',
      type: 'onboarding',
      description: 'Profil erstellt – Ready für FYF.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'journey-2',
      type: 'life-in-weeks',
      description: 'Life in Weeks visualisiert – Zeitwert aktualisiert.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'journey-3',
      type: 'people',
      description: 'People-Sektion erkundet und zwei Matches gespeichert.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ],
  feedback: [
    {
      id: 'feedback-1',
      tone: 'motivating',
      message:
        'Du hast dein Ziel klar gezogen. Jetzt jede Woche einen Fokus-Block reservieren, der nur diesem Ziel gehört.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'feedback-2',
      tone: 'challenging',
      message:
        'Dein Kalender zeigt noch 6 Stunden Meetings pro Woche. Welche kannst du streichen, damit Freiheit mehr ist als ein Wort?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Calculate time metrics
const computeTimeMetrics = (profile: Profile) => {
  const birthDate = new Date(profile.identity.birthdate);
  const today = new Date();
  const targetAge = profile.identity.targetAge || 80;

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksLived = Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / msPerWeek));
  const totalWeeks = targetAge * 52;
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  
  const targetDate = new Date(birthDate);
  targetDate.setFullYear(birthDate.getFullYear() + targetAge);
  const daysRemaining = Math.max(0, Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return { weeksLived, weeksRemaining, daysRemaining };
};

export default function GuideDashboardPage() {
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { fetchUsageData } = useUsageStore();
  const { guideTone, isGuideMuted } = useGuideStore();
  
  // Calculate time metrics only on client side
  const timeMetrics = useMemo(() => {
    if (!isClient) {
      return { weeksLived: 0, weeksRemaining: 0, daysRemaining: 0 };
    }
    return computeTimeMetrics(profile);
  }, [profile, isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const {
    state,
    addAction,
    removeAction,
  } = useGuideState();

  const handleEditSection = useCallback((section: string) => {
    window.alert(`Bearbeitung für „${section}" ist in Arbeit.`);
  }, []);

  const handleGoalSave = useCallback(
    (goal: { text: string; source: Profile['goal']['source'] }) => {
      setProfile((prev) => ({
        ...prev,
        goal: {
          text: goal.text,
          source: goal.source,
          createdAt: prev.goal.createdAt,
          updatedAt: new Date().toISOString(),
        },
      }));
      setGoalModalOpen(false);
    },
    []
  );

  const handleConnectSpotify = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      musicDNA: {
        spotifyLinked: true,
        genres: prev.musicDNA.genres,
        spotifyData: {
          topArtists: ['Bonobo', 'Kiasmos', 'Nils Frahm'],
          topGenres: ['Electronic', 'Ambient', 'Indie'],
          playlistId: 'fyf-focus',
          linkedAt: new Date().toISOString(),
        },
      },
    }));
  }, []);

  // Load usage data on mount
  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  return (
    <div className="guide-dashboard-shell">
      {/* Left Sidebar - Credits, Goals, Quick Actions */}
      <Sidebar 
        profile={profile} 
        onEditGoal={() => setGoalModalOpen(true)} 
      />

      <main className="guide-dashboard-main-full">
        {/* Hero Summary Section */}
        <section className="guide-section" id="intro">
          <div className="guide-hero-summary">
            <ProfileSummary
              profile={profile}
              timeMetrics={timeMetrics}
              onEditGoal={() => setGoalModalOpen(true)}
            />
          </div>
        </section>

        {/* Life Weeks Preview */}
        <section className="guide-section" id="life-weeks">
          <LifeWeeksPreview profile={profile} />
        </section>

        {/* Actions Section */}
        <section className="guide-section" id="actions">
          <GuideActionsSection
            items={state.actionItems}
            onToggle={(id) => console.log('Toggle action:', id)}
            onReminder={(id) => console.log('Reminder for:', id)}
          />
        </section>

        {/* Conversation Section */}
        <section className="guide-section" id="conversation">
          <GuideConversationSection prompts={state.guidePrompts} />
          
          {/* Guide Settings unter Conversation */}
          <div className="guide-settings-container" id="guide-settings">
            <GuideSettings />
          </div>
        </section>

        {/* Zeit-Profil Section */}
        <section className="guide-section" id="zeit-profil">
          <TimeStyleCard 
            profile={profile} 
            onEdit={() => handleEditSection('Zeit-Profil')} 
          />
        </section>

        {/* Energie-Feeds Section */}
        <section className="guide-section" id="energie-feeds">
          <EnergyFeeds
            profile={profile}
            onConnectSpotify={handleConnectSpotify}
            onEdit={() => handleEditSection('Energie-Feeds')}
          />
        </section>

        {/* Tageslimit Section */}
        <section className="guide-section" id="tageslimit">
          <UsageLimitSettings onEdit={() => handleEditSection('Tageslimit')} />
        </section>

        {/* Filter Section */}
        <section className="guide-section" id="filter">
          <FilterTodoCard onEdit={() => handleEditSection('Filter-Funktion')} />
        </section>

        {/* Journey Section */}
        <section className="guide-section" id="journey">
          <JourneyTimeline 
            journey={profile.journey} 
            onEdit={() => handleEditSection('Journey')} 
          />
        </section>

        {/* Feedback Section */}
        <section className="guide-section" id="feedback">
          <MotivationFeed 
            profile={profile} 
            onEdit={() => handleEditSection('Feedback & Impulse')} 
          />
        </section>
      </main>

      {/* Goal Modal */}
      <GoalModal
        open={isGoalModalOpen}
        initialGoal={profile.goal.text}
        onClose={() => setGoalModalOpen(false)}
        onSave={handleGoalSave}
      />
    </div>
  );
}