/**
 * Prompt utilities for the FYF Guide
 * - buildFYFPrompt: builds structured prompt layers (system/role/context/state/inventory/user)
 * - applySlotGuard: enforces slot and "no content" constraints before calling the LLM
 */

type SlotInfo = {
  available?: number;
  daily_limit?: number | string;
};

export type GuideRecommendation = {
  id: string;
  title: string;
  format: string;
  cluster?: string | null;
  read_time_minutes?: number | null;
  why?: string | null;
};

export type GuidePromptContext = {
  profile?: {
    name?: string | null;
    primary_goal?: string | null;
  };
  slots?: {
    article?: SlotInfo;
    podcast?: SlotInfo;
    quote?: SlotInfo;
  };
  lifeWeeks?: {
    weeksRemaining?: number | null;
    percentageLived?: number | null;
  };
  lastMessages?: string[];
  recommendations?: GuideRecommendation[];
  state?: {
    no_content?: boolean;
    tone?: string;
    avoidClusters?: string[];
    preferFormats?: string[];
    guardMessage?: string;
  };
};

export const buildFYFPrompt = (
  context: GuidePromptContext,
  userMessage: string,
  options?: {
    codexText?: string;
  }
): string => {
  const sections: string[] = [];

  const systemBase = `SYSTEM:
- Tool not Coach. User steuert, FYF folgt. Autonomie ist Bedingung.
- Zeit=Asset. Limits=Freedom. Transparenz: Liefere immer den Grund ("warum siehst du das?").
- Keine Listen/Walls of text. Max ein Gedanke pro Satz. Eine Frage pro Antwort.
- Content nur wenn erlaubt: exakt EIN Vorschlag und nur aus INVENTORY. Bei Verbot: kein Content.`;

  sections.push(options?.codexText ? `${systemBase}\n${options.codexText}` : systemBase);

  sections.push(
    `ROLE:
- FYF Guide. Direkt, respektvoll, urban. Spiegeln, nicht steuern.
- Keine Ratgeber-Floskeln. Beispiel-Ton: "Das ist tiefe Arbeit." / "15 Min. Lohnt sich oder skip."`
  );

  sections.push(
    `CONTEXT:
- User: ${context.profile?.name || 'Unbekannt'}
- Primärziel: ${context.profile?.primary_goal || 'nicht gesetzt'}
- Slots: Artikel ${context.slots?.article?.available ?? 0}/${context.slots?.article?.daily_limit ?? '∞'}, Podcasts ${context.slots?.podcast?.available ?? 0}/${context.slots?.podcast?.daily_limit ?? '∞'}, Zitate ${context.slots?.quote?.available ?? 0}/${context.slots?.quote?.daily_limit ?? '∞'}
- Life-in-Weeks: ${context.lifeWeeks?.weeksRemaining ?? '?'} Wochen übrig (${context.lifeWeeks?.percentageLived ?? '?'}% gelebt)
- Letzte Turns: ${(context.lastMessages || []).slice(-3).map((m) => `"${m}"`).join(' | ') || '–'}`
  );

  sections.push(
    `STATE:
- Content erlaubt: ${context.state?.no_content ? 'NEIN (User Wunsch)' : 'JA'}
- Tone: ${context.state?.tone || 'normal'}
- Avoid clusters: ${(context.state?.avoidClusters || []).join(', ') || '–'}
- Prefer formats: ${(context.state?.preferFormats || []).join(', ') || '–'}${context.state?.guardMessage ? `\n- Guard: ${context.state.guardMessage}` : ''}`
  );

  sections.push(
    `INVENTORY (bereitgestellt):
${(context.recommendations || [])
  .map(
    (r) =>
      `- [ID:${r.id}] ${r.title} (${r.format}, Cluster ${r.cluster || '?'}, Dauer ${
        r.read_time_minutes ?? '?'
      }m). Warum: ${r.why || '—'}`
  )
  .join('\n') || '- Keine passenden Items gefunden.'}`
  );

  sections.push(`USER:\n${userMessage}`);

  return sections.join('\n\n').trim();
};

export const applySlotGuard = (context: GuidePromptContext) => {
  const hasSlots =
    (context.slots?.article?.available ?? 0) > 0 ||
    (context.slots?.podcast?.available ?? 0) > 0 ||
    (context.slots?.quote?.available ?? 0) > 0;

  if (!hasSlots || context.state?.no_content) {
    return {
      override: true,
      system_message: 'KEINE Vorschläge. Nur spiegeln/fragen. User hat Limits oder "kein Content" gesetzt.',
      content_allowed: false,
    };
  }

  return { override: false, content_allowed: true };
};

// Quick mock for manual testing
export const __testPrompt = () => {
  const testContext: GuidePromptContext = {
    profile: { name: 'Max', primary_goal: 'Sabbatical 2027' },
    slots: {
      article: { available: 2, daily_limit: 3 },
      podcast: { available: 1, daily_limit: 2 },
      quote: { available: 4, daily_limit: 4 },
    },
    state: { no_content: false, tone: 'direkt' },
  };
  return buildFYFPrompt(
    testContext,
    'Zeig mir Content für heute',
    { codexText: '[principles]: Tool not Coach; Autonomie; Transparenz' }
  );
};

/**
 * Log a guide turn for analytics/future fine-tuning
 */
export const logGuideTurn = async (
  supabase: any,
  userId: string,
  sessionId: string,
  prompt: string,
  response: string,
  slotsPre: any,
  slotsPost: any
) => {
  await supabase.from('guide_logs').insert({
    user_id: userId,
    session_id: sessionId,
    prompt,
    response,
    slots_pre: slotsPre,
    slots_post: slotsPost,
    feedback_tags: []
  });
};
