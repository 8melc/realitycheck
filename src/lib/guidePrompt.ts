/**
 * Prompt utilities for the FYF Guide
 * - buildFYFPrompt: builds structured prompt layers (system/role/context/state/inventory/user)
 * - applySlotGuard: enforces slot and "no content" constraints before calling the LLM
 * - detectClusterFromIntent: maps user intents to content clusters
 */

type SlotInfo = {
  available?: number;
  daily_limit?: number | string;
};

/**
 * Cluster Mapping: User-Intents → Content-Cluster
 * Erkennt User-Intents in Messages und mappt sie zu passenden Clustern
 */
export const CLUSTER_MAP: Record<string, string> = {
  // Freedom & Places
  'digital nomad': 'freedom_places',
  'digitaler nomade': 'freedom_places',
  'job kündigen': 'freedom_places',
  'job kuendigen': 'freedom_places',
  'kündigen': 'freedom_places',
  'kuendigen': 'freedom_places',
  'remote work': 'freedom_places',
  'freiheit': 'freedom_places',
  'ort': 'freedom_places',
  'reisen': 'freedom_places',
  'nomad': 'freedom_places',
  
  // Time & Focus
  'routine': 'time_focus',
  'chaos': 'time_focus',
  'zeit': 'time_focus',
  'zeitmanagement': 'time_focus',
  'fokus': 'time_focus',
  'focus': 'time_focus',
  'endlichkeit': 'time_focus',
  'vergangenheit': 'time_focus',
  'zukunft': 'time_focus',
  
  // Money & Value
  'geld': 'money_value',
  'money': 'money_value',
  'finanzen': 'money_value',
  'wert': 'money_value',
  'value': 'money_value',
  'kosten': 'money_value',
  'sparen': 'money_value',
  
  // Meaning & Purpose
  'sinn': 'meaning',
  'meaning': 'meaning',
  'zweck': 'meaning',
  'purpose': 'meaning',
  'bedeutung': 'meaning',
  'ziel': 'meaning',
  'goal': 'meaning',
  
  // Growth
  'wachstum': 'growth',
  'growth': 'growth',
  'lernen': 'growth',
  'learn': 'growth',
  'entwicklung': 'growth',
  
  // Relationships
  'beziehungen': 'relationships',
  'relationships': 'relationships',
  'freunde': 'relationships',
  'familie': 'relationships',
  
  // Self Knowledge
  'selbsterkenntnis': 'self_knowledge',
  'self knowledge': 'self_knowledge',
  'ich': 'self_knowledge',
  'selbst': 'self_knowledge',
  
  // Culture & Voices
  'kultur': 'culture',
  'culture': 'culture',
  'stimmen': 'culture',
  'voices': 'culture',
};

/**
 * Erkennt User-Intent aus Message und gibt passenden Cluster zurück
 */
export const detectClusterFromIntent = (userMessage: string): string | null => {
  const messageLower = userMessage.toLowerCase();
  
  // Suche nach Keywords im Cluster-Map
  for (const [keyword, cluster] of Object.entries(CLUSTER_MAP)) {
    if (messageLower.includes(keyword)) {
      return cluster;
    }
  }
  
  return null; // Kein spezifischer Cluster erkannt
};

export type GuideRecommendation = {
  id: string;
  title: string;
  format: string;
  cluster?: string | null;
  read_time_minutes?: number | null;
  why?: string | null;
  url?: string | null;
  subtitle?: string | null;
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

  // Format INVENTORY mit Slots-Info
  const formatInventoryItem = (r: GuideRecommendation, index: number) => {
    // Bestimme Slot-Typ basierend auf Format
    let slotInfo = '';
    const formatLower = (r.format || '').toLowerCase();
    if (formatLower.includes('artikel') || formatLower.includes('article')) {
      slotInfo = `Slots: ${context.slots?.article?.available ?? 0}/${context.slots?.article?.daily_limit ?? '∞'}`;
    } else if (formatLower.includes('podcast')) {
      slotInfo = `Slots: ${context.slots?.podcast?.available ?? 0}/${context.slots?.podcast?.daily_limit ?? '∞'}`;
    } else if (formatLower.includes('zitat') || formatLower.includes('quote')) {
      slotInfo = `Slots: ${context.slots?.quote?.available ?? 0}/${context.slots?.quote?.daily_limit ?? '∞'}`;
    }
    
    return `"${r.title}" (${r.format}, ${r.read_time_minutes ?? '?'}min) [${r.cluster || '?'}]
Warum: ${r.why || '—'}
${slotInfo ? slotInfo + '\n' : ''}[ID:${r.id}]`;
  };

  sections.push(
    `INVENTORY (bereitgestellt):
${(context.recommendations || [])
  .map((r, i) => formatInventoryItem(r, i))
  .join('\n\n') || '- Keine passenden Items gefunden.'}`
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
