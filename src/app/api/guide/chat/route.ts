import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { applySlotGuard, buildFYFPrompt, GuidePromptContext, GuideRecommendation, logGuideTurn, detectClusterFromIntent } from '@/lib/guidePrompt';
import { fetchCodex } from '@/lib/codexAdapter';

export type GuideChatRequest = {
  message: string;
  sessionId?: string;   // optional: wenn leer -> neue Session
};

export type GuideChatResponse = {
  response: string;
  session_id: string;
  profile_used: boolean;
  goal_used: boolean;
  selected_item: any | null;
  feedboard_items: any[];
  detectedCluster: string | null;
  slots_remaining: {
    article: string;
    podcast: string;
    quote: string;
  };
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json() as {
      message: string;
      sessionId?: string;
    };

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-...') {
      throw new Error('OpenAI API Key is missing or default');
    }

    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Type definitions
    type UserProfile = {
      display_name: string | null;
      focus_topic: string | null;
      bio: string | null;
      slots_article: number | null;
      slots_podcast: number | null;
      slots_quote: number | null;
      answer_style: 'short' | 'medium' | 'long' | null;
      guide_tone: 'Soft Touch' | 'Straight' | 'Hard Truth' | null;
      focus_window: 'morning' | 'afternoon' | 'evening' | 'late_night' | null;
    };

    type UserGoal = {
      title: string | null;
    };

    // Session-Handling: Erstellen oder Fortsetzen
    const MAX_MESSAGES_PER_SESSION = 50;
    const MAX_MESSAGES_FOR_MODEL = 60;
    let activeSessionId: string;

    if (!sessionId) {
      // Neue Session erstellen
      console.log('[Guide Chat] Creating new session for user:', user.id);
      const { data: session, error: sessionError } = await supabase
        .from('guide_sessions')
        .insert({
          user_id: user.id,
          title: message.slice(0, 80), // Erste 80 Zeichen als Titel
        })
        .select('id')
        .single();

      if (sessionError || !session) {
        console.error('[Guide Chat] ERROR creating session:', {
          error: sessionError,
          code: sessionError?.code,
          message: sessionError?.message,
          details: sessionError?.details,
          hint: sessionError?.hint
        });
        throw sessionError || new Error('Could not create session');
      }

      activeSessionId = session.id;
      console.log('[Guide Chat] Successfully created session:', activeSessionId);
    } else {
      // Bestehende Session prüfen und fortführen
      console.log('[Guide Chat] Checking existing session:', sessionId);
      
      // WICHTIG: Prüfe zuerst, ob die Session überhaupt existiert
      const { data: existingSession, error: sessionCheckError } = await supabase
        .from('guide_sessions')
        .select('id, user_id')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionCheckError || !existingSession) {
        // Session existiert nicht → neue Session erstellen
        console.warn('[Guide Chat] Session not found, creating new session:', {
          provided_session_id: sessionId,
          error: sessionCheckError
        });
        
        const { data: newSession, error: newSessionError } = await supabase
          .from('guide_sessions')
          .insert({
            user_id: user.id,
            title: message.slice(0, 80),
          })
          .select('id')
          .single();

        if (newSessionError || !newSession) {
          console.error('[Guide Chat] ERROR creating fallback session:', {
            error: newSessionError,
            code: newSessionError?.code,
            message: newSessionError?.message
          });
          throw newSessionError || new Error('Could not create fallback session');
        }

        activeSessionId = newSession.id;
        console.log('[Guide Chat] Created fallback session:', activeSessionId);
      } else {
        // Session existiert → fortführen
        console.log('[Guide Chat] Session exists, continuing:', sessionId);
        
        // Prüfe Max. Chat-Länge
        const { count: messageCount, error: countError } = await supabase
          .from('guide_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('session_id', sessionId);

        if (countError) {
          console.error('[Guide Chat] Error counting messages:', countError);
        }

        if (messageCount !== null && messageCount >= MAX_MESSAGES_PER_SESSION) {
          return NextResponse.json({
            error: 'Session limit reached',
            message: `Diese Session hat bereits ${messageCount} Nachrichten erreicht. Bitte starte ein neues Gespräch.`,
            max_messages: MAX_MESSAGES_PER_SESSION,
            current_count: messageCount
          }, { status: 400 });
        }

        // Session updated_at aktualisieren
        const { error: updateError } = await supabase
          .from('guide_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId)
          .eq('user_id', user.id);

        if (updateError) {
          console.warn('[Guide Chat] Warning: Could not update session timestamp:', updateError);
        }

        activeSessionId = sessionId;
      }
    }

    // Profil + Ziel laden
    let profile: UserProfile | null = null;
    let goal: UserGoal | null = null;

    // History aus aktueller Session laden
    const { data: allMessages, error: convError } = await supabase
      .from('guide_conversations')
      .select('role, message, created_at')
      .eq('user_id', user.id)
      .eq('session_id', activeSessionId)
      .order('created_at', { ascending: true });

    if (convError) {
      console.error('[Guide Chat] Error loading conversation history:', convError);
    }

    const messagesForContext = allMessages || [];

    // History-Truncation: Wenn > MAX_MESSAGES_FOR_MODEL, ältere zusammenfassen
    let summaryMessage: string | null = null;
    let recentMessages = messagesForContext;

    if (messagesForContext.length > MAX_MESSAGES_FOR_MODEL) {
      // Ältere Nachrichten zusammenfassen
      const older = messagesForContext.slice(0, messagesForContext.length - MAX_MESSAGES_FOR_MODEL);
      const newer = messagesForContext.slice(-MAX_MESSAGES_FOR_MODEL);

      // Einfache Text-Zusammenfassung (kann später durch AI-Summary ersetzt werden)
      const olderText = older.map((m) => `${m.role === 'user' ? 'User' : 'Guide'}: ${m.message}`).join('\n');
      summaryMessage = `Bisherige Session-Zusammenfassung: User und Guide haben über verschiedene Themen gesprochen. (${older.length} ältere Nachrichten zusammengefasst.)`;

      recentMessages = newer;
    }

    // lastMessages-Array für Prompt bauen
    const lastMessages = recentMessages.map((m) =>
      `${m.role === 'user' ? 'User' : 'Guide'}: ${m.message}`
    );

    // User-Turn-Count nur aus aktueller Session
    const userTurnCountInSession = messagesForContext.filter((m) => m.role === 'user').length;

    if (user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('display_name, focus_topic, bio, slots_article, slots_podcast, slots_quote, answer_style, guide_tone, focus_window')
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
    const answerStyle = profile?.answer_style || 'medium';
    const guideTone = profile?.guide_tone || 'Straight';

    const promptContext: GuidePromptContext & {
      state: GuidePromptContext['state'] & {
        suggestAfterMessages?: number;
        userTurnCountInSession?: number;
      };
    } = {
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
      lifeWeeks: {
        weeksRemaining: null,
        percentageLived: null,
      },
      lastMessages,
      recommendations,
      state: {
        no_content: false,
        tone: guideTone,
        avoidClusters: [],
        preferFormats: [],
        guardMessage: undefined,
        suggestAfterMessages: 3,
        userTurnCountInSession: userTurnCountInSession,
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

    // Antwortlänge aus Profil bestimmen
    const maxTokensByStyle: Record<'short' | 'medium' | 'long', number> = {
      short: 250,
      medium: 450,
      long: 800,
    };

    const maxTokens = maxTokensByStyle[answerStyle];

    // OpenAI Messages mit optionaler Summary
    const openAiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: fyfPrompt.system },
      ...(summaryMessage ? [{ role: 'assistant', content: summaryMessage }] : []),
      ...fyfPrompt.history,
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openAiMessages,
      max_tokens: maxTokens,
      temperature: 0.6, // etwas stabiler für Struktur
    });

    const aiResponse = completion.choices[0].message.content || 'Keine Antwort';
    
    const idMatch = aiResponse.match(/\[\[ID:\s*(.+?)\]\]/);
    const selectedId = idMatch ? idMatch[1].trim() : null;
    const cleanResponse = aiResponse.replace(/\[\[ID:\s*.+?\]\]/, '').trim();

    const finalItems = selectedId 
      ? recommendations.filter(r => r.id === selectedId)
      : [];

    // Format prompt for logging (combine system + history + user message)
    const promptForLogging = [
      `SYSTEM:\n${fyfPrompt.system}`,
      ...fyfPrompt.history.map(m => `${m.role.toUpperCase()}:\n${m.content}`),
      `USER:\n${message}`
    ].join('\n\n');

    await logGuideTurn(
      supabase,
      user.id,
      activeSessionId,
      promptForLogging,
      cleanResponse,
      promptContext.slots,
      promptContext.slots // TODO: reflect post-consumption slots when decremented
    );

    // Save conversation to guide_conversations table for dashboard history
    try {
      // Validate session_id before saving
      if (!activeSessionId) {
        console.error('[Guide Chat] ERROR: activeSessionId is missing! Cannot save conversation.');
      } else {
        const now = new Date().toISOString();
        
        console.log('[Guide Chat] Saving conversation:', {
          user_id: user.id,
          session_id: activeSessionId,
          message_length: message.length,
          response_length: cleanResponse.length
        });
        
        // Helper function to save message with fallback session creation
        const saveMessageWithFallback = async (
          role: 'user' | 'guide',
          msg: string,
          isRetry = false
        ): Promise<{ success: boolean; messageId?: string }> => {
          const { data: msgData, error: msgError } = await supabase
            .from('guide_conversations')
            .insert({
              user_id: user.id,
              session_id: activeSessionId,
              role,
              message: msg,
              created_at: now,
            })
            .select('id')
            .single();

          if (msgError) {
            // Check if it's a foreign key violation (23503)
            if (msgError.code === '23503' && !isRetry) {
              console.warn('[Guide Chat] Foreign key violation detected, verifying session exists...');
              
              // Verify session exists
              const { data: sessionCheck, error: checkError } = await supabase
                .from('guide_sessions')
                .select('id')
                .eq('id', activeSessionId)
                .eq('user_id', user.id)
                .single();

              if (checkError || !sessionCheck) {
                console.warn('[Guide Chat] Session does not exist, creating new session as fallback...');
                
                // Create new session
                const { data: newSession, error: newSessionError } = await supabase
                  .from('guide_sessions')
                  .insert({
                    user_id: user.id,
                    title: message.slice(0, 80),
                  })
                  .select('id')
                  .single();

                if (newSessionError || !newSession) {
                  console.error('[Guide Chat] ERROR: Could not create fallback session:', newSessionError);
                  return { success: false };
                }

                // Retry with new session ID
                console.log('[Guide Chat] Retrying message save with new session:', newSession.id);
                const { data: retryData, error: retryError } = await supabase
                  .from('guide_conversations')
                  .insert({
                    user_id: user.id,
                    session_id: newSession.id,
                    role,
                    message: msg,
                    created_at: now,
                  })
                  .select('id')
                  .single();

                if (retryError) {
                  console.error(`[Guide Chat] ERROR saving ${role} message (retry):`, {
                    error: retryError,
                    code: retryError.code,
                    message: retryError.message
                  });
                  return { success: false };
                }

                return { success: true, messageId: retryData?.id };
              }
            }

            console.error(`[Guide Chat] ERROR saving ${role} message:`, {
              error: msgError,
              code: msgError.code,
              message: msgError.message,
              details: msgError.details,
              hint: msgError.hint
            });
            return { success: false };
          }

          return { success: true, messageId: msgData?.id };
        };

        // Save user message first
        const userResult = await saveMessageWithFallback('user', message);
        if (userResult.success) {
          console.log('[Guide Chat] Successfully saved user message:', userResult.messageId);
        }

        // Save guide response immediately after (same timestamp for grouping)
        const guideResult = await saveMessageWithFallback('guide', cleanResponse);
        if (guideResult.success) {
          console.log('[Guide Chat] Successfully saved guide message:', guideResult.messageId);
        }
      }
    } catch (conversationError) {
      console.error('[Guide Chat] ERROR saving conversation (catch block):', conversationError);
      // Don't fail the request if conversation saving fails
    }

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
      session_id: activeSessionId, // Return session_id for frontend reference
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
