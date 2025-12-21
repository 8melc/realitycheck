import { NextRequest, NextResponse } from 'next/server';
import { UsageLimitResponse } from '@/types/profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Typen für die DB-Queries
type UserSession = {
  session_start: string;
  session_end: string | null;
  duration_minutes: number | null;
};

type UserProfileUsage = {
  daily_time_limit_minutes: number | null;
  daily_limit_enabled: boolean | null;
};

// GET: Retrieve current usage limit and today's usage
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with usage limit settings
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('daily_time_limit_minutes, daily_limit_enabled')
      .eq('user_id', user.id)
      .maybeSingle() as { data: UserProfileUsage | null; error: any };

    if (profileError) {
      console.error('[Usage Limit] Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch usage limit' }, { status: 500 });
    }

    // Calculate today's usage from user_sessions table
    // WICHTIG: Nutze UTC für konsistente "heute"-Berechnung
    // Supabase speichert timestamptz in UTC, daher müssen wir auch in UTC vergleichen
    // Dies verhindert Zeitzonen-Probleme (z.B. Server in UTC, User in CET)
    const now = new Date();
    const todayStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    const todayEnd = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));
    
    // Get sessions that started today (strictly today, not before)
    // Query nutzt UTC-Timestamps für konsistenten Vergleich
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('duration_minutes, session_start, session_end')
      .eq('user_id', user.id)
      .gte('session_start', todayStart.toISOString())
      .lt('session_start', todayEnd.toISOString()) as { data: UserSession[] | null; error: any };

    if (sessionsError) {
      // Silent error - verwende 0 wenn Sessions nicht geladen werden können
      // Nur in Development loggen
      if (process.env.NODE_ENV === 'development') {
        console.error('[Usage Limit] Error fetching sessions:', sessionsError);
      }
    }

    // Summiere duration_minutes aller Sessions von heute
    // Für laufende Sessions (duration_minutes = null) berechne die Zeit seit session_start
    let todayUsageMinutes = 0;
    
    if (sessions) {
      sessions.forEach((session) => {
        // Double-check: Session muss wirklich heute gestartet sein (UTC-basiert)
        const sessionStart = new Date(session.session_start);
        const sessionStartUTC = new Date(Date.UTC(
          sessionStart.getUTCFullYear(),
          sessionStart.getUTCMonth(),
          sessionStart.getUTCDate(),
          0, 0, 0, 0
        ));
        const isToday = sessionStartUTC.getTime() === todayStart.getTime();
        
        if (!isToday) {
          return; // Skip sessions not started today
        }
        
        if (session.duration_minutes !== null && session.duration_minutes >= 0) {
          // Session ist bereits beendet - nur positive Werte verwenden
          // Cap at 24 hours (1440 minutes) per session to prevent outliers
          const cappedMinutes = Math.min(session.duration_minutes, 1440);
          todayUsageMinutes += cappedMinutes;
        } else {
          // Session läuft noch - berechne Zeit seit session_start
          const durationMs = now.getTime() - sessionStart.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));
          
          if (durationMinutes >= 0) {
            // Cap at 24 hours (1440 minutes) per session
            const cappedMinutes = Math.min(durationMinutes, 1440);
            todayUsageMinutes += cappedMinutes;
          }
        }
      });
    }

    // Final log (nur einmal, nicht pro Session)
    console.log('[UsageLimit] todayUsageMinutes =', todayUsageMinutes);

    // Treat 0 as null (no limit) - especially useful for localhost/development
    const dailyLimitMinutes = profile?.daily_time_limit_minutes === 0 
      ? null 
      : (profile?.daily_time_limit_minutes || null);
    const limitReached = dailyLimitMinutes 
      ? todayUsageMinutes >= dailyLimitMinutes 
      : false;

    const response: UsageLimitResponse = {
      dailyLimitMinutes,
      todayUsageMinutes,
      requiresReauth: false, // No longer needed with Supabase
      lastLimitUpdateAt: null, // Can be added to user_profiles if needed
      limitReached,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Usage Limit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT/PATCH: Update daily usage limit
export async function PUT(request: NextRequest) {
  return PATCH(request);
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dailyLimitMinutes, enabled } = body;

    // Check if we're in development/localhost
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                        request.headers.get('host')?.includes('127.0.0.1');
    const allowZero = isDevelopment || isLocalhost;

    // Validation
    if (dailyLimitMinutes !== null && dailyLimitMinutes !== undefined) {
      // Allow 0 in development/localhost, otherwise require 15-480
      if (typeof dailyLimitMinutes !== 'number') {
        return NextResponse.json(
          { error: 'Daily limit must be a number' }, 
          { status: 400 }
        );
      }

      if (dailyLimitMinutes === 0 && !allowZero) {
        return NextResponse.json(
          { error: 'Daily limit cannot be 0 in production' }, 
          { status: 400 }
        );
      }

      if (dailyLimitMinutes !== 0 && (dailyLimitMinutes < 15 || dailyLimitMinutes > 480)) {
        return NextResponse.json(
          { error: 'Daily limit must be between 15 and 480 minutes' }, 
          { status: 400 }
        );
      }

      // Only enforce 15-minute increments if not 0
      if (dailyLimitMinutes !== 0 && dailyLimitMinutes % 15 !== 0) {
        return NextResponse.json(
          { error: 'Daily limit must be in 15-minute increments' }, 
          { status: 400 }
        );
      }
    }

    // Prüfe, ob Profil existiert
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('user_id, daily_time_limit_minutes, daily_limit_enabled')
      .eq('user_id', user.id)
      .maybeSingle() as { data: (UserProfileUsage & { user_id: string }) | null; error: any };

    if (profileCheckError) {
      console.error('[Usage Limit] Error checking profile:', profileCheckError);
      return NextResponse.json({ error: 'Failed to check user profile' }, { status: 500 });
    }

    let updatedProfile: UserProfileUsage | null = null;

    if (!existingProfile) {
      // Profil existiert nicht - erstelle es
      // WICHTIG: birth_date wird NICHT gesetzt (bleibt null)
      // Dies erlaubt es, Profile ohne vollständiges Onboarding anzulegen
      // birth_date wird später im Onboarding-Flow ergänzt
      const insertData: any = {
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'User',
        updated_at: new Date().toISOString(),
        // birth_date wird absichtlich NICHT gesetzt (nullable in DB)
      };

      if (dailyLimitMinutes !== undefined) {
        insertData.daily_time_limit_minutes = dailyLimitMinutes;
      }

      if (enabled !== undefined) {
        insertData.daily_limit_enabled = enabled;
      }

      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(insertData)
        .select('daily_time_limit_minutes, daily_limit_enabled')
        .single() as { data: UserProfileUsage | null; error: any };

      if (insertError) {
        console.error('[Usage Limit] Insert error:', insertError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }

      updatedProfile = newProfile;
    } else {
      // Profil existiert - aktualisiere es
      const updateData: Partial<UserProfileUsage> & { updated_at: string } = {
        updated_at: new Date().toISOString(),
      };

      if (dailyLimitMinutes !== undefined) {
        updateData.daily_time_limit_minutes = dailyLimitMinutes;
      }

      if (enabled !== undefined) {
        updateData.daily_limit_enabled = enabled;
      }

      const updateResult = await (supabase
        .from('user_profiles') as any)
        .update(updateData)
        .eq('user_id', user.id)
        .select('daily_time_limit_minutes, daily_limit_enabled')
        .single();
      
      const { data: updated, error: updateError } = updateResult as { data: UserProfileUsage | null; error: any };

      if (updateError) {
        console.error('[Usage Limit] Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update usage limit' }, { status: 500 });
      }

      updatedProfile = updated;
    }

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Failed to save usage limit' }, { status: 500 });
    }

    // Calculate today's usage from user_sessions table
    // WICHTIG: Nutze UTC für konsistente "heute"-Berechnung
    // Supabase speichert timestamptz in UTC, daher müssen wir auch in UTC vergleichen
    // Dies verhindert Zeitzonen-Probleme (z.B. Server in UTC, User in CET)
    const now = new Date();
    const todayStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    const todayEnd = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));
    
    // Get sessions that started today (strictly today, not before)
    // Query nutzt UTC-Timestamps für konsistenten Vergleich
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('duration_minutes, session_start, session_end')
      .eq('user_id', user.id)
      .gte('session_start', todayStart.toISOString())
      .lt('session_start', todayEnd.toISOString()) as { data: UserSession[] | null; error: any };

    if (sessionsError) {
      // Silent error - nur in Development loggen
      if (process.env.NODE_ENV === 'development') {
        console.error('[Usage Limit] Error fetching sessions:', sessionsError);
      }
    }

    // Summiere duration_minutes aller Sessions von heute
    let todayUsageMinutes = 0;
    
    if (sessions) {
      sessions.forEach((session) => {
        // Double-check: Session muss wirklich heute gestartet sein (UTC-basiert)
        const sessionStart = new Date(session.session_start);
        const sessionStartUTC = new Date(Date.UTC(
          sessionStart.getUTCFullYear(),
          sessionStart.getUTCMonth(),
          sessionStart.getUTCDate(),
          0, 0, 0, 0
        ));
        const isToday = sessionStartUTC.getTime() === todayStart.getTime();
        
        if (!isToday) {
          return; // Skip sessions not started today
        }
        
        if (session.duration_minutes !== null && session.duration_minutes >= 0) {
          // Session ist bereits beendet - nur positive Werte verwenden
          // Cap at 24 hours (1440 minutes) per session to prevent outliers
          todayUsageMinutes += Math.min(session.duration_minutes, 1440);
        } else {
          // Session läuft noch - berechne Zeit seit session_start
          const durationMs = now.getTime() - sessionStart.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));
          
          if (durationMinutes >= 0) {
            // Cap at 24 hours (1440 minutes) per session
            todayUsageMinutes += Math.min(durationMinutes, 1440);
          }
        }
      });
    }

    // Final log (nur einmal, nicht pro Session)
    console.log('[UsageLimit] todayUsageMinutes =', todayUsageMinutes);

    // Treat 0 as null (no limit) - especially useful for localhost/development
    const effectiveDailyLimitMinutes = updatedProfile.daily_time_limit_minutes === 0 
      ? null 
      : updatedProfile.daily_time_limit_minutes;
    const limitReached = effectiveDailyLimitMinutes 
      ? todayUsageMinutes >= effectiveDailyLimitMinutes 
      : false;

    const response: UsageLimitResponse = {
      dailyLimitMinutes: effectiveDailyLimitMinutes,
      todayUsageMinutes,
      requiresReauth: false,
      lastLimitUpdateAt: new Date().toISOString(),
      limitReached,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Usage Limit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
