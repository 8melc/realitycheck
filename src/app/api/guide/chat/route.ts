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
    
    // Profil + Ziel laden
    let profile = null;
    let goal = null;

    if (user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('display_name, focus_topic, bio, slots_article, slots_podcast, slots_quote')
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

    // Slots extrahieren (mit Fallback auf Demo-Defaults falls NULL in DB)
    const slots = {
      article: typeof profile?.slots_article === 'number' ? profile.slots_article : 3,
      podcast: typeof profile?.slots_podcast === 'number' ? profile.slots_podcast : 2,
      quote: typeof profile?.slots_quote === 'number' ? profile.slots_quote : 4
    };

    // Erlaubte Formate für die Empfehlungs-Query
    const allowedFormats: string[] = [];
    if (slots.article > 0) allowedFormats.push('Artikel', 'article');
    if (slots.podcast > 0) allowedFormats.push('Podcast', 'podcast');
    if (slots.quote > 0) allowedFormats.push('Zitat', 'quote');

    // Empfehlungen holen
    let recommendations: any[] = [];
    if (allowedFormats.length > 0) {
      const { data } = await supabase
        .from('content_items')
        .select('id, title, cluster, format, url, read_time_minutes')
        .or('is_published.eq.true,is_published.is.null')
        .in('format', allowedFormats)
        .limit(3);
      recommendations = data || [];
    }

    // Empfehlungs-Liste für den Prompt bauen
    const recList = recommendations.map(r => 
      `- "${r.title}" (${r.format}, Cluster: ${r.cluster}${r.read_time_minutes ? `, Dauer: ${r.read_time_minutes} Min.` : ''})`
    ).join('\n');

    // Das neue Prompt-Skelett
    const fyfPrompt = `Du bist der FYF RealityCheck Guide: direkt, respektvoll, kein Bullshit.

KONTEXT USER
- Name: ${profile?.display_name || 'Unbekannt'}
- Ziel: ${goal?.title || 'Kein Ziel gesetzt'}
- Heute verfügbare Slots:
  - Artikel: ${slots.article}
  - Podcasts: ${slots.podcast}
  - Zitate: ${slots.quote}

FRAGE DES USERS
"${message}"

INHALTE, DIE DU VORSCHLAGEN DARFST (max. 1 nutzen):
${recList || 'Keine passenden Inhalte gefunden.'}

DEIN VERHALTEN

1. Reagiere zuerst auf die Frage selbst (1–2 Sätze, klar, ehrlich).
2. Dann:
   - Wenn noch mehrere Formate verfügbar sind (z.B. Artikel & Podcast):
     Stelle eine Rückfrage:
     „Du hast heute noch ${slots.article} Artikel- und ${slots.podcast} Podcast-Slots. Willst du lieber was hören oder was lesen?“
   - Wenn nur ein Format verfügbar ist:
     Frage:
     „Du hast heute noch ${slots.podcast} Podcast-Slots. Willst du was dazu hören?“
   - Wenn gar keine Slots mehr frei sind:
     Sag:
     „Heute bist du slot-mäßig voll. Lass uns nur sortieren, nicht noch mehr reinschütten.“
3. Nur wenn der User zustimmt oder ein Format benennt (oder explizit nach Empfehlung fragt):
   - Schlage GENAU EINEN Inhalt aus der Liste vor, passend zum Format.
   - Formuliere so:
     „Dann nimm: ‚TITEL‘ (FORMAT, Dauer XY). Das kostet dich 1 von ${slots.article + slots.podcast + slots.quote} Slots heute.“
4. Maximal 3 kurze Absätze. Kein Coaching-Blabla, kein Marketing.

STIL
- Direkt, aber nicht zynisch.
- Klartext statt Fachbegriffe.
- Du erinnerst an Grenzen („Slots“) statt zu pushen.

ANTWORTFORMAT
Schreibe eine einzige Chat-Antwort so, als würdest du 1:1 mit dem User schreiben.
Keine Bulletlisten, keine Systemerklärungen.

Antwort:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: fyfPrompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content || 'Keine Antwort',
      profile_used: !!profile,
      goal_used: !!goal,
      recommendations: recommendations
    });

  } catch (error) {
    console.error('Guide Chat Error:', error);
    return NextResponse.json({
      response: "Heute bist du slot-mäßig voll. Lass uns nur sortieren, nicht noch mehr reinschütten.",
      fallback: true
    });
  }
}
