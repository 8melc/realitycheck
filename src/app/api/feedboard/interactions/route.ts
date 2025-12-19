import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/feedboard/interactions
 * 
 * Loggt Feed-Interaktionen in feed_interactions Tabelle
 * 
 * Body: {
 *   content_id: string,
 *   action: 'saved' | 'more_like_this' | 'different_topic'
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content_id, action } = body;

    console.log('[Feed Interactions] Request received:', { content_id, action, body });

    if (!content_id || !action) {
      console.error('[Feed Interactions] Missing required fields:', { content_id, action });
      return NextResponse.json(
        { error: 'content_id and action are required', received: { content_id, action } },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[Feed Interactions] Auth error:', {
        authError,
        hasUser: !!user,
        errorMessage: authError?.message,
      });
      return NextResponse.json(
        { error: 'Unauthorized', authError: authError?.message },
        { status: 401 }
      );
    }

    // CRITICAL: Verify user.id is the auth UUID, not profile UUID
    console.log('[Feed Interactions] User authenticated:', {
      userId: user.id,
      userEmail: user.email,
      userIdType: typeof user.id,
      userIdLength: user.id?.length,
    });
    
    // Verify it's a UUID format (auth.uid() should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      console.error('[Feed Interactions] Invalid user ID format (not UUID):', user.id);
      return NextResponse.json(
        { error: 'Invalid user ID format', userId: user.id },
        { status: 500 }
      );
    }

    // Map action names to database values
    const actionMap: Record<string, 'saved' | 'more_like_this' | 'different_topic'> = {
      'bookmark': 'saved',
      'more': 'more_like_this',
      'less': 'different_topic',
    };

    const dbAction = actionMap[action] || action;
    console.log('[Feed Interactions] Action mapping:', { action, dbAction });

    // Get cluster from content_item (optional, for logging)
    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('cluster')
      .eq('id', content_id)
      .maybeSingle();

    if (contentError) {
      console.warn('[Feed Interactions] Could not fetch content item:', contentError);
    }

    // Insert interaction
    // CRITICAL: user.id MUST be the auth UUID (from auth.users), NOT profile UUID
    const insertData = {
      user_id: user.id, // This should be auth.uid() - the UUID from auth.users table
      content_id: content_id,
      action: dbAction,
    };

    console.log('[Feed Interactions] Inserting:', {
      ...insertData,
      userIdSource: 'supabase.auth.getUser().user.id',
      userIdIsUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id),
      userIdLength: user.id.length,
    });

    // Double-check: Verify this user_id exists in auth.users (via RLS check)
    // If RLS blocks, we'll get an error with details
    const { data: insertData_result, error: insertError } = await supabase
      .from('feed_interactions')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('[Feed Interactions] Insert error:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        insertData,
        userIdUsed: user.id,
        userIdType: typeof user.id,
        // Check if this is an RLS violation
        isRLSError: insertError.code === '42501' || insertError.message?.toLowerCase().includes('policy'),
      });
      
      // If RLS error, provide specific guidance
      if (insertError.code === '42501' || insertError.message?.toLowerCase().includes('policy')) {
        console.error('[Feed Interactions] RLS BLOCKED INSERT:', {
          userId: user.id,
          expected: 'auth.uid() from auth.users table',
          hint: 'Check if user_id matches auth.uid() in RLS policy',
        });
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to log interaction',
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint,
          isRLSError: insertError.code === '42501' || insertError.message?.toLowerCase().includes('policy'),
        },
        { status: 500 }
      );
    }

    console.log('[Feed Interactions] Success:', { insertData_result });

    return NextResponse.json({
      success: true,
      action: dbAction,
      content_id,
      cluster: contentItem?.cluster || null,
      inserted_id: insertData_result?.[0]?.id,
    });
  } catch (error: any) {
    console.error('[Feed Interactions] Unexpected error:', {
      error,
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { status: 500 }
    );
  }
}
