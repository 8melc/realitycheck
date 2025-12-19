import { NextRequest, NextResponse } from 'next/server';
import { UsageLimitResponse } from '@/types/profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
      .maybeSingle();

    if (profileError) {
      console.error('[Usage Limit] Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch usage limit' }, { status: 500 });
    }

    // Calculate today's usage from user_sessions table
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('duration_minutes, session_start')
      .eq('user_id', user.id)
      .gte('session_start', todayStart.toISOString());

    if (sessionsError) {
      console.error('[Usage Limit] Error fetching sessions:', sessionsError);
      // Fallback: verwende 0 wenn Sessions nicht geladen werden können
    }

    // Summiere duration_minutes aller Sessions von heute
    // Für laufende Sessions (duration_minutes = null) berechne die Zeit seit session_start
    const now = new Date();
    let todayUsageMinutes = 0;
    
    if (sessions) {
      sessions.forEach((session) => {
        if (session.duration_minutes !== null) {
          // Session ist bereits beendet
          todayUsageMinutes += session.duration_minutes;
        } else {
          // Session läuft noch - berechne Zeit seit session_start
          const sessionStart = new Date(session.session_start);
          const durationMs = now.getTime() - sessionStart.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));
          todayUsageMinutes += durationMinutes;
        }
      });
    }

    const dailyLimitMinutes = profile?.daily_time_limit_minutes || null;
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

    // Validation
    if (dailyLimitMinutes !== null && dailyLimitMinutes !== undefined) {
      if (typeof dailyLimitMinutes !== 'number' || dailyLimitMinutes < 15 || dailyLimitMinutes > 480) {
        return NextResponse.json(
          { error: 'Daily limit must be between 15 and 480 minutes' }, 
          { status: 400 }
        );
      }

      if (dailyLimitMinutes % 15 !== 0) {
        return NextResponse.json(
          { error: 'Daily limit must be in 15-minute increments' }, 
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dailyLimitMinutes !== undefined) {
      updateData.daily_time_limit_minutes = dailyLimitMinutes;
    }

    if (enabled !== undefined) {
      updateData.daily_limit_enabled = enabled;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select('daily_time_limit_minutes, daily_limit_enabled')
      .single();

    if (updateError) {
      console.error('[Usage Limit] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update usage limit' }, { status: 500 });
    }

    // Calculate today's usage from user_sessions table
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('duration_minutes, session_start')
      .eq('user_id', user.id)
      .gte('session_start', todayStart.toISOString());

    if (sessionsError) {
      console.error('[Usage Limit] Error fetching sessions:', sessionsError);
    }

    // Summiere duration_minutes aller Sessions von heute
    const now = new Date();
    let todayUsageMinutes = 0;
    
    if (sessions) {
      sessions.forEach((session) => {
        if (session.duration_minutes !== null) {
          todayUsageMinutes += session.duration_minutes;
        } else {
          // Session läuft noch
          const sessionStart = new Date(session.session_start);
          const durationMs = now.getTime() - sessionStart.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));
          todayUsageMinutes += durationMinutes;
        }
      });
    }

    const limitReached = updatedProfile.daily_time_limit_minutes 
      ? todayUsageMinutes >= updatedProfile.daily_time_limit_minutes 
      : false;

    const response: UsageLimitResponse = {
      dailyLimitMinutes: updatedProfile.daily_time_limit_minutes,
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
