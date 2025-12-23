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
    
    // Read query parameter
    const { searchParams } = new URL(request.url);
    const similarGoal = searchParams.get('similar_goal') === '1';
    
    // Basis-Query: public profiles that have completed observatory onboarding
    let query = supabase
      .from('user_profiles')
      .select('*, avatar_type, avatar_url, avatar_seed, avatar_style')
      .not('display_name', 'is', null)
      .not('birth_date', 'is', null)
      .not('target_age', 'is', null)
      .eq('is_public', true)
      .eq('observatory_onboarding_completed', true);

    if (similarGoal) {
      // Similar goal filter: authenticate and filter by goal_direction + life phase
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: me, error: meErr } = await supabase
        .from('user_profiles')
        .select('goal_direction, birth_date, target_age')
        .eq('user_id', auth.user.id)
        .single();

      if (meErr || !me) {
        return NextResponse.json({ error: 'Profile missing' }, { status: 400 });
      }

      if (!me.goal_direction || !me.birth_date || !me.target_age) {
        return NextResponse.json({ success: true, profiles: [], count: 0 });
      }

      // Filter by matching goal_direction
      query = query.eq('goal_direction', me.goal_direction);

      const { data: candidates, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('People API - Supabase query error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return NextResponse.json(
          { error: 'Failed to fetch profiles', details: error.message },
          { status: 500 }
        );
      }

      // Calculate age in years from birth_date
      const ageYears = (birthDate: string) => {
        const b = new Date(birthDate);
        const now = new Date();
        let age = now.getUTCFullYear() - b.getUTCFullYear();
        const m = now.getUTCMonth() - b.getUTCMonth();
        if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) age--;
        return age;
      };

      const meAge = ageYears(me.birth_date);
      const meLifePct = (meAge / me.target_age) * 100;

      // Filter by life phase: same goal_direction AND (age ±7 years OR life_percent ±5%)
      const filtered = (candidates || []).filter((p: any) => {
        if (!p.birth_date || !p.target_age) return false;
        if (p.user_id === auth.user.id) return false; // Exclude current user

        const pAge = ageYears(p.birth_date);
        const pLifePct = (pAge / p.target_age) * 100;

        const ageClose = Math.abs(pAge - meAge) <= 7;
        const lifeClose = Math.abs(pLifePct - meLifePct) <= 5;

        return ageClose || lifeClose;
      });

      // Fetch primary goals for filtered profiles
      const userIds = filtered.map((p: any) => p.user_id);
      const { data: goals } = await supabase
        .from('user_goals')
        .select('user_id, title')
        .in('user_id', userIds)
        .eq('is_primary', true);

      // Map goals to profiles
      const goalsMap = new Map((goals || []).map((g: any) => [g.user_id, { title: g.title }]));
      const profilesWithGoals = filtered.map((p: any) => ({
        ...p,
        primary_goal: goalsMap.get(p.user_id) || null,
      }));

      return NextResponse.json({
        success: true,
        profiles: profilesWithGoals,
        count: profilesWithGoals.length,
      });
    }

    // Default: return all public profiles
    const { data: profiles, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('People API - Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
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
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
          primary_goal: null,
        },
        {
          user_id: 'sarah-chen',
          display_name: 'Sarah Chen',
          birth_date: '1992-03-12',
          target_age: 90,
          guide_personality: 'Freiheit ist tägliche Disziplin.',
          avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
          primary_goal: null,
        },
        {
          user_id: 'nico-richter',
          display_name: 'Nico Richter',
          birth_date: '1988-11-24',
          target_age: 78,
          guide_personality: 'Zeit ist, was ich daraus mache – auch wenn ich wenig davon habe.',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          primary_goal: null,
        },
        {
          user_id: 'mila-weber',
          display_name: 'Mila Weber',
          birth_date: '1995-06-05',
          target_age: 82,
          guide_personality: 'Zeitverschwendung ist politisch.',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
          primary_goal: null,
        }
      ];
      
      return NextResponse.json({
        success: true,
        profiles: mockProfiles,
        count: mockProfiles.length,
        is_mock: true
      });
    }
    
    // Fetch primary goals for all profiles
    const userIds = profiles.map((p: any) => p.user_id);
    const { data: goals } = await supabase
      .from('user_goals')
      .select('user_id, title')
      .in('user_id', userIds)
      .eq('is_primary', true);

    // Map goals to profiles
    const goalsMap = new Map((goals || []).map((g: any) => [g.user_id, { title: g.title }]));
    const profilesWithGoals = profiles.map((p: any) => ({
      ...p,
      primary_goal: goalsMap.get(p.user_id) || null,
    }));
    
    // Debug: Log first profile if exists
    if (profilesWithGoals && profilesWithGoals.length > 0) {
      console.log('People API - Sample profile (filtered):', {
        user_id: profilesWithGoals[0].user_id,
        display_name: profilesWithGoals[0].display_name,
        has_birth_date: !!profilesWithGoals[0].birth_date,
        has_target_age: profilesWithGoals[0].target_age !== null,
        has_primary_goal: !!profilesWithGoals[0].primary_goal,
      });
    }
    
    // Return empty array if no profiles found (not an error)
    return NextResponse.json({
      success: true,
      profiles: profilesWithGoals || [],
      count: profilesWithGoals?.length || 0
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


