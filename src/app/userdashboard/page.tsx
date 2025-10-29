'use client';

import { useGuideState } from '@/hooks/useGuideState';
import GuideActionsSection from '@/components/guide/GuideActionsSection';
import GuideConversationSection from '@/components/guide/GuideConversationSection';
import GuideSettings from '@/components/guide/GuideSettings';
import ProfileSummary from '@/components/profile/ProfileSummary';
import Sidebar from '@/components/profile/Sidebar';
import LifeWeeksPreview from '@/components/profile/LifeWeeksPreview';
import JourneyTimeline from '@/components/profile/JourneyTimeline';
import GoalModal from '@/components/profile/GoalModal';
import { Profile } from '@/types/profile';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useUsageStore } from '@/stores/usageStore';
import { useGuideStore } from '@/stores/guideStore';
import { getGuideText } from '@/lib/guideTone';
import './userdashboard.css';

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
    text: 'Freiheit mit 45',
    source: 'custom',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  timePhilosophy: {
    optionId: 'time-priority',
    label: 'Zeit > Geld',
    selectedAt: new Date().toISOString(),
  },
  lifestyle: {
    optionId: 'freedom-focused',
    label: 'Freiheitsorientiert',
    selectedAt: new Date().toISOString(),
  },
  interests: [
    { id: 'time-mastery', label: 'Zeit-Meisterschaft' },
    { id: 'freedom', label: 'Freiheit' },
    { id: 'productivity', label: 'Produktivität' },
  ],
  projects: [],
  musicDNA: {
    genres: [],
    spotifyLinked: false,
  },
  progress: {
    guideStatus: 'on-track',
    actionCount: 12,
    streak: 3,
    lastAction: new Date(Date.now() - 86400000).toISOString(),
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
  feedback: [],
  createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  updatedAt: new Date().toISOString(),
};

// Calculate time metrics
const computeTimeMetrics = (profile: Profile) => {
  const birthDate = new Date(profile.identity.birthdate);
  const today = new Date();
  const weeksLived = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const targetAge = profile.identity.targetAge;
  const targetDate = new Date(birthDate);
  targetDate.setFullYear(birthDate.getFullYear() + targetAge);
  const weeksRemaining = Math.max(0, Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  const daysRemaining = Math.max(0, Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    weeksLived,
    weeksRemaining,
    daysRemaining,
  };
};

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { fetchUsageData } = useUsageStore();
  const { tone } = useGuideStore();

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
    addFocus,
    removeFocus,
    addKnowledge,
    removeKnowledge,
    addVoice,
    removeVoice,
    addAction,
    removeAction,
    addTheme,
    removeTheme,
  } = useGuideState();

  const handleEditGoal = useCallback(() => {
    setGoalModalOpen(true);
  }, []);

  const handleGoalSave = useCallback((goal: { text: string; source: Profile['goal']['source'] }) => {
    setProfile(prev => ({
      ...prev,
      goal: {
        ...prev.goal,
        text: goal.text,
        source: goal.source,
        updatedAt: new Date().toISOString(),
      },
    }));
    setGoalModalOpen(false);
  }, []);

  const handleEditSection = useCallback((sectionName: string) => {
    console.log('Edit section:', sectionName);
  }, []);

  const handleConnectSpotify = useCallback(() => {
    console.log('Connect Spotify');
  }, []);

  return (
    <div className="userdashboard-shell">
      {/* Left Sidebar - Credits, Goals, Quick Actions */}
      <Sidebar
        profile={profile}
        onEditGoal={handleEditGoal}
      />

      <main className="userdashboard-main">
        {/* Hero Summary Section */}
        <section className="guide-section" id="intro">
          <div className="guide-hero-summary">
            <ProfileSummary
              profile={profile}
              timeMetrics={timeMetrics}
              onEditGoal={handleEditGoal}
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

        {/* Journey Section */}
        <section className="guide-section" id="journey">
          <JourneyTimeline
            journey={profile.journey}
            onEdit={() => handleEditSection('Journey')}
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