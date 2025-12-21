'use client';

import { useProfileSettings } from '@/hooks/useProfileSettings';
import { useClickOutside } from '@/hooks/useClickOutside';
import ProfileSummary from '@/components/profile/ProfileSummary';
import Sidebar from '@/components/profile/Sidebar';
import LifeWeeksPreview from '@/components/profile/LifeWeeksPreview';
import TransparencyWidget from '@/components/dashboard/TransparencyWidget';
import GuideFeedWidget from '@/components/dashboard/GuideFeedWidget';
import GoalModal from '@/components/profile/GoalModal';
import GuideHistory from '@/components/guide/GuideHistory';
import { Profile } from '@/types/profile';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUsageStore } from '@/stores/usageStore';
import { useGuideStore } from '@/stores/guideStore';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/database.types';
import { mapUserProfileToLegacyProfile } from '@/lib/utils/profile-mapper';
import LogoutButton from '@/components/LogoutButton';
import NudgePopup from '@/components/NudgePopup';
import { CreditReminder } from '@/components/credits/CreditReminder';
import './page.css';

// Philosophy and Lifestyle options (matching onboarding)
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

// Calculate time metrics
const computeTimeMetrics = (profile: Profile) => {
  if (!profile?.identity?.birthdate) return { weeksLived: 0, weeksRemaining: 0, daysRemaining: 0 };
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
  const router = useRouter();
  const profileSectionRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'profile'>('overview');
  const [rawUserProfile, setRawUserProfile] = useState<any>(null);
  
  // Profile settings hook
  const {
    focusTopic, setFocusTopic,
    willLearn, setWillLearn,
    willShare, setWillShare,
    bio, setBio,
    isPublic, setIsPublic,
    guidePersonality, setGuidePersonality,
    lifestyle, setLifestyle,
    isSaving, saveError, saveSuccess,
    hasChanges,
    handleSaveProfileSettings: saveSettings,
  } = useProfileSettings(rawUserProfile);

  const [willLearnInput, setWillLearnInput] = useState('');
  const [willShareInput, setWillShareInput] = useState('');

  const [user, setUser] = useState<any>(null);
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creditsBalance, setCreditsBalance] = useState<number>(0);
  const [creditsValue, setCreditsValue] = useState<number>(0);
  const [creditsConsumedThisWeek, setCreditsConsumedThisWeek] = useState<number>(0);
  const [userInterests, setUserInterests] = useState<Array<{ id: string; label: string; created_at: string }>>([]);
  const [userProjects, setUserProjects] = useState<Array<{ id: string; title: string; status: string; priority: number; created_at: string; updated_at: string }>>([]);
  const { fetchUsageData } = useUsageStore();
  const { guideTone, isGuideMuted, initializeFromAPI, nudgingFrequency } = useGuideStore();
  
  // Initialize guide settings from API on mount
  useEffect(() => {
    initializeFromAPI();
  }, [initializeFromAPI]);
  
  
  // Load credits from API
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await fetch('/api/profile/credits');
        if (response.ok) {
          const data = await response.json();
          setCreditsBalance(data.balance || 0);
          setCreditsValue(data.value || 0);
          setCreditsConsumedThisWeek(data.consumedThisWeek || 0);
        } else {
          console.error('[Dashboard] Failed to load credits');
        }
      } catch (error) {
        console.error('[Dashboard] Error loading credits:', error);
      }
    };
    
    loadCredits();
  }, []);
  
  // Load user interests from API
  useEffect(() => {
    const loadInterests = async () => {
      try {
        const response = await fetch('/api/profile/interests');
        if (response.ok) {
          const data = await response.json();
          setUserInterests(data);
        } else {
          console.error('[Dashboard] Failed to load interests');
        }
      } catch (error) {
        console.error('[Dashboard] Error loading interests:', error);
      }
    };
    
    loadInterests();
  }, []);
  
  // Load user projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/profile/projects');
        if (response.ok) {
          const data = await response.json();
          setUserProjects(data);
        } else {
          console.error('[Dashboard] Failed to load projects');
        }
      } catch (error) {
        console.error('[Dashboard] Error loading projects:', error);
      }
    };
    
    loadProjects();
  }, []);
  
  // Calculate time metrics only on client side
  const timeMetrics = useMemo(() => {
    if (!isClient || !profile) {
      return { weeksLived: 0, weeksRemaining: 0, daysRemaining: 0 };
    }
    return computeTimeMetrics(profile);
  }, [profile, isClient]);

  // Security timeout for loading state
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      console.warn('Dashboard - Loading timeout reached (10s)');
      setIsLoading(false);
      if (!profile) setError('Das Laden dauert ungewöhnlich lange. Bitte versuchen Sie es erneut oder prüfen Sie Ihre Verbindung.');
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoading, profile]);

  // Load profile from Supabase
  useEffect(() => {
    let isMounted = true;
    setIsClient(true);

    async function loadUserProfile() {
      console.log('Dashboard - Fetching session...');
      try {
        const {
          data: { user: currentUser },
          error: sessionError,
        } = await supabase.auth.getUser();

        if (sessionError) {
          console.error('Dashboard - Session error:', sessionError);
        }

        if (!isMounted) return;

        if (!currentUser) {
          console.log('Dashboard - No user session found');
          // Wait a bit to see if session is still loading
          setIsLoading(false);
          setIsClient(true);
          return;
        }
        
        const userId = currentUser.id;
        setUser(currentUser);
        console.log('Dashboard - User found:', currentUser.email);
        
        const { data, error: profileError, status } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        const userProfile = data as UserProfile | null;
        
        if (!isMounted) return;

        if (profileError && status !== 406) {
          console.error('Dashboard - Profile query error:', profileError);
          throw new Error(`DB Fehler: ${profileError.message}`);
        }
        
        if (!userProfile) {
          console.log('Dashboard - No profile found for user:', userId);
          // If we are authenticated but have no profile, we should probably redirect to onboarding
          // instead of showing a "demo" fallback that might confuse the user.
          // But for now, we'll keep the fallback but make it clearer in logs.
          console.log('Dashboard - Using fallback profile for authenticated user without profile record');
          
          // Construct fallback profile
          const fallbackProfile: Profile = {
            id: userId,
            identity: {
              name: currentUser.email?.split('@')[0] || 'Reality Check User',
              email: currentUser.email || '',
              birthdate: '',
              targetAge: 80,
            },
            goal: {
              text: 'Noch kein Ziel gesetzt',
              source: 'custom',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            timePhilosophy: {
              optionId: 'time-investment',
              label: 'Zeit als Investition',
              selectedAt: new Date().toISOString(),
            },
            lifestyle: {
              optionId: 'default',
              label: 'Standard',
              selectedAt: new Date().toISOString(),
            },
            interests: [],
            projects: [],
            musicDNA: {
              genres: [],
              spotifyLinked: false,
            },
            progress: {
              guideStatus: 'warming-up',
              actionCount: 0,
              streak: 0,
              lastAction: new Date().toISOString(),
            },
            journey: [
              { id: 'start', type: 'onboarding', description: 'Willkommen bei RealityCheck', timestamp: new Date().toISOString() },
            ],
            feedback: [],
            isPublic: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
          setRawUserProfile(null);
          setError(null);
          return;
        }
        
        console.log('Dashboard - Profile found successfully');
        
        const { data: primaryGoal, error: goalError } = await supabase
          .from('user_goals')
          .select('title')
          .eq('user_id', userId)
          .eq('is_primary', true)
          .maybeSingle();
        
        if (goalError) {
          console.error('Dashboard - Goal query error:', goalError);
        }

        if (!isMounted) return;

        // Fallback to focus_topic from profile if no primary goal found
        const goalTitle = (primaryGoal as any)?.title || userProfile.focus_topic || null;
        
        let mappedProfile;
        try {
          mappedProfile = mapUserProfileToLegacyProfile(userProfile, goalTitle);
        } catch (mapErr) {
          console.error('Dashboard - Mapper Error:', mapErr);
          // Fallback mapper logic
          mappedProfile = { identity: { name: userProfile.display_name || 'User' } };
        }
        
        // Final State Update
        const fullProfile: Profile = {
          id: userProfile.user_id,
          identity: {
            name: userProfile.display_name || 'User',
            email: currentUser.email || '',
            avatarUrl: undefined,
            birthdate: userProfile.birth_date || '',
            targetAge: userProfile.target_age || 80,
          },
          goal: {
            text: goalTitle || 'Noch keines gesetzt',
            source: 'custom',
            createdAt: userProfile.created_at,
            updatedAt: userProfile.updated_at,
          },
          timePhilosophy: {
            optionId: userProfile.guide_personality || 'dividende',
            label: userProfile.guide_personality ? philosophyOptions.find(opt => opt.value === userProfile.guide_personality)?.label || userProfile.guide_personality : 'Zeit als Dividende',
            selectedAt: userProfile.created_at,
          },
          lifestyle: {
            optionId: (userProfile as any).lifestyle || 'standard',
            label: (userProfile as any).lifestyle ? lifestyleOptions.find(opt => opt.value === (userProfile as any).lifestyle)?.label || (userProfile as any).lifestyle : 'Standard',
            selectedAt: userProfile.created_at,
          },
          interests: [],
          projects: [],
          musicDNA: {
            genres: [],
            spotifyLinked: false,
          },
          progress: {
            guideStatus: 'warming-up',
            actionCount: 0,
            streak: 0,
            lastAction: userProfile.updated_at,
          },
          journey: [
            { id: 'onboarding-1', type: 'onboarding', description: 'Profil erstellt', timestamp: userProfile.created_at },
          ],
          feedback: goalTitle ? [
            {
              id: 'initial-feedback-1',
              tone: 'motivating',
              message: `Starkes Ziel: „${goalTitle}“. Dein Guide wird dich dabei unterstützen, den Fokus zu halten.`,
              createdAt: new Date().toISOString(),
            },
            {
              id: 'initial-feedback-2',
              tone: 'reflecting',
              message: 'Wie viel Zeit hast du heute bereits für dieses Ziel investiert?',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            }
          ] : [],
          bio: userProfile.bio || undefined,
          focusTopic: userProfile.focus_topic || undefined,
          willLearn: userProfile.will_learn || undefined,
          willShare: userProfile.will_share || undefined,
          isPublic: userProfile.is_public ?? true,
          primaryGoalTitle: goalTitle || undefined,
          createdAt: userProfile.created_at,
          updatedAt: userProfile.updated_at,
        };
        
        setProfile(fullProfile);
        setRawUserProfile(userProfile);
        setError(null);
      } catch (err: any) {
        console.error('Dashboard - Global Load Error:', err);
        setError(err.message || 'Fehler beim Laden des Profils');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    loadUserProfile();
    return () => { isMounted = false; };
  }, [router]);

  const handleEditSection = useCallback((section: string) => {
    if (section === 'Zeit-Profil') {
      // Zeit-Profil wird inline bearbeitet, keine separate Modal nötig
      // Die Edit-Funktion wird direkt in TimeStyleCard gehandhabt
      return;
    }
    window.alert(`Bearbeitung für „${section}" ist in Arbeit.`);
  }, []);

  const handleGoalSave = useCallback(
    async (goal: { text: string; source: Profile['goal']['source'] }) => {
      console.log('Dashboard - Saving goal:', goal.text);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Nicht authentifiziert');

        // 1. Suche primäres Ziel
        const { data: existingGoal } = await supabase
          .from('user_goals')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('is_primary', true)
          .maybeSingle();

        if (existingGoal) {
          // Update
          await (supabase as any)
            .from('user_goals')
            .update({ title: goal.text, updated_at: new Date().toISOString() })
            .eq('id', (existingGoal as any).id);
        } else {
          // Create
          await (supabase as any)
            .from('user_goals')
            .insert({ 
              user_id: session.user.id, 
              title: goal.text, 
              is_primary: true, 
              status: 'active' 
            });
        }

        // State updaten
        setProfile((prev) => prev ? ({
          ...prev,
          primaryGoalTitle: goal.text,
          focusTopic: goal.text, // Keep in sync
          goal: {
            text: goal.text,
            source: goal.source,
            createdAt: prev.goal.createdAt,
            updatedAt: new Date().toISOString(),
          },
        }) : null);
        
        // Also update rawUserProfile to keep useProfileSettings in sync
        setRawUserProfile((prev: any) => prev ? ({
          ...prev,
          focus_topic: goal.text
        }) : null);
        
        setGoalModalOpen(false);
      } catch (err) {
        console.error('Dashboard - Goal Save Error:', err);
        alert('Ziel konnte nicht gespeichert werden.');
      }
    },
    []
  );


  // Tag management
  const handleWillLearnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && willLearnInput.trim()) {
      e.preventDefault();
      const newTag = willLearnInput.trim().toLowerCase();
      if (!willLearn.includes(newTag)) {
        setWillLearn([...willLearn, newTag]);
      }
      setWillLearnInput('');
    }
  };

  const removeWillLearn = (tag: string) => {
    setWillLearn(willLearn.filter(t => t !== tag));
  };

  const handleWillShareKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && willShareInput.trim()) {
      e.preventDefault();
      const newTag = willShareInput.trim().toLowerCase();
      if (!willShare.includes(newTag)) {
        setWillShare([...willShare, newTag]);
      }
      setWillShareInput('');
    }
  };

  const removeWillShare = (tag: string) => {
    setWillShare(willShare.filter(t => t !== tag));
  };

  const handleBackToOverview = useCallback(() => {
    if (hasChanges) {
      const confirm = window.confirm('Bist du sicher? Deine Zeit ist zu wertvoll, um sie mit ungespeicherten Daten zu verschwenden. Willst du wirklich einfach so weggehen?');
      if (!confirm) return;
    }
    setActiveSection('overview');
  }, [hasChanges]);

  const handleSaveProfileSettings = async () => {
    const result = await saveSettings();
    if (result?.success) {
      setRawUserProfile((prev: any) => ({
        ...prev,
        focus_topic: focusTopic,
        will_learn: willLearn,
        will_share: willShare,
        bio: bio,
        is_public: isPublic,
        guide_personality: guidePersonality,
        lifestyle: lifestyle
      }));

      setProfile(prev => prev ? {
        ...prev,
        focusTopic: focusTopic,
        primaryGoalTitle: focusTopic || prev.primaryGoalTitle, // Update if focusTopic is provided
        willLearn: willLearn,
        willShare: willShare,
        isPublic: isPublic,
        bio: bio,
        goal: {
          ...prev.goal,
          text: focusTopic || prev.goal.text,
          updatedAt: new Date().toISOString()
        }
      } : null);

      setTimeout(() => {
        setActiveSection('overview');
      }, 1000);
    }
  };

  // Click outside to close profile section
  useClickOutside(
    profileSectionRef,
    handleBackToOverview,
    activeSection === 'profile',
    ['.rc-floating-sidebar']
  );

  // Load usage data on mount
  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  // Show loading state
  if (isLoading && !profile) {
    return (
      <div className="guide-dashboard-shell" style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', zIndex: 1000 }}>
          <p style={{ color: '#B8BCC8', marginBottom: '10px' }}>Dashboard wird geladen...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fyf-mint)] mx-auto"></div>
          <p style={{ fontSize: '0.7rem', marginTop: '20px', opacity: 0.5 }}>
            Dauert es zu lange? <button onClick={() => window.location.reload()} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Neu laden</button> oder <button onClick={() => router.push('/login')} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Logout</button>
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="guide-dashboard-shell" style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <p style={{ color: '#F08A8F', marginBottom: '20px' }}>Fehler beim Laden: {error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => window.location.reload()} className="guide-btn guide-btn-primary">Neu laden</button>
            <button onClick={() => router.push('/login')} className="guide-btn" style={{ border: '1px solid #70B1AF', color: '#70B1AF' }}>Zum Login</button>
          </div>
        </div>
      </div>
    );
  }

  // Show no profile state (Disabled for demo - fallback profile used instead)
  /*
  if (!profile) {
    return (
      <div className="guide-dashboard-shell" style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <p style={{ color: '#B8BCC8', marginBottom: '20px' }}>Kein Profil gefunden.</p>
          <button onClick={() => router.push('/onboarding')} className="guide-btn guide-btn-primary">Onboarding starten</button>
        </div>
      </div>
    );
  }
  */

  if (!profile) return null; // Safety check, though profile should be set by now

  return (
    <div className="guide-dashboard-shell">
      <CreditReminder />
      <Sidebar 
        profile={profile} 
        onEditGoal={() => setGoalModalOpen(true)} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        hasUnsavedChanges={hasChanges}
        creditsBalance={creditsBalance}
        creditsValue={creditsValue}
        creditsConsumedThisWeek={creditsConsumedThisWeek}
      />

      <main className="guide-dashboard-main-full">
        {activeSection === 'overview' ? (
          <>
            <section className="guide-section" id="intro">
              <div className="guide-hero-summary">
                <ProfileSummary
                  profile={profile}
                  timeMetrics={timeMetrics}
                  onEditGoal={() => setGoalModalOpen(true)}
                />
              </div>
            </section>

            <section className="guide-section" id="guide-futter">
              <TransparencyWidget
                userGoal={profile.primaryGoalTitle || null}
                interests={userInterests.map(i => i.label)}
                projects={userProjects.map(p => p.title)}
                timePhilosophy={philosophyOptions.find(opt => opt.value === guidePersonality)?.label || 'Nicht gesetzt'}
                lifestyle={lifestyleOptions.find(opt => opt.value === lifestyle)?.label || 'Nicht gesetzt'}
                spotifyConnected={profile.musicDNA?.spotifyLinked || false}
                guideTone={guideTone}
                nudgingFrequency={nudgingFrequency === 'high' ? 'Intensiv' : nudgingFrequency === 'low' ? 'Minimal' : nudgingFrequency === 'off' ? 'Aus' : 'Standard'}
              />
            </section>

            <section className="guide-section" id="guide-feed">
              <GuideFeedWidget />
            </section>

            <section className="guide-section" id="life-weeks">
              <LifeWeeksPreview profile={profile} />
            </section>

            <section className="guide-section" id="guide-history">
              <GuideHistory />
            </section>

          </>
        ) : (
          <section id="profile" className="guide-section" ref={profileSectionRef}>
            <div className="guide-section-header mb-8">
              <span className="guide-kicker">Mein Profil & Guide</span>
              <h2 className="guide-title">Was soll dein Guide wissen?</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase text-[var(--fyf-steel)]">Fokus</label>
                <textarea value={focusTopic} onChange={e => setFocusTopic(e.target.value)} className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--fyf-cream)] focus:border-[var(--fyf-mint)]" rows={4} placeholder="Worum geht es gerade?" />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase text-[var(--fyf-steel)]">Will lernen</label>
                <input value={willLearnInput} onChange={e => setWillLearnInput(e.target.value)} onKeyDown={handleWillLearnKeyDown} className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--fyf-cream)]" placeholder="Enter zum Hinzufügen" />
                <div className="flex flex-wrap gap-2">
                  {willLearn.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 text-xs border border-white/10 flex items-center gap-2" onClick={() => removeWillLearn(tag)}>{tag} ✕</span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase text-[var(--fyf-steel)]">Will teilen</label>
                <input value={willShareInput} onChange={e => setWillShareInput(e.target.value)} onKeyDown={handleWillShareKeyDown} className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--fyf-cream)]" placeholder="Enter zum Hinzufügen" />
                <div className="flex flex-wrap gap-2">
                  {willShare.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 text-xs border border-white/10 flex items-center gap-2" onClick={() => removeWillShare(tag)}>{tag} ✕</span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase text-[var(--fyf-steel)]">Sichtbarkeit</label>
                <div className="flex items-center gap-3 p-4 bg-[#111418] border border-white/10 rounded-xl">
                  <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm">Öffentliches Profil</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-between items-center border-t border-white/10 pt-8">
              <button onClick={handleBackToOverview} className="text-sm text-[var(--fyf-steel)]">← Zurück</button>
              <div className="flex items-center gap-4">
                {saveSuccess && <span className="text-[var(--fyf-mint)]">✓ Gespeichert</span>}
                <button onClick={handleSaveProfileSettings} disabled={isSaving} className="guide-btn guide-btn-primary">{isSaving ? 'Speichert...' : 'Speichern'}</button>
              </div>
            </div>
          </section>
        )}
      </main>

      <GoalModal open={isGoalModalOpen} initialGoal={profile?.primaryGoalTitle || ''} onClose={() => setGoalModalOpen(false)} onSave={handleGoalSave} />
      
      {/* Nudge Popup */}
      <NudgePopup />
    </div>
  );
}
