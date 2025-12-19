import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { applySlotGuard, buildFYFPrompt, GuidePromptContext, GuideRecommendation, logGuideTurn, detectClusterFromIntent } from '@/lib/guidePrompt';
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
    
    console.log('[Guide Chat] User slots:', slots);

    // Erlaubte Formate - beide Varianten (deutsch/englisch) unterstützen
    const allowedFormats: string[] = [];
    if (slots.article > 0) {
      allowedFormats.push('Artikel', 'article', 'Article');
    }
    if (slots.podcast > 0) {
      allowedFormats.push('Podcast', 'podcast');
    }
    if (slots.quote > 0) {
      allowedFormats.push('Zitat', 'quote', 'Quote');
    }

    // Empfehlungen holen - nur veröffentlichte Items
    type ContentItemRow = {
      id: string;
      title: string;
      cluster: string | null;
      format: string | null;
      url: string | null;
      read_time_minutes: number | null;
      subtitle: string | null;
    };

    // Erkenne Cluster aus User-Intent
    const detectedCluster = detectClusterFromIntent(message);
    console.log('[Guide Chat] Detected cluster from intent:', detectedCluster || 'none');

    // Limit erhöhen, wenn Cluster erkannt (mehr Items für bessere Auswahl)
    // Erwartung: 2 Podcasts + 3 Articles + 2 Quotes = 7 Items
    const itemLimit = detectedCluster ? 7 : 3;

    let recommendations: GuideRecommendation[] = [];
    if (allowedFormats.length > 0) {
      console.log('[Guide Chat] Fetching items with formats:', allowedFormats);
      
      let query = supabase
        .from('content_items')
        .select('id, title, cluster, format, url, read_time_minutes, subtitle')
        .eq('is_published', true)
        .in('format', allowedFormats);
      
      // Filter nach Cluster, wenn erkannt
      if (detectedCluster) {
        query = query.eq('cluster', detectedCluster);
        console.log(`[Guide Chat] Filtering by cluster: ${detectedCluster} (limit: ${itemLimit})`);
      }
      
      const { data, error: itemsError } = await query
        .order('created_at', { ascending: false })
        .limit(itemLimit)
        .returns<ContentItemRow[]>();
      
      if (itemsError) {
        console.error('[Guide Chat] Error fetching content items:', itemsError);
      } else {
        console.log(`[Guide Chat] Found ${data?.length || 0} items:`, data?.map(r => ({ id: r.id, title: r.title, format: r.format })));
      }
      
      recommendations =
        (data || []).map((r) => ({
          id: String(r.id),
          title: r.title,
          format: r.format || 'Artikel',
          cluster: r.cluster,
          read_time_minutes: r.read_time_minutes,
          why: detectedCluster 
            ? `Cluster ${r.cluster} (erkannt aus deiner Nachricht).` 
            : (r.cluster ? `Cluster ${r.cluster}.` : (r.subtitle || null)),
        })) || [];
      
      // Fallback: Wenn keine Items mit Cluster-Filter gefunden, versuche ohne Cluster-Filter
      if (recommendations.length === 0 && detectedCluster && allowedFormats.length > 0) {
        console.log('[Guide Chat] No items found with cluster filter, trying without cluster filter...');
        const { data: fallbackData } = await supabase
          .from('content_items')
          .select('id, title, cluster, format, url, read_time_minutes, subtitle')
          .eq('is_published', true)
          .in('format', allowedFormats)
          .order('created_at', { ascending: false })
          .limit(3)
          .returns<ContentItemRow[]>();
        
        if (fallbackData && fallbackData.length > 0) {
          console.log(`[Guide Chat] Fallback found ${fallbackData.length} items`);
          recommendations = fallbackData.map((r) => ({
            id: String(r.id),
            title: r.title,
            format: r.format || 'Artikel',
            cluster: r.cluster,
            read_time_minutes: r.read_time_minutes,
            why: r.cluster ? `Cluster ${r.cluster}.` : (r.subtitle || null),
          }));
        }
      }
      
      // Finaler Fallback: Wenn immer noch keine Items, versuche ohne Format-Filter
      if (recommendations.length === 0 && allowedFormats.length > 0) {
        console.log('[Guide Chat] No items found, trying without format filter...');
        const { data: finalFallbackData } = await supabase
          .from('content_items')
          .select('id, title, cluster, format, url, read_time_minutes, subtitle')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3)
          .returns<ContentItemRow[]>();
        
        if (finalFallbackData && finalFallbackData.length > 0) {
          console.log(`[Guide Chat] Final fallback found ${finalFallbackData.length} items`);
          recommendations = finalFallbackData.map((r) => ({
            id: String(r.id),
            title: r.title,
            format: r.format || 'Artikel',
            cluster: r.cluster,
            read_time_minutes: r.read_time_minutes,
            why: r.cluster ? `Cluster ${r.cluster}.` : (r.subtitle || null),
          }));
        }
      }
    } else {
      console.log('[Guide Chat] No allowed formats - skipping item fetch (all slots are 0)');
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

    // Format slots_remaining für Response
    const slotsRemaining = {
      article: `${slots.article}/${typeof profile?.slots_article === 'number' ? profile.slots_article : '∞'}`,
      podcast: `${slots.podcast}/${typeof profile?.slots_podcast === 'number' ? profile.slots_podcast : '∞'}`,
      quote: `${slots.quote}/${typeof profile?.slots_quote === 'number' ? profile.slots_quote : '∞'}`,
    };

    // Format recommendations für Response (ohne id und why, nur relevante Felder)
    const formattedRecommendations = recommendations.map(r => ({
      title: r.title,
      cluster: r.cluster,
      format: r.format,
      read_time_minutes: r.read_time_minutes,
    }));

    return NextResponse.json({
      response: cleanResponse,
      profile_used: !!profile,
      goal_used: !!goal,
      recommendations: formattedRecommendations,
      selected_item: finalItems.length > 0 ? {
        title: finalItems[0].title,
        cluster: finalItems[0].cluster,
        format: finalItems[0].format,
        read_time_minutes: finalItems[0].read_time_minutes,
      } : null,
      session_id: sessionId,
      detectedCluster: detectedCluster || null,
      slots_remaining: slotsRemaining
    });

  } catch (error) {
    console.error('Guide Chat Error:', error);
    return NextResponse.json({
      response: "Lass uns kurz sortieren. Was davon stresst dich gerade am meisten?",
      fallback: true
    });
  }
}
