'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AvatarSettings from '@/components/profile/AvatarSettings';

interface AccountSettings {
  email: string;
  name: string | null;
  emailConfirmed: boolean;
  avatarUrl: string | null;
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
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

      setUserId(user.id);

      // Load account settings
      const accountRes = await fetch('/api/user/settings');
      if (accountRes.ok) {
        const accountData = await accountRes.json();
        setAccountSettings(accountData);
      }
    } catch (error) {
      console.error('[Account Settings] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="settings-main-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--rc-mint)] mx-auto"></div>
        <p style={{ color: '#B8BCC8', marginTop: '10px' }}>Lade Daten...</p>
      </div>
    );
  }

  return (
    <div className="settings-main-content">
      <div className="settings-header">
        <h1 className="settings-title">Account-Einstellungen</h1>
        <p className="settings-subtitle">Verwalte deine Account-Daten und Profil-Informationen</p>
      </div>

              {/* Basic Info Section */}
              <section id="basis" className="settings-section">
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

      {/* Avatar Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Profilbild</h2>
          <p className="settings-section-description">Wähle dein Avatar: Initialen, eigenes Bild oder KI-generiert</p>
        </div>

        {userId ? (
          <AvatarSettings userId={userId} />
        ) : (
          <div className="settings-form">
            <p style={{ color: 'var(--rc-steel, #9ca3af)', textAlign: 'center' }}>
              Lade Benutzerdaten...
            </p>
          </div>
        )}
      </section>

              {/* Password Section */}
              <section id="passwort" className="settings-section">
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
              placeholder="Aktuelles Passwort"
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
              placeholder="Passwort wiederholen"
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

      {/* Danger Zone */}
      <section id="account-loeschen" className="settings-section settings-section-danger">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Account löschen</h2>
          <p className="settings-section-description">
            Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden dauerhaft gelöscht.
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="btn btn-danger"
          >
            Account löschen
          </button>
        </div>
      </section>
    </div>
  );
}

