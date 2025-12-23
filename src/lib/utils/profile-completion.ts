import type { UserProfile } from '@/lib/types/database.types';

export interface ProfileCompletionStatus {
  score: number; // 0-100
  missingItems: string[];
  isComplete: boolean;
}

/**
 * Berechnet den Profile Completion Score
 * Phase 3 Completion erfordert:
 * - display_name (nicht null, nicht "RealityCheck User")
 * - avatar_url (optional, aber empfohlen)
 * - observatory_onboarding_completed = true (Sichtbarkeit bewusst bestätigt)
 */
export function calculateProfileCompletion(profile: UserProfile | null): ProfileCompletionStatus {
  if (!profile) {
    return {
      score: 0,
      missingItems: ['Profil nicht gefunden'],
      isComplete: false,
    };
  }

  const missingItems: string[] = [];
  let score = 0;

  // Check display_name (required für Phase 3)
  const hasDisplayName = profile.display_name && 
    profile.display_name.trim() !== '' && 
    profile.display_name !== 'RealityCheck User' &&
    profile.display_name !== 'User';
  
  if (!hasDisplayName) {
    missingItems.push('Anzeigename');
  } else {
    score += 40; // 40% für display_name
  }

  // Check avatar_url (optional, aber empfohlen)
  const hasAvatar = profile.avatar_url && profile.avatar_url.trim() !== '';
  if (!hasAvatar) {
    missingItems.push('Profilbild (optional)');
  } else {
    score += 30; // 30% für avatar
  }

  // Check observatory_onboarding_completed (required für Phase 3)
  const hasObservatoryCompleted = profile.observatory_onboarding_completed === true;
  if (!hasObservatoryCompleted) {
    missingItems.push('Sichtbarkeit im Beobachtungsraum');
  } else {
    score += 30; // 30% für observatory completion
  }

  return {
    score: Math.min(score, 100),
    missingItems,
    isComplete: score === 100 && missingItems.length === 0,
  };
}

/**
 * Prüft, ob Phase 3 Completion-Modul angezeigt werden soll
 * Wird angezeigt wenn mindestens eines fehlt:
 * - display_name
 * - avatar_url (optional, aber empfohlen)
 * - observatory_onboarding_completed
 */
export function shouldShowPhase3Completion(profile: UserProfile | null): boolean {
  if (!profile) return false;

  const completion = calculateProfileCompletion(profile);
  
  // Zeige Phase 3 wenn nicht komplett und mindestens ein Item fehlt
  return !completion.isComplete && completion.missingItems.length > 0;
}

