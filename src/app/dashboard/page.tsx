import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLifeInWeeksDataForUser } from '@/lib/domain/lifeInWeeks';
import type { UserProfile } from '@/lib/types/database.types';

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

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Profil-Kachel */}
      <div className="bg-white dark:bg-rc-carbon p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-rc-coral">RealityCheck</h1>
        <p className="text-xl text-rc-steel">
          Willkommen, <strong className="text-rc-mint">{profile.display_name || 'User'}</strong>
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
        <p className="text-lg text-rc-steel">
          {primaryGoal?.title || 'Noch keines gesetzt'}
        </p>
      </div>

      {/* Observatory CTA */}
      {!profile.observatory_onboarding_completed && (
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

