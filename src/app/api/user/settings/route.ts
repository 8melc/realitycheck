import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/user/settings
 * Retrieve current user account settings (email, name from auth)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      emailConfirmed: !!user.email_confirmed_at,
      avatarUrl: user.user_metadata?.avatar_url || null,
    });
  } catch (error) {
    console.error('[Settings] Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/settings
 * Update user account settings (email, name, password)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, name, currentPassword, newPassword } = body;

    const updates: { email?: string; password?: string; data?: any } = {};

    // Update email if provided
    if (email && email !== user.email) {
      updates.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Aktuelles Passwort ist erforderlich' },
          { status: 400 }
        );
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        return NextResponse.json(
          { error: 'Aktuelles Passwort ist falsch' },
          { status: 401 }
        );
      }

      updates.password = newPassword;
    }

    // Update user metadata (name, avatar)
    if (name !== undefined) {
      updates.data = {
        ...user.user_metadata,
        full_name: name,
        name: name,
      };
    }

    // Perform update
    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser(updates);

    if (updateError) {
      console.error('[Settings] Error updating user:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Fehler beim Aktualisieren' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: updatedUser.user.email,
        name: updatedUser.user.user_metadata?.full_name || updatedUser.user.user_metadata?.name || null,
        emailConfirmed: !!updatedUser.user.email_confirmed_at,
      },
    });
  } catch (error: any) {
    console.error('[Settings] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/settings
 * Delete user account (DSGVO)
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

    // Note: In production, you might want to:
    // 1. Soft-delete: Mark as deleted instead of actually deleting
    // 2. Use a service role key to delete from auth.users
    // 3. Cascade delete related data
    
    // For now, we'll just delete from user_profiles
    // The auth user deletion should be handled by admin/service role
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[Settings] Error deleting profile:', deleteError);
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Profils' },
        { status: 500 }
      );
    }

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Settings] Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



