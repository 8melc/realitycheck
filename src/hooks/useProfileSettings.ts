'use client';

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export function useProfileSettings(initialProfile: any) {
  const [focusTopic, setFocusTopic] = useState<string>('');
  const [willLearn, setWillLearn] = useState<string[]>([]);
  const [willShare, setWillShare] = useState<string[]>([]);
  const [bio, setBio] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [guidePersonality, setGuidePersonality] = useState<string>('');
  const [lifestyle, setLifestyle] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if there are unsaved changes
  const hasChanges = initialProfile ? (
    focusTopic !== (initialProfile.focus_topic || '') ||
    JSON.stringify(willLearn) !== JSON.stringify(initialProfile.will_learn || []) ||
    JSON.stringify(willShare) !== JSON.stringify(initialProfile.will_share || []) ||
    bio !== (initialProfile.bio || '') ||
    isPublic !== (initialProfile.is_public ?? true) ||
    guidePersonality !== (initialProfile.guide_personality || '') ||
    lifestyle !== (initialProfile.lifestyle || '')
  ) : false;

  // Initialize states when initialProfile is available
  useEffect(() => {
    if (initialProfile) {
      setFocusTopic(initialProfile.focus_topic || '');
      setWillLearn(initialProfile.will_learn || []);
      setWillShare(initialProfile.will_share || []);
      setBio(initialProfile.bio || '');
      setIsPublic(initialProfile.is_public ?? true);
      setGuidePersonality(initialProfile.guide_personality || '');
      setLifestyle(initialProfile.lifestyle || '');
    }
  }, [initialProfile]);

  async function handleSaveProfileSettings() {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // 1. aktuellen User holen
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Kein eingeloggter User gefunden.');
      }

      // 2. Payload vorbereiten
      const payload = {
        focus_topic: focusTopic || null,
        will_learn: willLearn.length ? willLearn : null,
        will_share: willShare.length ? willShare : null,
        bio: bio || null,
        is_public: isPublic,
        guide_personality: guidePersonality || null,
        lifestyle: lifestyle || null,
        updated_at: new Date().toISOString(),
      };

      // 3. Update in user_profiles
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(updateError.message || 'Profil konnte nicht gespeichert werden.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return { success: true, payload };
    } catch (err: any) {
      setSaveError(err.message || 'Fehler beim Speichern.');
      return { success: false, error: err };
    } finally {
      setIsSaving(false);
    }
  }

  return {
    focusTopic,
    setFocusTopic,
    willLearn,
    setWillLearn,
    willShare,
    setWillShare,
    bio,
    setBio,
    isPublic,
    setIsPublic,
    guidePersonality,
    setGuidePersonality,
    lifestyle,
    setLifestyle,
    isSaving,
    saveError,
    saveSuccess,
    hasChanges,
    handleSaveProfileSettings,
  };
}
