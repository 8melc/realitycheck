import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type AvatarType = 'initials' | 'upload' | 'generated';
type AvatarStyle = 'avataaars' | 'personas' | 'bottts' | 'micah' | 'lorelei';

/**
 * PUT /api/profile/avatar
 * Update avatar type, seed, and style
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    const { avatar_type, avatar_seed, avatar_style } = body;

    // Validation
    const validAvatarTypes: AvatarType[] = ['initials', 'upload', 'generated'];
    if (avatar_type && !validAvatarTypes.includes(avatar_type)) {
      return NextResponse.json(
        { error: 'Ungültiger avatar_type. Muss eins von: initials, upload, generated sein' },
        { status: 400 }
      );
    }

    const validAvatarStyles: AvatarStyle[] = ['avataaars', 'personas', 'bottts', 'micah', 'lorelei'];
    if (avatar_style && !validAvatarStyles.includes(avatar_style)) {
      return NextResponse.json(
        { error: 'Ungültiger avatar_style' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: {
      avatar_type?: AvatarType;
      avatar_seed?: string | null;
      avatar_style?: AvatarStyle | null;
      updated_at?: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (avatar_type !== undefined) {
      updateData.avatar_type = avatar_type;
    }

    if (avatar_seed !== undefined) {
      updateData.avatar_seed = avatar_seed || null;
    }

    if (avatar_style !== undefined) {
      updateData.avatar_style = avatar_style || null;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[Avatar API] Error updating avatar:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Fehler beim Aktualisieren des Avatars' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar_type: updateData.avatar_type,
      avatar_seed: updateData.avatar_seed,
      avatar_style: updateData.avatar_style,
    });
  } catch (error: any) {
    console.error('[Avatar API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

