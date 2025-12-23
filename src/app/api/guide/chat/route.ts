import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { applySlotGuard, buildFYFPrompt, GuidePromptContext, GuideRecommendation, logGuideTurn, detectClusterFromIntent, computeContentEligibility, getGlobalBestMatchRecommendation, isInFocusWindow } from '@/lib/guidePrompt';
import { fetchCodex } from '@/lib/codexAdapter';
import type { Database } from '@/lib/types/database.types';

type GuideConversation = Database['public']['Tables']['guide_conversations']['Row'];
type GuideSession = Database['public']['Tables']['guide_sessions']['Row'];
type GuideConversationInsert = Database['public']['Tables']['guide_conversations']['Insert'];
type GuideSessionInsert = Database['public']['Tables']['guide_sessions']['Insert'];

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

/**
 * POST /api/guide/chat
 * 
 * Guide chat endpoint with user profile context.
 * 
 * OWNERSHIP: This API reads specific profile fields needed for Guide functionality.
 * 
 * Fields read from user_profiles:
 * - display_name (for personalization)
 * - focus_topic (for context)
 * - bio (for context)
 * - slots_article, slots_podcast, slots_quote (for content slot management)
 * - answer_style (for response length)
 * - guide_tone (for response tone)
 * - focus_window (for time-based recommendations)
 * - nudging_frequency (for nudging behavior)
 * 
 * Plus from user_goals (join): title (as primary_goal)
 * 
 * This API does NOT read birth_date, target_age, is_public (not needed for Guide).
 * 
 * See FIELD_MATRIX.md and API_OWNERSHIP.md for complete field ownership rules.
 */
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
      nudging_frequency: 'minimal' | 'standard' | 'frequent' | null;
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
      const { data: session, error: sessionError } = await (supabase
        .from('guide_sessions')
        .insert({
          user_id: user.id,
          title: message.slice(0, 80), // Erste 80 Zeichen als Titel
        } as any)
        .select('id')
        .single()) as { data: { id: string } | null; error: any };

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
      const { data: existingSession, error: sessionCheckError } = await (supabase
        .from('guide_sessions')
        .select('id, user_id')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()) as { data: { id: string; user_id: string } | null; error: any };

      if (sessionCheckError || !existingSession) {
        // Session existiert nicht → neue Session erstellen
        console.warn('[Guide Chat] Session not found, creating new session:', {
          provided_session_id: sessionId,
          error: sessionCheckError
        });
        
        const { data: newSession, error: newSessionError } = await (supabase
          .from('guide_sessions')
          .insert({
            user_id: user.id,
            title: message.slice(0, 80),
          } as any)
          .select('id')
          .single()) as { data: { id: string } | null; error: any };

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
        // @ts-ignore - Supabase type inference issue with guide_sessions table
        const { error: updateError } = await (supabase
          .from('guide_sessions') as any)
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
      .order('created_at', { ascending: true })
      .returns<Pick<GuideConversation, 'role' | 'message' | 'created_at'>[]>();

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

    // Load user profile for Guide context
    // EXPLICIT select list - only fields needed for Guide functionality (see FIELD_MATRIX.md)
    // This API reads private + public fields needed for Guide responses:
    // - display_name, focus_topic, bio (for personalization)
    // - slots_article, slots_podcast, slots_quote (for content recommendations)
    // - answer_style, guide_tone, focus_window, nudging_frequency (for Guide behavior)
    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('display_name, focus_topic, bio, slots_article, slots_podcast, slots_quote, answer_style, guide_tone, focus_window, nudging_frequency, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle<UserProfile & { onboarding_completed?: boolean }>();
      
      if (profileError) {
        console.error('[Guide Chat] Error loading profile:', profileError);
      }
      
      console.log('[Guide Chat] Profile data from DB:', {
        hasProfile: !!profileData,
        answer_style: profileData?.answer_style,
        guide_tone: profileData?.guide_tone,
        focus_window: profileData?.focus_window,
        nudging_frequency: profileData?.nudging_frequency,
      });
      
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

    // A) Eligibility berechnen (vor Content Query)
    const suggestAfterMessages = 3;
    const userTurnsInSession = userTurnCountInSession;
    const hasSlots = slots.article > 0 || slots.podcast > 0 || slots.quote > 0;
    // falls es ein User-Setting gibt, hier rein:
    const noContentUserSetting = false;

    // Load settings early for focus window check
    const answerStyle = profile?.answer_style || 'medium';
    const guideTone = profile?.guide_tone || 'Straight';
    const focusWindow = profile?.focus_window || 'evening';
    const nudgingFrequency = profile?.nudging_frequency || 'standard';

    // Mapping: DB values (English) → German labels for prompt
    const mapAnswerStyleToGerman = (style: 'short' | 'medium' | 'long'): 'Kurz' | 'Medium' | 'Ausführlich' => {
      const map: Record<'short' | 'medium' | 'long', 'Kurz' | 'Medium' | 'Ausführlich'> = {
        short: 'Kurz',
        medium: 'Medium',
        long: 'Ausführlich',
      };
      return map[style];
    };

    const mapFocusWindowToGerman = (window: 'morning' | 'afternoon' | 'evening' | 'late_night'): 'Morgen' | 'Nachmittag' | 'Abend' | 'Spät' => {
      const map: Record<'morning' | 'afternoon' | 'evening' | 'late_night', 'Morgen' | 'Nachmittag' | 'Abend' | 'Spät'> = {
        morning: 'Morgen',
        afternoon: 'Nachmittag',
        evening: 'Abend',
        late_night: 'Spät',
      };
      return map[window];
    };

    const mapNudgingFrequencyToGerman = (freq: 'minimal' | 'standard' | 'frequent'): 'Minimal' | 'Standard' | 'Häufig' => {
      const map: Record<'minimal' | 'standard' | 'frequent', 'Minimal' | 'Standard' | 'Häufig'> = {
        minimal: 'Minimal',
        standard: 'Standard',
        frequent: 'Häufig',
      };
      return map[freq];
    };

    const answerLength = mapAnswerStyleToGerman(answerStyle);
    const focusTime = mapFocusWindowToGerman(focusWindow);
    const nudgingFrequencyGerman = mapNudgingFrequencyToGerman(nudgingFrequency);

    const eligibility = computeContentEligibility({
      message,
      userTurnsInSession,
      suggestAfterMessages,
      hasSlots,
      noContentUserSetting,
    });

    // Check focus window and combine with eligibility
    const inFocusWindow = isInFocusWindow(new Date(), focusTime);
    // Content is only eligible if both eligibility check AND focus window check pass
    const contentEligible = eligibility.eligible && inFocusWindow;

    console.log('[Guide Chat] Content eligibility:', {
      eligible: contentEligible,
      eligibilityCheck: eligibility.eligible,
      inFocusWindow,
      focusTime,
      reason: eligibility.reason,
      explicitAsk: eligibility.explicitAsk,
      stuckSignal: eligibility.stuckSignal,
      userTurns: userTurnsInSession,
    });

    // Erkenne Cluster aus User-Intent (immer, auch wenn nicht eligible, für Response)
    const detectedCluster = detectClusterFromIntent(message);
    console.log('[Guide Chat] Detected cluster from intent:', detectedCluster || 'none');

    // B) Nur dann 1 Item holen (global best match)
    let recommendations: GuideRecommendation[] = [];

    if (contentEligible && allowedFormats.length > 0) {

      const best = await getGlobalBestMatchRecommendation({
        supabase,
        message,
        detectedCluster,
        allowedFormats,
        explicitAsk: eligibility.explicitAsk,
        limitCandidates: 30,
      });

      if (best) {
        recommendations = [best];
        console.log('[Guide Chat] Global best match found:', {
          id: best.id,
          title: best.title,
          format: best.format,
          cluster: best.cluster,
        });
      } else {
        console.log('[Guide Chat] No matching item found (score too low or no items)');
      }
    } else {
      if (!contentEligible) {
        console.log('[Guide Chat] Content not eligible - skipping item fetch');
      } else if (allowedFormats.length === 0) {
        console.log('[Guide Chat] No allowed formats - skipping item fetch (all slots are 0)');
      }
    }

    // C) PromptContext so setzen, dass Inventory wirklich "AUS" ist wenn nicht eligible
    const promptContext: GuidePromptContext & {
      state: GuidePromptContext['state'] & {
        suggestAfterMessages?: number;
        userTurnCountInSession?: number;
        answerLength?: string;
        focusTime?: string;
        nudgingFrequency?: string;
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
      recommendations, // ist [] wenn nicht eligible oder kein Match
      state: {
        no_content: !contentEligible || recommendations.length === 0, // Wichtig: true wenn nicht eligible ODER kein Match
        tone: guideTone,
        avoidClusters: [],
        preferFormats: [],
        guardMessage: undefined,
        suggestAfterMessages,
        userTurnCountInSession: userTurnsInSession,
        answerLength,
        focusTime,
        nudgingFrequency: nudgingFrequencyGerman,
      },
    };

    // Guard against zero slots or explicit no-content flag (zusätzliche Sicherheit)
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

    // First message after onboarding: Add special system message
    const isFirstMessageAfterOnboarding = !sessionId && 
                                          (profile as any)?.onboarding_completed && 
                                          messagesForContext.length === 0;
    
    let systemMessagePrefix = '';
    if (isFirstMessageAfterOnboarding) {
      systemMessagePrefix = `[SYSTEM: User hat gerade Onboarding abgeschlossen. Dies ist die erste Nachricht im Guide. Beginne mit diesem Statement:]
"Ich kenne jetzt dein Setup. Wenn du willst, fangen wir mit einer einfachen Frage an: Was beschäftigt dich gerade wirklich?"

[WICHTIG: Dieses Statement ist PFLICHT als erste Antwort. Danach normal weiter.]\n\n`;
    }

    const fyfPrompt = buildFYFPrompt(promptContext, message, {
      codexText,
      systemMessagePrefix,
    });

    // Antwortlänge aus Profil bestimmen (stärkere Differenzierung)
    const maxTokensByStyle: Record<'short' | 'medium' | 'long', number> = {
      short: 150,  // Deutlich niedriger für wirklich kurze Antworten
      medium: 450,
      long: 1000,  // Höher für ausführliche Antworten
    };

    const maxTokens = maxTokensByStyle[answerStyle];

    // Logging: Guide Settings (erweitert für Debugging)
    console.log('[Guide Settings]', {
      tone: guideTone,
      toneFromProfile: profile?.guide_tone,
      answerLength,
      answerStyleFromProfile: profile?.answer_style,
      nudgingFrequency: nudgingFrequencyGerman,
      focusTime,
      inFocusWindow,
      contentEligible,
      max_output_tokens: maxTokens,
      promptContextState: {
        tone: promptContext.state.tone,
        answerLength: promptContext.state.answerLength,
        focusTime: promptContext.state.focusTime,
      },
    });

    // OpenAI Messages mit optionaler Summary
    const openAiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: fyfPrompt.system },
      ...(summaryMessage ? [{ role: 'assistant' as const, content: summaryMessage }] : []),
      ...fyfPrompt.history,
      { role: 'user' as const, content: message },
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
          const { data: msgData, error: msgError } = await (supabase
            .from('guide_conversations')
            .insert({
              user_id: user.id,
              session_id: activeSessionId,
              role,
              message: msg,
              created_at: now,
            } as any)
            .select('id')
            .single()) as { data: { id: string } | null; error: any };

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
                const { data: newSession, error: newSessionError } = await (supabase
                  .from('guide_sessions')
                  .insert({
                    user_id: user.id,
                    title: message.slice(0, 80),
                  } as any)
                  .select('id')
                  .single()) as { data: { id: string } | null; error: any };

                if (newSessionError || !newSession) {
                  console.error('[Guide Chat] ERROR: Could not create fallback session:', newSessionError);
                  return { success: false };
                }

                // Retry with new session ID
                console.log('[Guide Chat] Retrying message save with new session:', newSession.id);
                const { data: retryData, error: retryError } = await (supabase
                  .from('guide_conversations')
                  .insert({
                    user_id: user.id,
                    session_id: newSession.id,
                    role,
                    message: msg,
                    created_at: now,
                  } as any)
                  .select('id')
                  .single()) as { data: { id: string } | null; error: any };

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
