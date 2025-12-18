import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/lib/types/database.types';

/**
 * GET /api/people
 * Returns all user profiles with display_name, birth_date, and target_age
 * 
 * Note: This requires RLS policies that allow reading all user_profiles,
 * or a service role client. For demo purposes, you may need to adjust RLS.
 */
export async function GET(request: NextRequest) {
  console.log('People API - Request received');
  
  try {
    const supabase = await createSupabaseServerClient();
    console.log('People API - Supabase client created');
    
    // Check if user is authenticated (optional, but helps with debugging)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.warn('People API - Auth check failed (continuing anyway):', authError.message);
    } else {
      console.log('People API - User authenticated:', user?.id || 'anonymous');
    }
    
    // First: Check ALL profiles (without filters) to see what we have
    console.log('People API - Checking all profiles (unfiltered)...');
    const { data: allProfiles, error: allError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, birth_date, target_age')
      .limit(10);
    
    if (allError) {
      console.error('People API - Error checking all profiles:', allError);
    } else {
      console.log(`People API - Total profiles in table: ${allProfiles?.length || 0}`);
      if (allProfiles && allProfiles.length > 0) {
        console.log('People API - All profiles (unfiltered):', allProfiles.map(p => ({
          user_id: p.user_id,
          display_name: p.display_name,
          has_display_name: !!p.display_name,
          has_birth_date: !!p.birth_date,
          has_target_age: p.target_age !== null,
          missing_fields: [
            !p.display_name && 'display_name',
            !p.birth_date && 'birth_date',
            p.target_age === null && 'target_age'
          ].filter(Boolean)
        })));
      }
    }
    
    // Get all user profiles that have the required fields
    console.log('People API - Querying user_profiles with filters...');
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .not('display_name', 'is', null)
      .not('birth_date', 'is', null)
      .not('target_age', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('People API - Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        user: user?.id || 'not authenticated'
      });
      
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: 'Failed to fetch profiles', 
          details: error.message,
          code: error.code,
          hint: error.hint || 'Check RLS policies - they may only allow users to read their own profile',
          suggestion: 'Run the SQL migration: db/migrations/002_allow_public_read_user_profiles.sql'
        },
        { status: 500 }
      );
    }
    
    console.log(`People API - Successfully fetched ${profiles?.length || 0} profiles (after filters)`);
    
    // FALLBACK: Wenn keine Profile in der DB sind, zeige Mock-Profile für die Demo
    if (!profiles || profiles.length === 0) {
      console.log('People API - Returning fallback mock profiles for demo');
      const mockProfiles = [
        {
          user_id: 'melissa-conrads',
          display_name: 'Melissa Conrads',
          birth_date: '1997-08-08',
          target_age: 85,
          guide_personality: 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
        },
        {
          user_id: 'sarah-chen',
          display_name: 'Sarah Chen',
          birth_date: '1992-03-12',
          target_age: 90,
          guide_personality: 'Freiheit ist tägliche Disziplin.',
          avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
        },
        {
          user_id: 'nico-richter',
          display_name: 'Nico Richter',
          birth_date: '1988-11-24',
          target_age: 78,
          guide_personality: 'Zeit ist, was ich daraus mache – auch wenn ich wenig davon habe.',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        },
        {
          user_id: 'mila-weber',
          display_name: 'Mila Weber',
          birth_date: '1995-06-05',
          target_age: 82,
          guide_personality: 'Zeitverschwendung ist politisch.',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
        }
      ];
      
      return NextResponse.json({
        success: true,
        profiles: mockProfiles,
        count: mockProfiles.length,
        is_mock: true
      });
    }
    
    // Debug: Log first profile if exists
    if (profiles && profiles.length > 0) {
      console.log('People API - Sample profile (filtered):', {
        user_id: profiles[0].user_id,
        display_name: profiles[0].display_name,
        has_birth_date: !!profiles[0].birth_date,
        has_target_age: profiles[0].target_age !== null,
      });
    }
    
    // Return empty array if no profiles found (not an error)
    return NextResponse.json({
      success: true,
      profiles: profiles || [],
      count: profiles?.length || 0
    });
  } catch (error: any) {
    console.error('People API - Exception:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    );
  }
}
