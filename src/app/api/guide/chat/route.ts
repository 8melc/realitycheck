import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-...') {
      throw new Error('OpenAI API Key is missing or default');
    }

    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Profil + Ziel laden (mit Fallback für Demo)
    let profile = null;
    let goal = null;

    if (user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('display_name, focus_topic, bio, will_learn, will_share, slots_article, slots_podcast, slots_quote')
        .eq('user_id', user.id)
        .maybeSingle();
      profile = profileData;

      const { data: goalData } = await supabase
        .from('user_goals')
        .select('title')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();
      goal = goalData;
    }

    // Personalisierte Slots (Werte aus DB oder Hardcoded Fallback für Demo)
    const userPrefs = {
      slots_article: profile?.slots_article ?? 2,
      slots_podcast: profile?.slots_podcast ?? 3,
      slots_quote: profile?.slots_quote ?? 4
    };

    // CONTENT-EMPFEHLUNGEN (Passend zum Fokus des Users oder allgemein relevant)
    // Wir sind hier etwas kulant mit is_published für die Demo
    const { data: recommendations } = await supabase
      .from('content_items')
      .select('id, title, cluster, format, url')
      .or('is_published.eq.true,is_published.is.null')
      .limit(3);

    const recList = recommendations?.map(r => `"${r.title}" (${r.cluster})`).join('\n') || '';

    // UPGRADE-PROMPT
    const fyfPrompt = `RealityCheck Guide. Tonalität: Direkt, respektvoll, keine Hochglanz-Motivation.

USER-PROFIL:
- Name: ${profile?.display_name || 'Unbekannt'}
- Fokus: ${profile?.focus_topic || 'Nicht gesetzt'}
- Hauptziel: ${goal?.title || 'Kein Ziel gesetzt'}

DEINE AKTUELLEN LIMITS (Personalisierung):
- Artikel-Slots: ${userPrefs.slots_article}
- Podcast-Slots: ${userPrefs.slots_podcast}
- Zitat-Slots: ${userPrefs.slots_quote}

RELEVANTE INHALTE AUS DEM FEED:
${recList}

User fragt: "${message}"

REGELN:
1. VERSCHLAG 1 Content-Item aus der Liste, wenn passend ("Lies X aus dem Feed").
2. Beziehe dich auf die Slots, wenn du etwas vorschlägst (z.B. "Du hast noch ${userPrefs.slots_podcast} Podcast-Slots frei").
3. Eisenhower-Bezug (wichtig/dringend).
4. Max 3 Sätze total.
5. Ehrlich und substanziell.

Antwort:`;

    // OpenAI Call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: fyfPrompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content || 'Keine Antwort',
      profile_used: !!profile,
      goal_used: !!goal,
      recommendations: recommendations || []
    });

  } catch (error) {
    console.error('Guide Chat Error:', error);
    return NextResponse.json({
      response: "Lies 'Dein Leben in Wochen' aus dem Feed. Ziel wichtig, nicht dringend (Eisenhower). 2h Deep Work/Woche. Kein Stress.",
      fallback: true
    });
  }
}
