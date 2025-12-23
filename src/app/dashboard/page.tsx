import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLifeInWeeksDataForUser } from '@/lib/domain/lifeInWeeks';
import type { UserProfile } from '@/lib/types/database.types';
import { calculateProfileCompletion, shouldShowPhase3Completion } from '@/lib/utils/profile-completion';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single<UserProfile>();

  if (profileError || !profile) {
    redirect('/onboarding');
  }

  // Get primary goal if exists
  const { data: primaryGoal } = await supabase
    .from('user_goals')
    .select('title')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single();

  // Calculate life-in-weeks data
  const lifeData = getLifeInWeeksDataForUser(
    profile.birth_date,
    profile.target_age
  );

  // Check Phase 3 completion status
  const completionStatus = calculateProfileCompletion(profile);
  const showPhase3Completion = shouldShowPhase3Completion(profile);

  // Check if user just completed onboarding
  const justCompletedOnboarding = (profile as any).onboarding_completed && !profile.observatory_onboarding_completed;

  // Check if profile is incomplete (First-Run)
  const isProfileIncomplete = !primaryGoal || 
    !profile.bio || 
    !profile.avatar_url || 
    !profile.answer_style || 
    !profile.guide_tone ||
    profile.answer_style === 'medium' && profile.guide_tone === 'Straight'; // Default values

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* TOP-BANNER für neue User nach Onboarding oder unvollständiges Profil */}
      {(justCompletedOnboarding || isProfileIncomplete) && (
        <div className="bg-gradient-to-r from-rc-mint/10 to-rc-coral/10 p-6 rounded-xl border-2 border-rc-mint/30 shadow-lg">
          <h2 className="text-2xl font-bold mb-2 text-rc-cream">Profil fast eingerichtet</h2>
          <p className="text-rc-steel mb-4" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
            Dein Guide kann präziser arbeiten, wenn dein Profil vollständig ist.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/user/settings"
              className="inline-block px-6 py-3 bg-rc-mint text-rc-noir font-semibold rounded-lg hover:bg-rc-mint/90 transition-colors"
            >
              Profil vervollständigen
            </Link>
            <Link
              href="/feedboard"
              className="inline-block px-6 py-3 bg-transparent text-rc-mint border-2 border-rc-mint font-semibold rounded-lg hover:bg-rc-mint/10 transition-colors"
            >
              Guide starten
            </Link>
          </div>
        </div>
      )}

      {/* Profil-Kachel */}
      <div className="bg-white dark:bg-rc-carbon p-6 rounded-xl shadow-lg">
        <p className="text-xl text-rc-steel">
          Willkommen, <strong className="text-rc-mint">{profile.display_name || 'RealityCheck User'}</strong>
        </p>
      </div>

      {/* Life-in-Weeks Grid */}
      {lifeData && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-rc-carbon to-rc-charcoal p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6 text-rc-cream">Deine Zeit</h2>
            <div className="grid grid-cols-52 gap-px bg-rc-smoke p-4 rounded-lg">
              {Array.from({ length: lifeData.totalWeeks }, (_, i) => {
                const isPast = i < lifeData.weeksLived;
                const isCurrent = i === lifeData.weeksLived;
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded transition-all cursor-pointer ${
                      isPast
                        ? 'bg-rc-coral'
                        : isCurrent
                        ? 'bg-rc-mint'
                        : 'bg-rc-steel/30'
                    } hover:opacity-80`}
                    title={`Woche ${i + 1}`}
                  />
                );
              })}
            </div>
            <div className="mt-4 text-sm text-rc-steel">
              <p>Wochen gelebt: {lifeData.weeksLived.toLocaleString()}</p>
              <p>Wochen verbleibend: {lifeData.weeksRemaining.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-rc-mint/10 p-6 rounded-xl border border-rc-mint/20">
              <div className="text-3xl font-bold text-rc-mint">
                {lifeData.remainingSummers.toLocaleString()}
              </div>
              <div className="text-sm text-rc-steel mt-2">Sommer übrig</div>
            </div>
            <div className="bg-rc-coral/10 p-6 rounded-xl border border-rc-coral/20">
              <div className="text-3xl font-bold text-rc-coral">
                {lifeData.remainingWeekends.toLocaleString()}
              </div>
              <div className="text-sm text-rc-steel mt-2">Wochenenden übrig</div>
            </div>
            <div className="bg-rc-charcoal p-6 rounded-xl border border-rc-steel/20">
              <div className="text-3xl font-bold text-rc-cream">
                {lifeData.percentageLived}%
              </div>
              <div className="text-sm text-rc-steel mt-2">gelebt</div>
            </div>
          </div>
        </div>
      )}

      {/* Ziel */}
      <div className="bg-white dark:bg-rc-carbon p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-rc-mint">Dein Ziel</h3>
        <p className="text-lg text-rc-steel mb-4">
          {(primaryGoal as { title: string } | null)?.title || 'Noch keines gesetzt'}
        </p>
        {primaryGoal && (
          <p className="text-sm text-rc-steel italic" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            Ich nutze dein Ziel, deine Interessen und deine Einstellungen, um dir relevante Impulse zu geben.
          </p>
        )}
      </div>

      {/* Phase 3: Profil fast fertig */}
      {showPhase3Completion && (
        <div className="bg-gradient-to-r from-rc-mint/10 to-rc-coral/10 p-8 rounded-xl border-2 border-rc-mint/30 shadow-lg">
          <h2 className="text-2xl font-bold mb-2 text-rc-cream">Profil fast eingerichtet</h2>
          <p className="text-rc-steel mb-6">
            Dein Guide funktioniert bereits.<br />
            Mit zwei kleinen Angaben wird dein Profil für andere verständlich.
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-rc-steel">Profil-Fortschritt</span>
              <span className="text-sm font-semibold text-rc-mint">{completionStatus.score}%</span>
            </div>
            <div className="w-full h-3 bg-rc-charcoal rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rc-mint to-rc-coral transition-all duration-300"
                style={{ width: `${completionStatus.score}%` }}
              />
            </div>
          </div>

          {/* Missing Items */}
          {completionStatus.missingItems.length > 0 && (
            <div className="mb-6 space-y-2">
              <p className="text-sm font-medium text-rc-steel mb-2">Noch zu erledigen:</p>
              <ul className="space-y-2">
                {completionStatus.missingItems.map((item, index) => (
                  <li key={index} className="flex items-center text-rc-steel">
                    <span className="w-2 h-2 rounded-full bg-rc-coral mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/profile/complete"
            className="inline-block px-6 py-3 bg-rc-mint text-rc-noir font-semibold rounded-lg hover:bg-rc-mint/90 transition-colors"
          >
            Profil vervollständigen
          </Link>
        </div>
      )}

      {/* Observatory CTA (nur wenn Phase 3 nicht angezeigt wird) */}
      {!showPhase3Completion && !profile.observatory_onboarding_completed && (
        <div className="bg-gradient-to-r from-rc-mint/10 to-rc-coral/10 p-6 rounded-xl border border-rc-mint/20">
          <h3 className="text-xl font-semibold mb-2 text-rc-cream">People</h3>
          <p className="text-rc-steel mb-4">
            Teile deine Zeitperspektive mit anderen Menschen im People-Bereich.
          </p>
          <a
            href="/onboarding/observatory"
            className="inline-block px-6 py-3 bg-rc-mint text-rc-noir font-semibold rounded-lg hover:bg-rc-mint/90 transition-colors"
          >
            Teil des People-Bereichs werden
          </a>
        </div>
      )}
    </div>
  );
}

