'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface ProfileCompleteData {
  display_name: string;
  avatar_url: string | null;
  is_public: boolean;
  observatory_onboarding_completed: boolean;
}

export default function ProfileCompletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [hasAvatar, setHasAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load current profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setUserId(user.id);

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('display_name, avatar_url, is_public, observatory_onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
          setError('Fehler beim Laden des Profils');
          setLoading(false);
          return;
        }

        if (profile) {
          setDisplayName(profile.display_name || '');
          setHasAvatar(!!profile.avatar_url);
          setAvatarUrl(profile.avatar_url);
          setIsPublic(profile.is_public || false);
          if (profile.avatar_url) {
            setPreviewUrl(profile.avatar_url);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in loadProfile:', err);
        setError('Fehler beim Laden des Profils');
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Bitte wähle eine Bilddatei');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Bild ist zu groß. Maximal 5MB erlaubt.');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!selectedFile || !userId) return;

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/profile/avatar/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Hochladen des Bildes');
      }

      const data = await response.json();
      setAvatarUrl(data.avatar_url);
      setHasAvatar(true);
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Fehler beim Hochladen des Bildes');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Bitte gib einen Anzeigenamen ein');
      return;
    }

    // Upload avatar if new file selected
    if (selectedFile && !hasAvatar) {
      await handleAvatarUpload();
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          is_public: isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rc-noir flex items-center justify-center">
        <div className="text-rc-cream">Lade...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rc-noir">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-rc-cream mb-3">
            Profil fast fertig
          </h1>
          <p className="text-rc-steel">
            Dein Guide funktioniert bereits.<br />
            Mit zwei kleinen Angaben wird dein Profil für andere verständlich.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Display Name */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-rc-cream mb-2">
              Anzeigename
            </label>
            <p className="text-sm text-rc-steel mb-3">
              So erscheinst du im Beobachtungsraum (People).
            </p>
            <input
              id="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Dein Name"
              required
              className="w-full px-4 py-3 bg-rc-charcoal border border-rc-steel/30 rounded-lg text-rc-cream placeholder-rc-steel focus:outline-none focus:border-rc-mint transition-colors"
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-rc-cream mb-2">
              Profilbild
            </label>
            <p className="text-sm text-rc-steel mb-3">
              Optional. Ein Bild erhöht Wiedererkennung, ist aber kein Muss.
            </p>

            <div className="flex items-center gap-6">
              {/* Avatar Preview */}
              <div className="flex-shrink-0">
                {userId && previewUrl && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-rc-mint/30">
                    <img 
                      src={previewUrl} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {userId && !previewUrl && (
                  <div className="w-24 h-24 rounded-full bg-rc-charcoal border-2 border-rc-mint/30 flex items-center justify-center text-2xl font-bold text-rc-mint">
                    {(displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="avatar"
                  className="inline-block px-4 py-2 bg-rc-charcoal border border-rc-steel/30 rounded-lg text-rc-cream cursor-pointer hover:border-rc-mint transition-colors"
                >
                  {hasAvatar || previewUrl ? 'Bild ändern' : 'Bild hochladen'}
                </label>
                {selectedFile && !hasAvatar && (
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={submitting}
                    className="ml-3 px-4 py-2 bg-rc-mint text-rc-noir rounded-lg font-medium hover:bg-rc-mint/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Lädt...' : 'Hochladen'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div>
            <label className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded border-rc-steel/30 bg-rc-charcoal text-rc-mint focus:ring-rc-mint focus:ring-2"
              />
              <span className="text-sm font-medium text-rc-cream">
                Im Beobachtungsraum (People) sichtbar sein
              </span>
            </label>
            <p className="text-sm text-rc-steel ml-8">
              Dein Profil ist für andere sichtbar. Das kannst du jederzeit ändern.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rc-coral/20 border border-rc-coral/50 rounded-lg text-rc-coral">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || !displayName.trim()}
              className="w-full px-6 py-3 bg-rc-mint text-rc-noir font-semibold rounded-lg hover:bg-rc-mint/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Speichere...' : 'Profil abschließen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

