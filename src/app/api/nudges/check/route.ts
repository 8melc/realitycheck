import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkNudgeTriggers } from '@/lib/nudging/check-triggers';
import { generateNudge } from '@/lib/nudging/generate-nudge';
import { getUserNudgeProfile } from '@/lib/nudging/nudge-helpers';

/**
 * GET /api/nudges/check
 * Checks if user should receive a nudge and generates it with AI
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 1. Check triggers (includes pause check and frequency cap)
    const trigger = await checkNudgeTriggers(user.id);
    if (!trigger || !trigger.shouldTrigger) {
      return NextResponse.json({ shouldNudge: false });
    }

    // 2. Get user profile data for AI generation
    const userProfile = await getUserNudgeProfile(supabase, user.id, trigger.context);
    if (!userProfile) {
      console.error('[Nudges] Failed to get user profile');
      return NextResponse.json(
        { error: 'Failed to load user profile' },
        { status: 500 }
      );
    }

    // 3. Generate AI nudge message
    const nudgeMessage = await generateNudge({
      nudgeType: trigger.type,
      userProfile,
    });

    // 4. Save nudge to database
    const { data: nudge, error: insertError } = await supabase
      .from('nudges_sent')
      .insert({
        user_id: user.id,
        nudge_type: trigger.type,
        nudge_content: nudgeMessage,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Nudges] Error saving nudge:', insertError);
      return NextResponse.json(
        { error: 'Failed to save nudge' },
        { status: 500 }
      );
    }

    // 5. Return nudge
    return NextResponse.json({
      shouldNudge: true,
      nudge: {
        id: nudge.id,
        type: trigger.type,
        message: nudgeMessage,
        cta: 'Okay, Check gemacht',
        dismissible: true,
      },
    });
  } catch (error: any) {
    console.error('[Nudges] Error checking nudges:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

