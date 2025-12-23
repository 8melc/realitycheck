import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { uploadAvatar, deleteAvatar } from '@/lib/utils/avatar-upload';

/**
 * POST /api/profile/avatar/upload
 * Upload avatar image to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    // Upload to storage (this also deletes old avatar)
    const avatarUrl = await uploadAvatar(file, user.id);

    // Update profile with avatar_url and set avatar_type to 'upload'
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: avatarUrl,
        avatar_type: 'upload',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[Avatar Upload API] Error updating profile:', updateError);
      // Try to clean up uploaded file
      try {
        await deleteAvatar(user.id);
      } catch (cleanupError) {
        console.error('[Avatar Upload API] Error cleaning up:', cleanupError);
      }

      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Profils' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error: any) {
    console.error('[Avatar Upload API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Hochladen des Avatars' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/avatar/upload
 * Delete uploaded avatar and reset to initials
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete from storage
    await deleteAvatar(user.id);

    // Update profile to reset avatar
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: null,
        avatar_type: 'initials',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[Avatar Delete API] Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Profils' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[Avatar Delete API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Löschen des Avatars' },
      { status: 500 }
    );
  }
}


