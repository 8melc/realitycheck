'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import GoalModal from '@/components/profile/GoalModal';
import { Profile } from '@/types/profile';

interface Interest {
  id: string;
  label: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export default function ZielSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [newProject, setNewProject] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load profile
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userProfile) {
        const profileData: Profile = {
          id: user.id,
          identity: {
            name: userProfile.display_name || 'User',
            email: user.email || '',
            birthdate: userProfile.birth_date || '',
            targetAge: userProfile.target_age || 80,
          },
          goal: {
            text: primaryGoal || 'Noch kein Ziel gesetzt',
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
            optionId: 'standard',
            label: 'Standard',
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
          journey: [],
          feedback: [],
          isPublic: userProfile.is_public ?? true,
          createdAt: userProfile.created_at,
          updatedAt: userProfile.updated_at,
        };
        setProfile(profileData);
      }

      // Load primary goal
      const { data: primaryGoalData } = await supabase
        .from('user_goals')
        .select('title')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (primaryGoalData) {
        setPrimaryGoal(primaryGoalData.title);
      }

      // Load interests
      const interestsRes = await fetch('/api/profile/interests');
      if (interestsRes.ok) {
        const interestsData = await interestsRes.json();
        setInterests(interestsData);
      }

      // Load projects
      const projectsRes = await fetch('/api/profile/projects');
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('[Ziel Settings] Error loading data:', error);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;

    try {
      const response = await fetch('/api/profile/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newInterest.trim() }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Hinzufügen');
      }

      const newInterestData = await response.json();
      setInterests([...interests, newInterestData]);
      setNewInterest('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Fehler beim Hinzufügen');
    }
  };

  const handleDeleteInterest = async (id: string) => {
    try {
      const response = await fetch(`/api/profile/interests?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen');
      }

      setInterests(interests.filter(i => i.id !== id));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Fehler beim Löschen');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.trim()) return;

    try {
      const response = await fetch('/api/profile/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProject.trim(),
          status: 'open',
          priority: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Hinzufügen');
      }

      const newProjectData = await response.json();
      setProjects([...projects, newProjectData]);
      setNewProject('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Fehler beim Hinzufügen');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/profile/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen');
      }

      setProjects(projects.filter(p => p.id !== id));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Fehler beim Löschen');
    }
  };

  const handleGoalSave = async (goal: { text: string; source: Profile['goal']['source'] }) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Nicht authentifiziert');
      }

      // Update goal via onboarding API
      const response = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goal.text,
          goalDirection: 'balance', // Default, kann später erweitert werden
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern des Ziels');
      }

      setPrimaryGoal(goal.text);
      setSuccess(true);
      setIsGoalModalOpen(false);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reload data
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-main-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--rc-mint)] mx-auto"></div>
        <p style={{ color: '#B8BCC8', marginTop: '10px' }}>Lade Daten...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="settings-main-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#F08A8F' }}>Profil nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="settings-main-content">
      <div className="settings-header">
        <h1 className="settings-title">Ziel & Leben</h1>
        <p className="settings-subtitle">Definiere dein Ziel, Interessen und Projekte</p>
      </div>

      {/* Goal Section */}
      <section id="ziel" className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Was willst du wirklich?</h2>
          <p className="settings-section-description">Dein Ziel bestimmt, wie dein Guide arbeitet</p>
        </div>

        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">Aktuelles Ziel</label>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              color: 'var(--rc-cream, #f3efe8)',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
            }}>
              {primaryGoal || 'Noch kein Ziel gesetzt'}
            </div>
          </div>

          {error && (
            <div className="form-error">{error}</div>
          )}

          {success && (
            <div className="form-success">✓ Ziel erfolgreich aktualisiert</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(true)}
              className="btn btn-primary"
              disabled={saving}
            >
              Ziel bearbeiten
            </button>
          </div>
        </div>
      </section>

      {/* Interests Section */}
      <section id="interessen" className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Interessen</h2>
          <p className="settings-section-description">Themen, die dein Guide berücksichtigt</p>
        </div>

        <form onSubmit={handleAddInterest} className="settings-form">
          <div className="form-group">
            <label htmlFor="new-interest" className="form-label">Neue Interesse hinzufügen</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="new-interest"
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="form-input"
                placeholder="z.B. Minimalismus, Produktivität..."
              />
              <button type="submit" className="btn btn-primary">
                Hinzufügen
              </button>
            </div>
          </div>
        </form>

        {interests.length > 0 && (
          <div className="tag-list" style={{ marginTop: '1rem' }}>
            {interests.map((interest) => (
              <div key={interest.id} className="tag">
                <span>{interest.label}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteInterest(interest.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '0',
                    marginLeft: '0.5rem',
                  }}
                  aria-label={`${interest.label} entfernen`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {interests.length === 0 && (
          <p className="form-hint" style={{ marginTop: '1rem' }}>
            Noch keine Interessen hinzugefügt
          </p>
        )}
      </section>

      {/* Projects Section */}
      <section id="projekte" className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Projekte</h2>
          <p className="settings-section-description">Aktive Projekte, die dein Guide kennt</p>
        </div>

        <form onSubmit={handleAddProject} className="settings-form">
          <div className="form-group">
            <label htmlFor="new-project" className="form-label">Neues Projekt hinzufügen</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="new-project"
                type="text"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="form-input"
                placeholder="z.B. Buch schreiben, App entwickeln..."
              />
              <button type="submit" className="btn btn-primary">
                Hinzufügen
              </button>
            </div>
          </div>
        </form>

        {projects.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--rc-cream)' }}>
                    {project.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--rc-steel)', marginTop: '0.25rem' }}>
                    Status: {project.status} • Priorität: {project.priority}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(project.id)}
                  className="btn btn-danger"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        )}

        {projects.length === 0 && (
          <p className="form-hint" style={{ marginTop: '1rem' }}>
            Noch keine Projekte hinzugefügt
          </p>
        )}
      </section>

      {/* Goal Modal */}
      <GoalModal
        open={isGoalModalOpen}
        initialGoal={primaryGoal}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleGoalSave}
      />
    </div>
  );
}

