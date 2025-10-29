'use client';

import { useGuideState } from '@/hooks/useGuideState';
import GuideSidebar from '@/components/guide/GuideSidebar';
import GuideFocusSection from '@/components/guide/GuideFocusSection';
import GuideKnowledgeSection from '@/components/guide/GuideKnowledgeSection';
import GuideVoicesSection from '@/components/guide/GuideVoicesSection';
import GuideActionsSection from '@/components/guide/GuideActionsSection';
import GuideConversationSection from '@/components/guide/GuideConversationSection';
import GuideExploreSection from '@/components/guide/GuideExploreSection';
import ProfileSummary from '@/components/profile/ProfileSummary';
import GoalWidget from '@/components/profile/GoalWidget';
import StatusMeter from '@/components/profile/StatusMeter';
import { Profile } from '@/types/profile';
import './dashboard.css';

// Mock profile data - TODO: Replace with real profile from API/context
const mockProfile: Profile = {
  id: 'mock-user-1',
  identity: {
    name: 'Mara Jensen',
    email: 'mara@example.com',
    avatarUrl: undefined,
    birthdate: '1990-01-15',
    targetAge: 45,
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
  journey: [],
  feedback: [],
  createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  updatedAt: new Date().toISOString(),
};

// Calculate time metrics
const birthDate = new Date(mockProfile.identity.birthdate);
const today = new Date();
const weeksLived = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
const targetAge = mockProfile.identity.targetAge;
const targetDate = new Date(birthDate);
targetDate.setFullYear(birthDate.getFullYear() + targetAge);
const weeksRemaining = Math.max(0, Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)));
const daysRemaining = Math.max(0, Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

const timeMetrics = {
  weeksLived,
  weeksRemaining,
  daysRemaining,
};

export default function GuideDashboardPage() {
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

  const handleEditGoal = () => {
    console.log('Edit goal clicked');
    // TODO: Open goal modal
  };

  return (
    <div className="guide-dashboard-shell">
      <GuideSidebar />

      <main className="guide-dashboard-main">
        {/* Hero Summary Section */}
        <section className="guide-section" id="intro">
          <div className="guide-hero-summary">
            <ProfileSummary
              profile={mockProfile}
              timeMetrics={timeMetrics}
              onEditGoal={handleEditGoal}
            />
          </div>
        </section>

        {/* Focus Section */}
        <GuideFocusSection
          items={state.focusBlocks}
          onActivate={(id) => console.log('Activate focus:', id)}
          onRemove={removeFocus}
        />

        {/* Knowledge Section */}
        <GuideKnowledgeSection
          items={state.knowledgeItems}
          onSave={(item) => console.log('Save knowledge:', item)}
          onRemove={removeKnowledge}
        />

        {/* Voices Section */}
        <GuideVoicesSection
          items={state.voiceItems}
          onPlay={(id) => console.log('Play voice:', id)}
          onContact={(id) => console.log('Contact voice:', id)}
        />

        {/* Actions Section */}
        <GuideActionsSection
          items={state.actionItems}
          onToggle={(id) => console.log('Toggle action:', id)}
          onReminder={(id) => console.log('Reminder for:', id)}
        />

        {/* Conversation Section */}
        <GuideConversationSection prompts={state.guidePrompts} />

        {/* Explore Section */}
        <GuideExploreSection
          themes={state.exploredThemes}
          onExplore={(id) => console.log('Explore theme:', id)}
          onRemove={removeTheme}
        />
      </main>
    </div>
  );
}