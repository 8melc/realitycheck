import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/people/debug
 * Debug endpoint to check what profiles exist and why they might be filtered
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get ALL profiles (no filters)
    const { data: allProfiles, error: allError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(10);
    
    // Get profiles with all required fields
    const { data: completeProfiles, error: completeError } = await supabase
      .from('user_profiles')
      .select('*')
      .not('display_name', 'is', null)
      .not('birth_date', 'is', null)
      .not('target_age', 'is', null)
      .limit(10);
    
    // Analyze profiles
    const analysis = (allProfiles || []).map(p => ({
      user_id: p.user_id,
      display_name: p.display_name,
      birth_date: p.birth_date,
      target_age: p.target_age,
      guide_personality: p.guide_personality,
      hasAllFields: !!(p.display_name && p.birth_date && p.target_age !== null),
      missingFields: [
        !p.display_name && 'display_name',
        !p.birth_date && 'birth_date',
        p.target_age === null && 'target_age'
      ].filter(Boolean) as string[],
      wouldShowInPeople: !!(p.display_name && p.birth_date && p.target_age !== null)
    }));
    
    return NextResponse.json({
      debug: true,
      totalProfiles: allProfiles?.length || 0,
      completeProfiles: completeProfiles?.length || 0,
      analysis,
      errors: {
        allError: allError ? {
          message: allError.message,
          code: allError.code
        } : null,
        completeError: completeError ? {
          message: completeError.message,
          code: completeError.code
        } : null
      },
      summary: {
        total: allProfiles?.length || 0,
        complete: completeProfiles?.length || 0,
        incomplete: (allProfiles?.length || 0) - (completeProfiles?.length || 0)
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

