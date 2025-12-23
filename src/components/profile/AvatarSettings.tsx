'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import UserAvatar from '@/components/UserAvatar';

type AvatarType = 'initials' | 'upload' | 'generated';
type AvatarStyle = 'avataaars' | 'personas' | 'bottts' | 'micah' | 'lorelei';

const AVATAR_STYLES: Array<{ value: AvatarStyle; label: string; desc: string }> = [
  { value: 'avataaars', label: 'Avataaars', desc: 'Standard, Cartoon-Style' },
  { value: 'personas', label: 'Personas', desc: 'Minimalistisch' },
  { value: 'bottts', label: 'Bottts', desc: 'Roboter' },
  { value: 'micah', label: 'Micah', desc: 'Ilustrativ' },
  { value: 'lorelei', label: 'Lorelei', desc: 'Abstrakt' },
];

interface AvatarSettingsProps {
  userId: string;
}

export default function AvatarSettings({ userId }: AvatarSettingsProps) {
  const [avatarType, setAvatarType] = useState<AvatarType>('initials');
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('avataaars');
  const [avatarSeed, setAvatarSeed] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialState, setInitialState] = useState<{
    avatarType: AvatarType;
    avatarStyle: AvatarStyle;
    avatarSeed: string;
  } | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load current settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('avatar_type, avatar_style, avatar_seed, avatar_url, display_name')
          .eq('user_id', userId)
          .maybeSingle<{
            avatar_type?: string | null;
            avatar_style?: string | null;
            avatar_seed?: string | null;
            avatar_url?: string | null;
            display_name?: string | null;
          }>();

        if (profileError) {
          console.error('[AvatarSettings] Error fetching profile:', profileError);
          setLoading(false);
          return;
        }

        // Get user email
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }

        const currentType = ((profile?.avatar_type as AvatarType) || 'initials') as AvatarType;
        const currentStyle = ((profile?.avatar_style as AvatarStyle) || 'avataaars') as AvatarStyle;
        const currentSeed = profile?.avatar_seed || user?.email || userId;

        setAvatarType(currentType);
        setAvatarStyle(currentStyle);
        setAvatarSeed(currentSeed);
        setDisplayName(profile?.display_name || '');

        // Save initial state for change detection
        setInitialState({
          avatarType: currentType,
          avatarStyle: currentStyle,
          avatarSeed: currentSeed,
        });

        if (currentType === 'upload' && profile?.avatar_url) {
          setPreviewUrl(profile.avatar_url);
        }
      } catch (err: any) {
        console.error('[AvatarSettings] Error loading settings:', err);
        setError(err.message || 'Fehler beim Laden der Einstellungen');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  // Check for changes
  useEffect(() => {
    if (!initialState) return;

    const changed =
      avatarType !== initialState.avatarType ||
      (avatarType === 'generated' && (avatarStyle !== initialState.avatarStyle || avatarSeed !== initialState.avatarSeed)) ||
      (avatarType === 'upload' && selectedFile !== null);

    setHasChanges(changed);
  }, [avatarType, avatarStyle, avatarSeed, selectedFile, initialState]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      setError('Bild zu groß (max 2MB)');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Nur JPG, PNG oder WEBP erlaubt');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Generate random seed for "new avatar"
  const generateRandomSeed = () => {
    const newSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    setAvatarSeed(newSeed);
  };

  // Save settings
  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // If upload type and file selected, upload first
      if (avatarType === 'upload' && selectedFile) {
        setUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/profile/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        // Check content type before parsing JSON
        const contentType = uploadResponse.headers.get('content-type') || '';
        if (!uploadResponse.ok) {
          let errorMessage = 'Fehler beim Hochladen';
          if (contentType.includes('application/json')) {
            try {
              const uploadError = await uploadResponse.json();
              errorMessage = uploadError.error || errorMessage;
            } catch (parseError) {
              const text = await uploadResponse.text();
              errorMessage = `Upload fehlgeschlagen (${uploadResponse.status}): ${text.slice(0, 100)}`;
            }
          } else {
            const text = await uploadResponse.text();
            errorMessage = `Unerwartete Antwort (${uploadResponse.status}): ${text.slice(0, 100)}`;
          }
          throw new Error(errorMessage);
        }

        // Ensure response is JSON before parsing
        if (!contentType.includes('application/json')) {
          const text = await uploadResponse.text();
          throw new Error(`Server antwortete nicht mit JSON: ${text.slice(0, 100)}`);
        }

        setUploading(false);
        setSelectedFile(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

        // Update initial state
        setInitialState({
          avatarType: 'upload',
          avatarStyle: avatarStyle,
          avatarSeed: avatarSeed,
        });

        setSaving(false);
        return;
      }

      // For other types, update via PUT
      const updateData: {
        avatar_type: AvatarType;
        avatar_seed?: string;
        avatar_style?: AvatarStyle;
      } = {
        avatar_type: avatarType,
      };

      if (avatarType === 'generated') {
        updateData.avatar_seed = avatarSeed || userEmail || userId;
        updateData.avatar_style = avatarStyle;
      } else if (avatarType === 'initials') {
        // No additional data needed
      }

      const response = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        let errorMessage = 'Fehler beim Speichern';
        if (contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            const text = await response.text();
            errorMessage = `Speichern fehlgeschlagen (${response.status}): ${text.slice(0, 100)}`;
          }
        } else {
          const text = await response.text();
          errorMessage = `Unerwartete Antwort (${response.status}): ${text.slice(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      // Ensure response is JSON
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server antwortete nicht mit JSON: ${text.slice(0, 100)}`);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Update initial state
      setInitialState({
        avatarType,
        avatarStyle,
        avatarSeed: avatarSeed || userEmail || userId,
      });

      setSelectedFile(null);
    } catch (err: any) {
      console.error('[AvatarSettings] Error saving:', err);
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Delete uploaded avatar
  const handleDeleteUpload = async () => {
    if (!userId) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/avatar/upload', {
        method: 'DELETE',
      });

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        let errorMessage = 'Fehler beim Löschen';
        if (contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            const text = await response.text();
            errorMessage = `Löschen fehlgeschlagen (${response.status}): ${text.slice(0, 100)}`;
          }
        } else {
          const text = await response.text();
          errorMessage = `Unerwartete Antwort (${response.status}): ${text.slice(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      setPreviewUrl(null);
      setSelectedFile(null);
      setAvatarType('initials');

      // Update initial state
      setInitialState({
        avatarType: 'initials',
        avatarStyle,
        avatarSeed: avatarSeed || userEmail || userId,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('[AvatarSettings] Error deleting:', err);
      setError(err.message || 'Fehler beim Löschen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-form">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--rc-steel, #9ca3af)' }}>
          Lade Avatar-Einstellungen...
        </div>
      </div>
    );
  }

  // Get preview seed for generated avatars
  const previewSeed = avatarSeed || userEmail || userId;

  // Calculate responsive avatar size
  const avatarSize = 'clamp(96px, 12vw, 160px)';

  return (
    <div style={{ 
      maxWidth: '1100px', 
      width: 'min(1100px, 100% - 64px)',
      margin: '0 auto',
      padding: '0 1rem'
    }}>
      {/* Responsive Grid Layout: 2 Spalten Desktop (lg+), 1 Spalte Mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}
      className="lg:grid-cols-[minmax(320px,420px)_1fr]">
        
        {/* Spalte 1: Preview (Links auf Desktop, Oben auf Mobile) */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '200px',
          justifyContent: 'flex-start',
          padding: '1rem',
          maxWidth: '420px',
          margin: '0 auto'
        }}
        className="lg:max-w-none lg:m-0">
          <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', width: '100%', textAlign: 'center' }}>Vorschau</label>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              width: avatarSize,
              height: avatarSize,
              maxWidth: '160px',
              maxHeight: '160px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {avatarType === 'upload' && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar Vorschau"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid rgba(78, 205, 196, 0.4)',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{ 
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserAvatar
                    userId={userId}
                    size="md"
                    displayName={displayName}
                    email={userEmail}
                    style={{
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Save Button - In Preview Column */}
          <div className="form-actions" style={{ width: '100%' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading || !hasChanges}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: saving || uploading || !hasChanges ? 'rgba(156, 163, 175, 0.3)' : 'var(--rc-mint, #00D9FF)',
                color: saving || uploading || !hasChanges ? 'var(--rc-steel, #9ca3af)' : '#000',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: saving || uploading || !hasChanges ? 'not-allowed' : 'pointer',
                opacity: saving || uploading || !hasChanges ? 0.6 : 1,
                border: 'none'
              }}
            >
              {uploading ? 'Hochladen...' : saving ? 'Speichern...' : 'Avatar speichern'}
            </button>
          </div>
        </div>

        {/* Spalte 2: Controls (Rechts auf Desktop, Unten auf Mobile) */}
        <div>
          {/* Avatar Type Selection */}
          <div className="form-group">
            <label className="form-label">Avatar-Typ</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {/* Initials Option */}
          <button
            type="button"
            onClick={() => {
              setAvatarType('initials');
              setError(null);
            }}
            disabled={saving || uploading}
            className={`btn ${avatarType === 'initials' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: avatarType === 'initials' ? '2px solid var(--rc-mint, #00D9FF)' : '2px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: avatarType === 'initials' ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s',
              cursor: saving || uploading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              color: 'var(--rc-cream, #f3efe8)',
              opacity: saving || uploading ? 0.6 : 1
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Initialen</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--rc-steel, #9ca3af)' }}>Zeigt deine Initialen in farbigem Kreis</div>
          </button>

          {/* Upload Option */}
          <button
            type="button"
            onClick={() => {
              setAvatarType('upload');
              setError(null);
            }}
            disabled={saving || uploading}
            className={`btn ${avatarType === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: avatarType === 'upload' ? '2px solid var(--rc-mint, #00D9FF)' : '2px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: avatarType === 'upload' ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s',
              cursor: saving || uploading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              color: 'var(--rc-cream, #f3efe8)',
              opacity: saving || uploading ? 0.6 : 1
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Eigenes Bild hochladen</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--rc-steel, #9ca3af)' }}>JPG, PNG oder WEBP, max. 2MB</div>
          </button>

          {/* Generated Option */}
          <button
            type="button"
            onClick={() => {
              setAvatarType('generated');
              setError(null);
            }}
            disabled={saving || uploading}
            className={`btn ${avatarType === 'generated' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: avatarType === 'generated' ? '2px solid var(--rc-mint, #00D9FF)' : '2px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: avatarType === 'generated' ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s',
              cursor: saving || uploading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              color: 'var(--rc-cream, #f3efe8)',
              opacity: saving || uploading ? 0.6 : 1
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>KI-generierter Avatar</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--rc-steel, #9ca3af)' }}>Wähle aus verschiedenen Styles</div>
          </button>
            </div>
          </div>

          {/* Upload Zone - Kompakt */}
          {avatarType === 'upload' && (
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem' }}>Bild hochladen</label>
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              minHeight: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--rc-mint, #00D9FF)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
                }
              }}
              style={{ display: 'none' }}
            />
            {previewUrl ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '1rem',
                width: '100%'
              }}>
                <img
                  src={previewUrl}
                  alt="Vorschau"
                  style={{
                    maxWidth: '160px',
                    maxHeight: '160px',
                    width: 'auto',
                    height: 'auto',
                    borderRadius: '0.5rem',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      fileInputRef.current!.value = '';
                    }}
                    className="btn btn-secondary"
                  >
                    Anderes Bild wählen
                  </button>
                  {initialState?.avatarType === 'upload' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUpload();
                      }}
                      disabled={saving}
                      className="btn btn-danger"
                    >
                      Bild löschen
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                <div style={{ color: 'var(--rc-cream, #f3efe8)', marginBottom: '0.5rem', textAlign: 'center' }}>
                  Klicke hier oder ziehe ein Bild hierher
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--rc-steel, #9ca3af)', textAlign: 'center' }}>
                  JPG, PNG oder WEBP, max. 2MB
                </div>
              </div>
            )}
          </div>
        </div>
      )}

          {/* Generated Avatar Options */}
          {avatarType === 'generated' && (
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem' }}>Avatar-Style</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '0.5rem',
                  marginTop: '0.75rem',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setAvatarStyle(style.value)}
                    disabled={saving || uploading}
                    className={`btn ${avatarStyle === style.value ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: avatarStyle === style.value ? '2px solid var(--rc-mint, #00D9FF)' : '2px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: avatarStyle === style.value ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                      transition: 'all 0.2s',
                      cursor: saving || uploading ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      color: 'var(--rc-cream, #f3efe8)',
                      minHeight: '100px',
                      opacity: saving || uploading ? 0.6 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <img
                      src={`https://api.dicebear.com/9.x/${style.value}/svg?seed=${encodeURIComponent(previewSeed)}`}
                      alt={style.label}
                      style={{
                        width: '48px',
                        height: '48px',
                        marginBottom: '0.5rem',
                        borderRadius: '50%',
                        display: 'block',
                        margin: '0 auto 0.5rem auto'
                      }}
                    />
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{style.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--rc-steel, #9ca3af)' }}>{style.desc}</div>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={generateRandomSeed}
                  disabled={saving || uploading}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                  }}
                >
                  🎲 Neuer Avatar
                </button>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div
              className="form-error"
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                color: '#FCA5A5',
                borderRadius: '0.5rem',
                marginTop: '1rem',
                border: '1px solid rgba(220, 38, 38, 0.3)',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="form-success"
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                color: '#6EE7B7',
                borderRadius: '0.5rem',
                marginTop: '1rem',
                border: '1px solid rgba(5, 150, 105, 0.3)',
              }}
            >
              ✓ Avatar erfolgreich aktualisiert
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
