'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Sidebar from '@/components/profile/Sidebar';
import { Profile } from '@/types/profile';
import { useGuideStore, getNudgingFrequencyInfo } from '@/stores/guideStore';
import './settings.css';

// Philosophy options (matching dashboard)
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

interface AccountSettings {
  email: string;
  name: string | null;
  emailConfirmed: boolean;
  avatarUrl: string | null;
}

interface ProfileData {
  display_name: string | null;
  birth_date: string | null;
  target_age: number | null;
  guide_personality: string | null;
  focus_topic: string | null;
  bio: string | null;
  will_learn: string[] | null;
  will_share: string[] | null;
  is_public: boolean;
}

// Guide-Verhalten Form Component
function GuideVerhaltenForm() {
  const { guideTone, setGuideTone, nudgingFrequency, setNudgingFrequency, isGuideMuted, toggleGuideMute } = useGuideStore();
  const nudgingInfo = getNudgingFrequencyInfo(nudgingFrequency);

  return (
    <div className="settings-form">
      <div className="form-group">
        <label className="form-label">Ton-Kalibrierung</label>
        <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            className={`btn ${guideTone === 'straight' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setGuideTone('straight')}
          >
            Straight Talk
          </button>
          <button
            type="button"
            className={`btn ${guideTone === 'soft' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setGuideTone('soft')}
          >
            Soft Touch
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="nudgingFrequency" className="form-label">Nudging-Frequenz</label>
        <select
          id="nudgingFrequency"
          className="form-select"
          value={nudgingFrequency}
          onChange={(e) => setNudgingFrequency(e.target.value as 'high' | 'medium' | 'low' | 'off')}
        >
          <option value="high">Intensiv (3-4 Nudges/Tag)</option>
          <option value="medium">Standard (2-3 Nudges/Tag) - Empfohlen</option>
          <option value="low">Minimal (1 Nudge/Tag)</option>
          <option value="off">Aus (0 Nudges)</option>
        </select>
        <p className="form-hint">{nudgingInfo.description}</p>
      </div>

      <div className="form-group">
        <button
          type="button"
          className={`btn ${isGuideMuted ? 'btn-secondary' : 'btn-danger'}`}
          onClick={toggleGuideMute}
        >
          {isGuideMuted ? 'Guide aktivieren' : 'HALT DIE FRESSE'}
        </button>
        <p className="form-hint">Guide komplett stumm schalten.</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Account settings state
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    email: '',
    name: null,
    emailConfirmed: false,
    avatarUrl: null,
  });
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: null,
    birth_date: null,
    target_age: null,
    guide_personality: null,
    focus_topic: null,
    bio: null,
    will_learn: null,
    will_share: null,
    is_public: true,
  });
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Will learn/share input state
  const [willLearnInput, setWillLearnInput] = useState('');
  const [willShareInput, setWillShareInput] = useState('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load account settings
      const accountRes = await fetch('/api/user/settings');
      if (accountRes.ok) {
        const accountData = await accountRes.json();
        setAccountSettings(accountData);
      }

      // Load profile data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const profileResult = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const profile = profileResult.data as any;
      if (profile) {
        setProfileData({
          display_name: profile.display_name,
          birth_date: profile.birth_date,
          target_age: profile.target_age,
          guide_personality: profile.guide_personality,
          focus_topic: profile.focus_topic,
          bio: profile.bio,
          will_learn: profile.will_learn || [],
          will_share: profile.will_share || [],
          is_public: profile.is_public,
        });
      }

      // Load primary goal
      const goalResult = await supabase
        .from('user_goals')
        .select('title')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      const goal = goalResult.data as any;
      if (goal) {
        setPrimaryGoal(goal.title);
      }
    } catch (error) {
      console.error('[Settings] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle account settings update
  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountLoading(true);
    setAccountError(null);
    setAccountSuccess(false);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountSettings.email,
          name: accountSettings.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren');
      }

      setAccountSuccess(true);
      setTimeout(() => setAccountSuccess(false), 3000);
    } catch (error: any) {
      setAccountError(error.message);
    } finally {
      setAccountLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Das neue Passwort muss mindestens 8 Zeichen lang sein');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Passwort-Ändern');
      }

      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          goal: primaryGoal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren des Profils');
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error: any) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden dauerhaft gelöscht.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'Bitte gib "LÖSCHEN" ein, um zu bestätigen:'
    );

    if (doubleConfirm !== 'LÖSCHEN') {
      alert('Account-Löschung abgebrochen.');
      return;
    }

    try {
      const response = await fetch('/api/user/settings', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Accounts');
      }

      router.push('/login');
    } catch (error: any) {
      alert(`Fehler: ${error.message}`);
    }
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      const response = await fetch('/api/user/export');
      if (!response.ok) throw new Error('Fehler beim Exportieren');

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `realitycheck-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Fehler beim Exportieren: ${error.message}`);
    }
  };

  // Handle will learn/share tag management
  const handleWillLearnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && willLearnInput.trim()) {
      e.preventDefault();
      const newTag = willLearnInput.trim().toLowerCase();
      if (!profileData.will_learn?.includes(newTag)) {
        setProfileData({
          ...profileData,
          will_learn: [...(profileData.will_learn || []), newTag],
        });
      }
      setWillLearnInput('');
    }
  };

  const removeWillLearn = (tag: string) => {
    setProfileData({
      ...profileData,
      will_learn: profileData.will_learn?.filter(t => t !== tag) || [],
    });
  };

  const handleWillShareKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && willShareInput.trim()) {
      e.preventDefault();
      const newTag = willShareInput.trim().toLowerCase();
      if (!profileData.will_share?.includes(newTag)) {
        setProfileData({
          ...profileData,
          will_share: [...(profileData.will_share || []), newTag],
        });
      }
      setWillShareInput('');
    }
  };

  const removeWillShare = (tag: string) => {
    setProfileData({
      ...profileData,
      will_share: profileData.will_share?.filter(t => t !== tag) || [],
    });
  };

  if (loading) {
    return (
      <div className="settings-shell" style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <p style={{ color: '#B8BCC8', marginBottom: '10px' }}>Lade Einstellungen...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--rc-mint)] mx-auto"></div>
        </div>
      </div>
    );
  }

  // Create a minimal profile for Sidebar
  const sidebarProfile: Profile = {
    id: 'temp',
    identity: {
      name: accountSettings.name || 'User',
      email: accountSettings.email,
      birthdate: profileData.birth_date || '',
      targetAge: profileData.target_age || 80,
    },
    goal: {
      text: primaryGoal || 'Noch kein Ziel gesetzt',
      source: 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    timePhilosophy: {
      optionId: profileData.guide_personality || 'dividende',
      label: philosophyOptions.find(opt => opt.value === profileData.guide_personality)?.label || 'Zeit als Dividende',
      selectedAt: new Date().toISOString(),
    },
    lifestyle: {
      optionId: 'standard',
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
    journey: [],
    feedback: [],
    isPublic: profileData.is_public,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="settings-shell">
      <Sidebar 
        profile={sidebarProfile} 
        onEditGoal={() => {}} 
        activeSection="overview"
        setActiveSection={() => {}}
      />

      <main className="settings-main">
        <div className="settings-header">
          <h1 className="settings-title">Account-Einstellungen</h1>
          <p className="settings-subtitle">Verwalte deine Account-Daten und Profil-Informationen</p>
        </div>

        {/* Basic Info Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Basis-Informationen</h2>
            <p className="settings-section-description">Name und E-Mail-Adresse</p>
          </div>

          <form onSubmit={handleAccountUpdate} className="settings-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                value={accountSettings.name || ''}
                onChange={(e) => setAccountSettings({ ...accountSettings, name: e.target.value })}
                className="form-input"
                placeholder="Dein Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">E-Mail</label>
              <input
                id="email"
                type="email"
                value={accountSettings.email}
                onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                className="form-input"
                placeholder="deine@email.de"
              />
              {!accountSettings.emailConfirmed && (
                <p className="form-hint">E-Mail-Adresse muss noch bestätigt werden</p>
              )}
            </div>

            {accountError && (
              <div className="form-error">{accountError}</div>
            )}

            {accountSuccess && (
              <div className="form-success">✓ Einstellungen erfolgreich gespeichert</div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={accountLoading}>
                {accountLoading ? 'Speichert...' : 'Speichern'}
              </button>
            </div>
          </form>
        </section>

        {/* Password Section */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Passwort ändern</h2>
            <p className="settings-section-description">Sicherheit deines Accounts</p>
          </div>

          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">Aktuelles Passwort</label>
              <input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">Neues Passwort</label>
              <input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="form-input"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Passwort bestätigen</label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {passwordError && (
              <div className="form-error">{passwordError}</div>
            )}

            {passwordSuccess && (
              <div className="form-success">✓ Passwort erfolgreich geändert</div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                {passwordLoading ? 'Ändert...' : 'Passwort ändern'}
              </button>
            </div>
          </form>
        </section>

        {/* Onboarding Data Section */}
        <section id="profil-daten" className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Profil-Daten</h2>
            <p className="settings-section-description">Onboarding-Informationen bearbeiten</p>
          </div>

          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birthDate" className="form-label">Geburtsdatum</label>
                <input
                  id="birthDate"
                  type="date"
                  value={profileData.birth_date || ''}
                  onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetAge" className="form-label">Zielalter</label>
                <input
                  id="targetAge"
                  type="number"
                  min="18"
                  max="120"
                  value={profileData.target_age || ''}
                  onChange={(e) => setProfileData({ ...profileData, target_age: parseInt(e.target.value) || null })}
                  className="form-input"
                  placeholder="80"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="goal" className="form-label">Ziel / Fokus</label>
              <input
                id="goal"
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="form-input"
                placeholder="Was willst du wirklich?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">Bio</label>
              <textarea
                id="bio"
                value={profileData.bio || ''}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="Kurze Beschreibung über dich..."
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={profileData.is_public}
                  onChange={(e) => setProfileData({ ...profileData, is_public: e.target.checked })}
                  className="form-checkbox"
                />
                <span>Öffentliches Profil</span>
              </label>
            </div>

            {profileError && (
              <div className="form-error">{profileError}</div>
            )}

            {profileSuccess && (
              <div className="form-success">✓ Profil erfolgreich aktualisiert</div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                {profileLoading ? 'Speichert...' : 'Profil speichern'}
              </button>
            </div>
          </form>
        </section>

        {/* Zeit-Profil Section */}
        <section id="zeit-profil" className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Zeit-Profil</h2>
            <p className="settings-section-description">Deine Haltung zur Zeit und dein Alltag setzen den Rahmen für den Guide.</p>
          </div>

          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="form-group">
              <label htmlFor="guidePersonality" className="form-label">Zeit-Philosophie</label>
              <select
                id="guidePersonality"
                value={profileData.guide_personality || ''}
                onChange={(e) => setProfileData({ ...profileData, guide_personality: e.target.value })}
                className="form-select"
              >
                <option value="">Bitte wählen</option>
                {philosophyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="form-hint">Der Guide zeigt dir Impulse, die sich wie Investments anfühlen.</p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                {profileLoading ? 'Speichert...' : 'Speichern'}
              </button>
            </div>
          </form>
        </section>

        {/* Energie-Feeds Section */}
        <section id="energie-feeds" className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Energie-Feeds</h2>
            <p className="settings-section-description">Interessen, Projekte und Sounds, die dein System füttern.</p>
          </div>

          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="form-group">
              <label htmlFor="willLearn" className="form-label">Will lernen</label>
              <input
                id="willLearn"
                type="text"
                value={willLearnInput}
                onChange={(e) => setWillLearnInput(e.target.value)}
                onKeyDown={handleWillLearnKeyDown}
                className="form-input"
                placeholder="Enter zum Hinzufügen"
              />
              <div className="tag-list">
                {profileData.will_learn?.map(tag => (
                  <span key={tag} className="tag" onClick={() => removeWillLearn(tag)}>
                    {tag} ✕
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="willShare" className="form-label">Will teilen</label>
              <input
                id="willShare"
                type="text"
                value={willShareInput}
                onChange={(e) => setWillShareInput(e.target.value)}
                onKeyDown={handleWillShareKeyDown}
                className="form-input"
                placeholder="Enter zum Hinzufügen"
              />
              <div className="tag-list">
                {profileData.will_share?.map(tag => (
                  <span key={tag} className="tag" onClick={() => removeWillShare(tag)}>
                    {tag} ✕
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Musik-DNA</label>
              <p className="form-hint">Verbinde dein Spotify, damit RealityCheck Soundscapes kuratiert.</p>
              <button type="button" className="btn btn-secondary">Verbinde dein Spotify</button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                {profileLoading ? 'Speichert...' : 'Profil speichern'}
              </button>
            </div>
          </form>
        </section>

        {/* Guide-Verhalten Section */}
        <section id="guide-verhalten" className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Guide-Einstellungen</h2>
            <p className="settings-section-description">Ich erinnere dich, wenn es wichtig wird. Nicht nervig, aber konsequent.</p>
          </div>

          <GuideVerhaltenForm />
        </section>

        {/* Account Management Section */}
        <section className="settings-section settings-section-danger">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Account-Verwaltung</h2>
            <p className="settings-section-description">Daten-Export und Account-Löschung</p>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <button
                type="button"
                onClick={handleExportData}
                className="btn btn-secondary"
              >
                Alle Daten exportieren (DSGVO)
              </button>
              <p className="form-hint">Lädt alle deine Account-Daten als JSON-Datei herunter</p>
            </div>

            <div className="form-group">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="btn btn-danger"
              >
                Account löschen
              </button>
              <p className="form-hint form-hint-danger">
                Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten werden dauerhaft gelöscht.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

