import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/admin/seed-people
 * Erstellt Melissa + 3 weitere Beispiel-Profile für die People-Seite.
 * 
 * ACHTUNG: Funktioniert nur, wenn user_profiles keine harten Foreign Key Constraints 
 * auf auth.users hat, ODER wenn wir Dummy-UUIDs verwenden dürfen.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const demoProfiles = [
      {
        user_id: uuidv4(),
        display_name: 'Melissa Conrads',
        birth_date: '1997-08-08',
        target_age: 85,
        guide_personality: 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.'
      },
      {
        user_id: uuidv4(),
        display_name: 'Sarah Chen',
        birth_date: '1992-03-12',
        target_age: 90,
        guide_personality: 'Freiheit ist tägliche Disziplin.'
      },
      {
        user_id: uuidv4(),
        display_name: 'Nico Richter',
        birth_date: '1988-11-24',
        target_age: 78,
        guide_personality: 'Zeit ist, was ich daraus mache – auch wenn ich wenig davon habe.'
      },
      {
        user_id: uuidv4(),
        display_name: 'Mila Weber',
        birth_date: '1995-06-05',
        target_age: 82,
        guide_personality: 'Zeitverschwendung ist politisch.'
      }
    ];

    const results = [];
    for (const profile of demoProfiles) {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profile, { onConflict: 'display_name' }) // Upsert per name für demo
        .select()
        .single();
      
      if (error) {
        console.error(`Error seeding ${profile.display_name}:`, error);
        results.push({ name: profile.display_name, status: 'error', error: error.message });
      } else {
        results.push({ name: profile.display_name, status: 'success' });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


