import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GET /api/guide/feed
 * Generate personalized guide impulses based on user interests and goals
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-...') {
      console.warn('[Guide Feed] OpenAI API Key missing, returning empty feed');
      return NextResponse.json({
        success: true,
        impulses: [],
        userContext: {
          interests: [],
          goal: null,
          tone: 'straight',
        },
        error: 'Guide-Feed ist aktuell nicht verfügbar. Bitte später erneut versuchen.',
      });
    }

    // Fetch user interests
    const { data: interests, error: interestsError } = await supabase
      .from('user_interests')
      .select('label')
      .eq('user_id', user.id);

    if (interestsError) {
      console.error('[Guide Feed] Interests fetch error:', interestsError);
      // Don't fail, just use empty array
    }

    // Fetch user profile (goal, guide settings)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('focus_topic, guide_tone')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('[Guide Feed] Profile fetch error:', profileError);
    }

    // Fetch primary goal
    const { data: goal, error: goalError } = await supabase
      .from('user_goals')
      .select('title')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    const userInterests = interests?.map(i => i.label) || [];
    const userGoal = goal?.title || profile?.focus_topic || 'Noch nicht gesetzt';
    const guideTone = profile?.guide_tone || 'straight';

    // If no interests and no goal, return empty with helpful message
    if (userInterests.length === 0 && userGoal === 'Noch nicht gesetzt') {
      return NextResponse.json({
        success: true,
        impulses: [],
        userContext: {
          interests: [],
          goal: null,
          tone: guideTone,
        },
        message: 'Setze dein Ziel und füge Interessen hinzu, um personalisierte Impulse zu erhalten.',
      });
    }

    // Generate personalized impulses using OpenAI
    const systemPrompt = guideTone === 'straight' 
      ? 'Du bist ein direkter, ehrlicher Guide für RealityCheck. Kein Bullshit, keine Floskeln. Kurz und knackig. Maximal 2 Sätze pro Impuls.'
      : 'Du bist ein empathischer, unterstützender Guide für RealityCheck. Motivierend aber nicht kitschig. Maximal 2 Sätze pro Impuls.';

    const userPrompt = `
User-Ziel: ${userGoal}
User-Interessen: ${userInterests.length > 0 ? userInterests.join(', ') : 'Noch keine Interessen'}

Generiere 3 konkrete, actionable Impulse/Nudges für heute, die:
1. Auf die Interessen des Users eingehen (falls vorhanden)
2. Sein Ziel unterstützen
3. Konkret und umsetzbar sind (keine generischen Tipps)
4. Zum Guide-Ton passen (${guideTone === 'straight' ? 'direkt und ehrlich' : 'empathisch und motivierend'})

Format:
- Impuls 1: [Titel] - [Beschreibung in 1-2 Sätzen]
- Impuls 2: [Titel] - [Beschreibung in 1-2 Sätzen]
- Impuls 3: [Titel] - [Beschreibung in 1-2 Sätzen]
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const guideFeed = completion.choices[0].message.content;

    // Parse the impulses
    const impulses = guideFeed
      ?.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map((line, index) => {
        const match = line.match(/- (.+?): (.+)/);
        if (match) {
          return {
            id: `impulse-${Date.now()}-${index}`,
            title: match[1].trim(),
            description: match[2].trim(),
            timestamp: new Date().toISOString(),
          };
        }
        // Fallback: if format doesn't match, use whole line as description
        const cleanLine = line.replace(/^-\s*/, '').trim();
        if (cleanLine) {
          return {
            id: `impulse-${Date.now()}-${index}`,
            title: `Impuls ${index + 1}`,
            description: cleanLine,
            timestamp: new Date().toISOString(),
          };
        }
        return null;
      })
      .filter(Boolean) || [];

    return NextResponse.json({
      success: true,
      impulses,
      userContext: {
        interests: userInterests,
        goal: userGoal,
        tone: guideTone,
      },
    });
  } catch (error: any) {
    console.error('[Guide Feed] Error:', error);
    
    // Return graceful error response
    return NextResponse.json({
      success: false,
      impulses: [],
      error: error.message || 'Fehler beim Generieren der Impulse',
      userContext: {
        interests: [],
        goal: null,
        tone: 'straight',
      },
    }, { status: 500 });
  }
}


