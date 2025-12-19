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
      transparency_reason: string | null;
    };

    // Erkenne Cluster aus User-Intent
    const detectedCluster = detectClusterFromIntent(message);
    console.log('[Guide Chat] Detected cluster from intent:', detectedCluster || 'none');

    // FYF Architektur: Nur 1 Item für den Chat (selected_item)
    // Die AI wählt das beste Item aus, daher reicht 1 Item aus der DB
    const itemLimit = detectedCluster ? 1 : 1;

    let recommendations: GuideRecommendation[] = [];
    if (allowedFormats.length > 0) {
      console.log('[Guide Chat] Fetching items with formats:', allowedFormats);
      
      let query = supabase
        .from('content_items')
        .select('id, title, cluster, format, url, read_time_minutes, subtitle, transparency_reason')
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
        (data || []).map((r) => {
          // Fallback: Wenn kein transparency_reason, generiere minimalen Text
          const fallbackWhy = r.cluster 
            ? (detectedCluster ? `Cluster ${r.cluster} (erkannt aus deiner Nachricht).` : `Cluster ${r.cluster}.`)
            : (r.subtitle || null);
          
          return {
            id: String(r.id),
            title: r.title,
            format: r.format || 'Artikel',
            cluster: r.cluster,
            read_time_minutes: r.read_time_minutes,
            url: r.url,
            subtitle: r.subtitle,
            why: r.transparency_reason || fallbackWhy,
          };
        }) || [];
      
      // Fallback: Wenn keine Items mit Cluster-Filter gefunden, versuche ohne Cluster-Filter
      if (recommendations.length === 0 && detectedCluster && allowedFormats.length > 0) {
        console.log('[Guide Chat] No items found with cluster filter, trying without cluster filter...');
        const { data: fallbackData } = await supabase
          .from('content_items')
          .select('id, title, cluster, format, url, read_time_minutes, subtitle, transparency_reason')
          .eq('is_published', true)
          .in('format', allowedFormats)
          .order('created_at', { ascending: false })
          .limit(1)
          .returns<ContentItemRow[]>();
        
        if (fallbackData && fallbackData.length > 0) {
          console.log(`[Guide Chat] Fallback found ${fallbackData.length} items`);
          recommendations = fallbackData.map((r) => {
            const fallbackWhy = r.cluster ? `Cluster ${r.cluster}.` : (r.subtitle || null);
            return {
              id: String(r.id),
              title: r.title,
              format: r.format || 'Artikel',
              cluster: r.cluster,
              read_time_minutes: r.read_time_minutes,
              url: r.url,
              subtitle: r.subtitle,
              why: r.transparency_reason || fallbackWhy,
            };
          });
        }
      }
      
      // Finaler Fallback: Wenn immer noch keine Items, versuche ohne Format-Filter
      if (recommendations.length === 0 && allowedFormats.length > 0) {
        console.log('[Guide Chat] No items found, trying without format filter...');
        const { data: finalFallbackData } = await supabase
          .from('content_items')
          .select('id, title, cluster, format, url, read_time_minutes, subtitle, transparency_reason')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .returns<ContentItemRow[]>();
        
        if (finalFallbackData && finalFallbackData.length > 0) {
          console.log(`[Guide Chat] Final fallback found ${finalFallbackData.length} items`);
          recommendations = finalFallbackData.map((r) => {
            const fallbackWhy = r.cluster ? `Cluster ${r.cluster}.` : (r.subtitle || null);
            return {
              id: String(r.id),
              title: r.title,
              format: r.format || 'Artikel',
              cluster: r.cluster,
              read_time_minutes: r.read_time_minutes,
              url: r.url,
              subtitle: r.subtitle,
              why: r.transparency_reason || fallbackWhy,
            };
          });
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

    // FYF Architektur: 1 kuratiertes Item im Chat, Rest im Feedboard
    // selected_item: Das eine Item, das der Guide im Chat hervorhebt
    // feedboard_items: Restliche passende Items aus dem Cluster für das Feedboard
    
    // Fallback: Wenn AI kein Item explizit auswählt, aber Items vorhanden sind, nimm das erste
    const selectedItem = finalItems.length > 0 
      ? finalItems[0] 
      : (recommendations.length > 0 ? recommendations[0] : null);
    
    // Restliche Items aus dem Cluster (ohne das selected_item)
    const feedboardItems = recommendations
      .filter(r => !selectedItem || r.id !== selectedItem.id)
      .map(r => ({
        id: r.id,
        title: r.title,
        cluster: r.cluster,
        format: r.format,
        read_time_minutes: r.read_time_minutes,
        url: r.url || null,
        subtitle: r.subtitle || null,
        why: r.why || null, // Enthält transparency_reason oder Fallback
        guideWhy: r.why || null, // Supabase-Text (transparency_reason) für Frontend
      }));

    return NextResponse.json({
      response: cleanResponse,
      profile_used: !!profile,
      goal_used: !!goal,
      // selected_item: Das eine kuratierte Item für den Chat
      selected_item: selectedItem ? {
        id: selectedItem.id,
        title: selectedItem.title,
        cluster: selectedItem.cluster,
        format: selectedItem.format,
        read_time_minutes: selectedItem.read_time_minutes,
        url: selectedItem.url || null,
        subtitle: selectedItem.subtitle || null,
        why: selectedItem.why || null, // Enthält transparency_reason oder Fallback
        guideWhy: selectedItem.why || null, // Supabase-Text (transparency_reason) für Frontend
      } : null,
      // feedboard_items: Restliche Items für das Feedboard
      feedboard_items: feedboardItems,
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
