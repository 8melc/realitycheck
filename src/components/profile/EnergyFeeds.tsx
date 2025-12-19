import { useEffect, useState, type KeyboardEvent } from 'react';
import { Profile } from '@/types/profile';
import { ArrowUpRightIcon, ListIcon, UsersIcon, PenSquareIcon } from './icons';
import MusicDNA from './MusicDNA';

interface EnergyFeedsProps {
  profile: Profile;
  onConnectSpotify: () => void;
  onEdit?: () => void;
}

const EnergyFeeds = ({ profile, onConnectSpotify, onEdit }: EnergyFeedsProps) => {
  const [interests, setInterests] = useState(profile.interests ?? []);
  const [projects, setProjects] = useState(profile.projects ?? []);
  const [newInterest, setNewInterest] = useState('');
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  const loadInterests = async () => {
    try {
      const res = await fetch('/api/profile/interests');
      if (!res.ok) throw new Error('Failed to load interests');
      const data = await res.json();
      setInterests(data || []);
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/profile/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  useEffect(() => {
    loadInterests();
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addInterest = async () => {
    if (!newInterest.trim()) return;
    setIsAddingInterest(true);
    try {
      const res = await fetch('/api/profile/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newInterest.trim() }),
      });
      if (!res.ok) throw new Error('Failed to add interest');
      await loadInterests();
      setNewInterest('');
    } catch (error) {
      console.error('Error adding interest:', error);
    } finally {
      setIsAddingInterest(false);
    }
  };

  const handleAddInterest = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    await addInterest();
  };

  const handleDeleteInterest = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/interests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete interest');
      await loadInterests();
    } catch (error) {
      console.error('Error deleting interest:', error);
    }
  };

  const handleAddProject = async () => {
    if (!newProjectTitle.trim()) return;
    setIsAddingProject(true);
    try {
      const res = await fetch('/api/profile/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newProjectTitle.trim(), status: 'active' }),
      });
      if (!res.ok) throw new Error('Failed to add project');
      await loadProjects();
      setNewProjectTitle('');
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsAddingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const topInterests = interests.slice(0, 4);

  return (
    <section id="energie-feeds" className="rc-card motion-fade-up" aria-labelledby="energy-feeds-heading">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 id="energy-feeds-heading" className="rc-subheading">
            Energie-Feeds
          </h2>
          <p className="rc-microcopy">Interessen, Projekte und Sounds, die dein System füttern.</p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rc-subcard">
          <div className="rc-subcard__icon">
            <ListIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="rc-subcard__title">Interessen</h3>
              <p className="rc-subcard__body">
                Top-Felder, die deine Perspektive formen. Alles, was RealityCheck kuratiert, zahlt auf diese Themen ein.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {topInterests.length === 0 ? (
                <span className="rc-chip rc-chip--ghost">Noch keine Interessen hinterlegt</span>
              ) : (
                topInterests.map((interest) => (
                  <span key={interest.id} className="rc-chip inline-flex items-center gap-2">
                    {interest.label}
                    <button
                      type="button"
                      aria-label={`Interesse ${interest.label} löschen`}
                      className="text-rc-steel hover:text-rc-coral transition"
                      onClick={() => handleDeleteInterest(interest.id)}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={handleAddInterest}
                placeholder="Interesse hinzufügen..."
                disabled={isAddingInterest}
                className="rc-input"
              />
              <button
                type="button"
                onClick={addInterest}
                disabled={isAddingInterest || !newInterest.trim()}
                className="rc-btn rc-btn--ghost whitespace-nowrap"
              >
                Hinzufügen
              </button>
            </div>
            <button type="button" className="rc-link inline-flex items-center gap-2">
              Alle anzeigen
              <ArrowUpRightIcon className="h-4 w-4" />
            </button>
          </div>
        </article>

        <article className="rc-subcard">
          <div className="rc-subcard__icon">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="rc-subcard__title">Projekte</h3>
              <p className="rc-subcard__body">
                Was derzeit deine Energie bindet. RealityCheck priorisiert dir Actions, die diese Projekte pushen.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Projekt hinzufügen..."
                disabled={isAddingProject}
                className="rc-input"
              />
              <button
                type="button"
                onClick={handleAddProject}
                disabled={isAddingProject || !newProjectTitle.trim()}
                className="rc-btn rc-btn--ghost whitespace-nowrap"
              >
                + Projekt
              </button>
            </div>
            {projects.length === 0 ? (
              <span className="rc-chip rc-chip--ghost">Noch keine Projekte definiert</span>
            ) : (
              <ul className="flex flex-col gap-3 text-sm text-rc-cream">
                {projects.slice(0, 3).map((project) => (
                  <li key={project.id} className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{project.title}</span>
                      {project.description && <span className="text-xs text-rc-steel">{project.description}</span>}
                    </div>
                    <button
                      type="button"
                      aria-label={`Projekt ${project.title} löschen`}
                      className="text-rc-steel hover:text-rc-coral transition"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <MusicDNA musicDNA={profile.musicDNA} onConnect={onConnectSpotify} />

        <article className="rc-subcard rc-subcard--muted">
          <div className="rc-subcard__icon">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="rc-subcard__title">Matching</h3>
            <p className="rc-subcard__body">
              Kommt bald: kuratierte Menschen, die deine Zeitlogik teilen. Basis: Musik-DNA, Interessen, Ziel.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default EnergyFeeds;
