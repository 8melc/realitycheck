import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { applySlotGuard, buildFYFPrompt, GuidePromptContext, GuideRecommendation, logGuideTurn } from '@/lib/guidePrompt';
import { fetchCodex } from '@/lib/codexAdapter';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const sessionId = randomUUID();

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-...') {
      throw new Error('OpenAI API Key is missing or default');
    }

    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Type definitions
    type UserProfile = {
      display_name: string | null;
      focus_topic: string | null;
      bio: string | null;
      slots_article: number | null;
      slots_podcast: number | null;
      slots_quote: number | null;
    };

    type UserGoal = {
      title: string | null;
    };

    // Profil + Ziel laden
    let profile: UserProfile | null = null;
    let goal: UserGoal | null = null;

    if (user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('display_name, focus_topic, bio, slots_article, slots_podcast, slots_quote')
        .eq('user_id', user.id)
        .maybeSingle<UserProfile>();
      profile = profileData ?? null;

      const { data: goalData } = await supabase
        .from('user_goals')
        .select('title')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle<UserGoal>();
      goal = goalData ?? null;
    }

    // Slots extrahieren
    const slots = {
      article: typeof profile?.slots_article === 'number' ? profile.slots_article : 3,
      podcast: typeof profile?.slots_podcast === 'number' ? profile.slots_podcast : 2,
      quote: typeof profile?.slots_quote === 'number' ? profile.slots_quote : 4
    };

    // Erlaubte Formate
    const allowedFormats: string[] = [];
    if (slots.article > 0) allowedFormats.push('Artikel', 'article');
    if (slots.podcast > 0) allowedFormats.push('Podcast', 'podcast');
      if (slots.quote > 0) allowedFormats.push('Zitat', 'quote');

    // Empfehlungen holen
    let recommendations: GuideRecommendation[] = [];
    if (allowedFormats.length > 0) {
      const { data } = await supabase
        .from('content_items')
        .select('id, title, cluster, format, url, read_time_minutes')
        .or('is_published.eq.true,is_published.is.null')
        .in('format', allowedFormats)
        .limit(3);
      recommendations =
        (data || []).map((r) => ({
          id: String(r.id),
          title: r.title,
          format: r.format,
          cluster: r.cluster,
          read_time_minutes: r.read_time_minutes,
          why: r.cluster ? `Cluster ${r.cluster}.` : null,
        })) || [];
    }

    // Build prompt context
    const promptContext: GuidePromptContext = {
      profile: {
        name: profile?.display_name || null,
        primary_goal: goal?.title || null,
      },
      slots: {
        article: {
          available: slots.article,
          daily_limit: profile?.slots_article ?? '∞',
        },
        podcast: {
          available: slots.podcast,
          daily_limit: profile?.slots_podcast ?? '∞',
        },
        quote: {
          available: slots.quote,
          daily_limit: profile?.slots_quote ?? '∞',
        },
      },
      recommendations,
      state: {
        no_content: false,
        tone: 'straight',
      },
    };

    // Guard against zero slots or explicit no-content flag
    const guard = applySlotGuard(promptContext);
    if (guard.override) {
      promptContext.state = {
        ...promptContext.state,
        no_content: true,
        guardMessage: guard.system_message,
      };
      // Keine Empfehlungen anhängen, wenn keine Inhalte erlaubt sind
      promptContext.recommendations = [];
    }

    const codexText = await fetchCodex(supabase);

    const fyfPrompt = buildFYFPrompt(promptContext, message, {
      codexText,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: fyfPrompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content || 'Keine Antwort';
    
    const idMatch = aiResponse.match(/\[\[ID:\s*(.+?)\]\]/);
    const selectedId = idMatch ? idMatch[1].trim() : null;
    const cleanResponse = aiResponse.replace(/\[\[ID:\s*.+?\]\]/, '').trim();

    const finalItems = selectedId 
      ? recommendations.filter(r => r.id === selectedId)
      : [];

    await logGuideTurn(
      supabase,
      user?.id || 'anon',
      sessionId,
      fyfPrompt,
      cleanResponse,
      promptContext.slots,
      promptContext.slots // TODO: reflect post-consumption slots when decremented
    );

    return NextResponse.json({
      response: cleanResponse,
      profile_used: !!profile,
      goal_used: !!goal,
      recommendations: finalItems,
      session_id: sessionId
    });

  } catch (error) {
    console.error('Guide Chat Error:', error);
    return NextResponse.json({
      response: "Lass uns kurz sortieren. Was davon stresst dich gerade am meisten?",
      fallback: true
    });
  }
}
