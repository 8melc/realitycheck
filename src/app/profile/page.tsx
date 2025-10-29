'use client';

import { useState, useEffect } from 'react';

export default function PeopleProfile() {
  const [currentSection, setCurrentSection] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const sections = [
    { id: 'overview', label: 'Überblick', icon: 'fas fa-user' },
    { id: 'zeit', label: 'Zeit-Philosophie', icon: 'fas fa-clock' },
    { id: 'musik', label: 'Musik-DNA', icon: 'fas fa-music' },
    { id: 'projekte', label: 'Projekte', icon: 'fas fa-rocket' },
    { id: 'kontakt', label: 'Kontakt', icon: 'fas fa-envelope' }
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  useEffect(() => {
    setDuration(180); // 3 minutes
  }, []);

  return (
    <div className="min-h-screen bg-fyf-noir text-fyf-cream">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            <div className="avatar-image">SC</div>
            <div className="avatar-status online"></div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">Sarah Chen</h1>
            <p className="profile-role">Digital Nomad & Krypto</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">82%</span>
                <span className="stat-label">Musik-DNA</span>
              </div>
              <div className="stat">
                <span className="stat-value">5</span>
                <span className="stat-label">Jahre Nomad</span>
              </div>
              <div className="stat">
                <span className="stat-value">32</span>
                <span className="stat-label">Sommerurlaube</span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button className="action-btn primary">
              <i className="fas fa-envelope"></i>
              Nachricht
            </button>
            <button className="action-btn secondary">
              <i className="fas fa-heart"></i>
              Connect
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="profile-nav">
        <div className="nav-container">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-item ${currentSection === section.id ? 'active' : ''}`}
              onClick={() => setCurrentSection(section.id)}
            >
              <i className={section.icon}></i>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="profile-content">
        <div className="content-container">
          {currentSection === 'overview' && (
            <div className="section-content">
              <div className="content-grid">
                <div className="content-card">
                  <h3>Über Sarah</h3>
                  <p>Digital Nomad seit 2019. Lebt ihre Vision von Freiheit und Zeit als Währung. Spezialisiert auf Krypto und Remote Work.</p>
                </div>
                <div className="content-card">
                  <h3>Zeit-Philosophie</h3>
                  <p>"Zeit ist die einzige Währung, die wirklich zählt. Geld kann man verdienen, Zeit nicht."</p>
                </div>
                <div className="content-card">
                  <h3>Musik-DNA</h3>
                  <p>82% Overlap bei Moderat, FKA twigs, Four Tet. Liebt experimentelle Elektronik und Ambient.</p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'zeit' && (
            <div className="section-content">
              <div className="zeit-container">
                <div className="zeit-intro">
                  <h2>Zeit-Philosophie</h2>
                  <p>Sarah's Ansatz zu Zeit und Produktivität</p>
                </div>
                
                <div className="zeit-grid">
                  <div className="zeit-card">
                    <div className="zeit-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <h3>Zeit als Währung</h3>
                    <p>Zeit ist die einzige Ressource, die nicht regenerierbar ist. Jede Stunde ist eine Investition.</p>
                  </div>
                  
                  <div className="zeit-card">
                    <div className="zeit-icon">
                      <i className="fas fa-globe"></i>
                    </div>
                    <h3>Remote-First</h3>
                    <p>5 Jahre Nomad-Erfahrung. Arbeitet von überall, wo es WiFi gibt.</p>
                  </div>
                  
                  <div className="zeit-card">
                    <div className="zeit-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <h3>Produktivität</h3>
                    <p>Fokus auf Output, nicht auf Input. Ergebnisse zählen, nicht die Stunden.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'musik' && (
            <div className="section-content">
              <div className="musik-container">
                <div className="musik-intro">
                  <h2>Musik-DNA</h2>
                  <p>82% Overlap - Ihr seid musikalisch verwandt</p>
                </div>
                
                <div className="musik-player">
                  <div className="player-header">
                    <div className="track-info">
                      <h3>Moderat - A New Error</h3>
                      <p>Gemeinsame Lieblings-Tracks</p>
                    </div>
                    <div className="player-controls">
                      <button className="control-btn" onClick={handlePlayPause}>
                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="player-progress">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="progress-bar"
                    />
                    <div className="time-display">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="musik-stats">
                  <div className="stat-item">
                    <span className="stat-label">Gemeinsame Artists</span>
                    <span className="stat-value">23</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Overlap Score</span>
                    <span className="stat-value">82%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Top Genre</span>
                    <span className="stat-value">Electronic</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'projekte' && (
            <div className="section-content">
              <div className="projekte-container">
                <div className="projekte-intro">
                  <h2>Aktuelle Projekte</h2>
                  <p>Was Sarah gerade bewegt</p>
                </div>
                
                <div className="projekte-grid">
                  <div className="projekt-card">
                    <div className="projekt-header">
                      <h3>NomadDAO</h3>
                      <span className="projekt-status active">Aktiv</span>
                    </div>
                    <p>Dezentrale Organisation für Digital Nomads. Community-basiertes Netzwerk.</p>
                    <div className="projekt-tags">
                      <span className="tag">Krypto</span>
                      <span className="tag">DAO</span>
                      <span className="tag">Community</span>
                    </div>
                  </div>
                  
                  <div className="projekt-card">
                    <div className="projekt-header">
                      <h3>TimeCoin</h3>
                      <span className="projekt-status active">Aktiv</span>
                    </div>
                    <p>Kryptowährung basierend auf Zeit-Investition. Zeit als Währung.</p>
                    <div className="projekt-tags">
                      <span className="tag">Blockchain</span>
                      <span className="tag">Zeit</span>
                      <span className="tag">Innovation</span>
                    </div>
                  </div>
                  
                  <div className="projekt-card">
                    <div className="projekt-header">
                      <h3>Remote Work Guide</h3>
                      <span className="projekt-status completed">Abgeschlossen</span>
                    </div>
                    <p>Umfassender Guide für Remote Work. 5 Jahre Erfahrung kompakt.</p>
                    <div className="projekt-tags">
                      <span className="tag">Guide</span>
                      <span className="tag">Remote</span>
                      <span className="tag">Education</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'kontakt' && (
            <div className="section-content">
              <div className="kontakt-container">
                <div className="kontakt-intro">
                  <h2>Kontakt</h2>
                  <p>Verbinde dich mit Sarah</p>
                </div>
                
                <div className="kontakt-grid">
                  <div className="kontakt-card">
                    <div className="kontakt-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <h3>E-Mail</h3>
                    <p>sarah@nomadlife.com</p>
                    <button className="kontakt-btn">Nachricht senden</button>
                  </div>
                  
                  <div className="kontakt-card">
                    <div className="kontakt-icon">
                      <i className="fab fa-linkedin"></i>
                    </div>
                    <h3>LinkedIn</h3>
                    <p>Professional Network</p>
                    <button className="kontakt-btn">Profil ansehen</button>
                  </div>
                  
                  <div className="kontakt-card">
                    <div className="kontakt-icon">
                      <i className="fab fa-twitter"></i>
                    </div>
                    <h3>Twitter</h3>
                    <p>@sarah_nomad</p>
                    <button className="kontakt-btn">Folgen</button>
                  </div>
                  
                  <div className="kontakt-card">
                    <div className="kontakt-icon">
                      <i className="fab fa-instagram"></i>
                    </div>
                    <h3>Instagram</h3>
                    <p>@sarah_nomad_life</p>
                    <button className="kontakt-btn">Folgen</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}