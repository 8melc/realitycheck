import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/content/interact
 * Record user interaction with a content item
 * 
 * Body: {
 *   content_id: string (required)
 *   interaction_type: 'like' | 'dislike' | 'pin' | 'completed' | 'skip' (required)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content_id, interaction_type } = body;

    // Validate required fields
    if (!content_id || !interaction_type) {
      return NextResponse.json(
        { error: 'Missing required fields: content_id and interaction_type' },
        { status: 400 }
      );
    }

    // Validate interaction_type
    const validTypes = ['like', 'dislike', 'pin', 'completed', 'skip'];
    if (!validTypes.includes(interaction_type)) {
      return NextResponse.json(
        { error: `Invalid interaction_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if content item exists
    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('id')
      .eq('id', content_id)
      .maybeSingle();

    if (contentError) {
      console.error('[Content Interact] Error checking content item:', contentError);
      return NextResponse.json(
        { error: 'Failed to verify content item' },
        { status: 500 }
      );
    }

    if (!contentItem) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      );
    }

    // Check if interaction already exists for this user+content+type
    const { data: existingInteraction } = await supabase
      .from('content_interactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_id', content_id)
      .eq('interaction_type', interaction_type)
      .maybeSingle();

    if (existingInteraction) {
      // Interaction already exists - return success (idempotent)
      return NextResponse.json({
        success: true,
        message: 'Interaction already recorded',
        interaction_id: existingInteraction.id
      });
    }

    // Insert new interaction
    const { data: interaction, error: insertError } = await supabase
      .from('content_interactions')
      .insert({
        user_id: user.id,
        content_id: content_id,
        interaction_type: interaction_type,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Content Interact] Error inserting interaction:', insertError);
      return NextResponse.json(
        { error: 'Failed to record interaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interaction recorded successfully',
      interaction_id: interaction.id
    });

  } catch (error: any) {
    console.error('[Content Interact] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/content/interact
 * Get user's interactions for a specific content item or all interactions
 * 
 * Query params:
 *   - content_id (optional): Filter by specific content item
 *   - interaction_type (optional): Filter by interaction type
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const content_id = searchParams.get('content_id');
    const interaction_type = searchParams.get('interaction_type');

    let query = supabase
      .from('content_interactions')
      .select('id, content_id, interaction_type, created_at')
      .eq('user_id', user.id);

    if (content_id) {
      query = query.eq('content_id', content_id);
    }

    if (interaction_type) {
      query = query.eq('interaction_type', interaction_type);
    }

    const { data: interactions, error: fetchError } = await query
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[Content Interact] Error fetching interactions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch interactions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      interactions: interactions || [],
      count: interactions?.length || 0
    });

  } catch (error: any) {
    console.error('[Content Interact] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content/interact
 * Remove a user interaction
 * 
 * Body: {
 *   content_id: string (required)
 *   interaction_type: string (required)
 * }
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content_id, interaction_type } = body;

    if (!content_id || !interaction_type) {
      return NextResponse.json(
        { error: 'Missing required fields: content_id and interaction_type' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('content_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', content_id)
      .eq('interaction_type', interaction_type);

    if (deleteError) {
      console.error('[Content Interact] Error deleting interaction:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete interaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interaction removed successfully'
    });

  } catch (error: any) {
    console.error('[Content Interact] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

