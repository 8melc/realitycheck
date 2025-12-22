'use client';

import LifeWeeksPreview from '@/components/profile/LifeWeeksPreview';
import GuideFeedWidget from '@/components/dashboard/GuideFeedWidget';
import GuideHistory from '@/components/guide/GuideHistory';
import { Profile } from '@/types/profile';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUsageStore } from '@/stores/usageStore';
import { useGuideStore } from '@/stores/guideStore';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/database.types';
import { mapUserProfileToLegacyProfile } from '@/lib/utils/profile-mapper';
import LogoutButton from '@/components/LogoutButton';
import NudgePopup from '@/components/NudgePopup';
import { CreditReminder } from '@/components/credits/CreditReminder';
import UserAvatar from '@/components/UserAvatar';
import { PenSquareIcon } from '@/components/profile/icons';
import CreditsDisplay from '@/components/dashboard/CreditsDisplay';
import DashboardNavIcons from '@/components/dashboard/DashboardNavIcons';
import Link from 'next/link';
import './page.css';


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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rawUserProfile, setRawUserProfile] = useState<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchUsageData } = useUsageStore();
  
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
            label: userProfile.guide_personality || 'Zeit als Dividende',
            selectedAt: userProfile.created_at,
          },
          lifestyle: {
            optionId: (userProfile as any).lifestyle || 'standard',
            label: (userProfile as any).lifestyle || 'Standard',
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
      
      <main className="guide-dashboard-main-single">
        {/* Dashboard Navigation Icons */}
        <DashboardNavIcons />

        {/* Dashboard Header - Integrated Profile Block */}
        <div className="dashboard-header-block">
          <div className="dashboard-profile-header">
            <div className="dashboard-profile-avatar">
              <UserAvatar 
                userId={profile.id} 
                size="md" 
                displayName={profile.identity.name}
                email={profile.identity.email}
              />
            </div>
          <div className="dashboard-profile-info">
            <div className="dashboard-profile-header-row">
              <div className="dashboard-profile-name">{profile.identity.name || 'User'}</div>
              <Link 
                href="/user/settings" 
                className="dashboard-settings-link"
              >
                Alle Einstellungen
              </Link>
            </div>
            <div className="dashboard-profile-status">On Fire</div>
            <div style={{ marginTop: '0.5rem' }}>
              <CreditsDisplay />
            </div>
          </div>
        </div>
          
          <div id="ziel" className="dashboard-goal-section">
            <div className="dashboard-goal-question">Was willst du wirklich?</div>
            <div className="dashboard-goal-text">{profile.primaryGoalTitle || 'Noch kein Ziel gesetzt'}</div>
            <a href="/user/settings/ziel" className="rc-btn rc-btn--primary rc-btn--statement" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <PenSquareIcon className="h-4 w-4" />
              Ziel ändern
            </a>
          </div>
        </div>

        <section className="guide-section" id="guide-heute">
          <GuideFeedWidget />
        </section>

        <section className="guide-section" id="life-in-weeks">
          <LifeWeeksPreview profile={profile} />
        </section>

        <section className="guide-section" id="guide-history">
          <GuideHistory />
        </section>
      </main>

      
      {/* Nudge Popup */}
      <NudgePopup />
    </div>
  );
}
