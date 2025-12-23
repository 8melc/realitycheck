import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/user/settings
 * Retrieve current user account settings (email, name from user_profiles)
 * SINGLE SOURCE OF TRUTH: display_name comes from user_profiles, not auth metadata
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

    // Load display_name from user_profiles (SINGLE SOURCE OF TRUTH)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();

    // Fallback: If display_name is not set in user_profiles, try auth metadata (for legacy users)
    // This is a one-time migration path - new users should always have display_name in user_profiles
    const displayName = profile?.display_name 
      ?? user.user_metadata?.full_name 
      ?? user.user_metadata?.name 
      ?? null;

    // Sync display_name to user_profiles if it exists in metadata but not in profile (one-time migration)
    if (!profile?.display_name && (user.user_metadata?.full_name || user.user_metadata?.name)) {
      const nameToSync = user.user_metadata?.full_name || user.user_metadata?.name;
      if (nameToSync) {
        // Non-blocking: Don't fail the request if sync fails
        supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            display_name: nameToSync,
          } as any, { onConflict: 'user_id' })
          .then(({ error }) => {
            if (error) {
              console.warn('[Settings] Could not sync display_name from metadata:', error);
            } else {
              console.log('[Settings] Synced display_name from auth metadata to user_profiles');
            }
          });
      }
    }

    return NextResponse.json({
      email: user.email,
      name: displayName,
      emailConfirmed: !!user.email_confirmed_at,
      avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
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

    // Update user metadata (name, avatar) - for backward compatibility
    if (name !== undefined) {
      updates.data = {
        ...user.user_metadata,
        full_name: name,
        name: name,
      };
    }

    // Perform auth update
    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser(updates);

    if (updateError) {
      console.error('[Settings] Error updating user:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Fehler beim Aktualisieren' },
        { status: 400 }
      );
    }

    // SINGLE SOURCE OF TRUTH: Update display_name in user_profiles
    // This is the authoritative source - auth metadata is just for backward compatibility
    if (name !== undefined) {
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ display_name: name.trim() })
        .eq('user_id', user.id);

      if (profileUpdateError) {
        console.error('[Settings] Error updating display_name in user_profiles:', profileUpdateError);
        // Don't fail the request - auth update succeeded, profile update is secondary
        // But log it for debugging
      }
    }

    // Return the name from user_profiles (or fallback to auth metadata if profile update failed)
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const finalName = updatedProfile?.display_name 
      ?? updatedUser.user.user_metadata?.full_name 
      ?? updatedUser.user.user_metadata?.name 
      ?? null;

    return NextResponse.json({
      success: true,
      user: {
        email: updatedUser.user.email,
        name: finalName,
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



