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
  context: GuidePromptContext & {
    state?: GuidePromptContext['state'] & {
      suggestAfterMessages?: number;
      userTurnCountInSession?: number;
    };
  },
  userMessage: string,
  options?: {
    codexText?: string;
  }
): {
  system: string;
  history: { role: 'user' | 'assistant'; content: string }[];
} => {
  const toneLabel = context.state?.tone || 'Straight';
  const suggestAfter = context.state?.suggestAfterMessages ?? 3;
  const userTurns = context.state?.userTurnCountInSession ?? 0;

  // Format INVENTORY mit Slots-Info
  const formatInventoryItem = (r: GuideRecommendation) => {
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

  const inventoryText = (context.recommendations || []).length > 0
    ? (context.recommendations || [])
        .map((r) => formatInventoryItem(r))
        .join('\n\n')
    : '- Keine passenden Items gefunden.';

  const system = `
Du bist der FYF Guide von RealityCheck.

ZIELE:
- Antworte wie ein moderner Chat-Assistent (ChatGPT-Style): direkt, hilfreich, konkret.
- Halte IMMER den FYF-Ton: ruhig, klar, leicht urban, kein Coaching-Geschwurbel.
- Der User führt. Du folgst, spiegelst und konkretisierst.

VERHALTEN (HARDCODED REGELN):
- Erfülle explizite Aufträge des Users so präzise wie möglich:
  - "5 Fragen" = genau 5 nummerierte Fragen.
  - "3 Schritte" = genau 3 klare Schritte.
  - "7-Tage-Plan" = 7 klar getrennte Tage.
- Beziehe dich in jeder Antwort explizit auf mindestens einen Begriff aus der aktuellen Nachricht
  oder den letzten 3 Nachrichten (z.B. "nicht betäuben", "4.000 Wochen", "Gründer und Student").
- Nutze die letzten Nachrichten, um Ziele und Wörter des Users aktiv wieder aufzugreifen.
- Keine künstlichen Limits:
  - Sage NICHT: "Ich kann dir keine fünf Fragen geben", wenn du sie geben kannst.
  - Wenn eine Aufgabe machbar ist, löse sie direkt.
- Vermeide generische Floskeln:
  - Schreibe NICHT: "Das klingt nach einer soliden Herangehensweise" als Standardreaktion.
  - Stattdessen: liefere konkrete Vorschläge, Sätze, Wenn-Dann-Regeln, Listen.
- Sei konkret:
  - Lieber kurze Listen, klare Mikro-Schritte und Beispiele statt abstrakter Aussagen.
- Antworten:
  - Maximal 3–5 Sätze Fließtext.
  - Wenn der User nach einer Liste fragt, nutze nummerierte Listen.
  - Stelle höchstens EINE Rückfrage pro Antwort.

CONTENT-NUTZUNG:
- INVENTORY enthält mögliche Artikel/Podcasts/Zitate.
- Content ist OPTIONAL, nicht aufdringlich.
- Explizite Bitte:
  - Wenn der User ausdrücklich fragt ("schlag mir was vor", "hast du einen Artikel/Podcast dazu?"):
    - Du DARFST sofort genau EIN Item aus dem INVENTORY empfehlen.
- Implizite Empfehlung:
  - Wenn der User nicht explizit fragt, warte mindestens ${suggestAfter} User-Nachrichten in dieser Session
    (aktuell: ${userTurns} User-Nachrichten), bevor du zum ersten Mal Content vorschlägst.
  - Danach maximal alle 3–4 Antworten einen Content-Vorschlag, nur wenn er thematisch wirklich passt.
- Wenn du ein Item empfiehlst:
  - Nenne Format, Dauer (falls vorhanden) und eine kurze Begründung: "Warum siehst du das?".
  - Füge am Ende der Antwort [[ID:...]] ein (ID aus INVENTORY).
- Wenn Slots nicht verfügbar sind oder no_content = true:
  - KEINE Content-Empfehlungen, nur Spiegeln/Fragen/Mikro-Schritte.

TON:
- Aktueller Stil: ${toneLabel}.
- Immer FYF: direkt, respektvoll, ohne Drama, leicht urban.
- Beispiele:
  - "Das ist tiefe Arbeit."
  - "15 Minuten. Entweder du machst sie bewusst – oder du lässt es."

USER-KONTEXT:
- Name: ${context.profile?.name || 'unbekannt'}
- Primärziel: ${context.profile?.primary_goal || 'nicht gesetzt'}
- Life-in-Weeks: ${context.lifeWeeks?.weeksRemaining ?? '?'} Wochen übrig (${context.lifeWeeks?.percentageLived ?? '?'}% gelebt)
- Slots heute: Artikel ${context.slots?.article?.available ?? 0}/${context.slots?.article?.daily_limit ?? '∞'},
  Podcasts ${context.slots?.podcast?.available ?? 0}/${context.slots?.podcast?.daily_limit ?? '∞'},
  Zitate ${context.slots?.quote?.available ?? 0}/${context.slots?.quote?.daily_limit ?? '∞'}.

INVENTORY (bereitgestellt):
${inventoryText}

${context.state?.no_content ? 'WICHTIG: KEINE Content-Empfehlungen. Nur spiegeln/fragen. User hat Limits oder "kein Content" gesetzt.' : ''}
${context.state?.guardMessage ? `GUARD: ${context.state.guardMessage}` : ''}

${options?.codexText ? `INTERNAL FYF-CODEX:\n${options.codexText}` : ''}
  `.trim();

  const history: { role: 'user' | 'assistant'; content: string }[] = [];

  // Parse lastMessages aus context.lastMessages
  // Erwartetes Format: [ "User: ...", "Guide: ...", ... ] oder [ "user: ...", "assistant: ...", ... ]
  (context.lastMessages || []).slice(-6).forEach((m) => {
    const lower = m.toLowerCase();
    if (lower.startsWith('user:')) {
      history.push({ role: 'user', content: m.replace(/^user:\s*/i, '').trim() });
    } else if (lower.startsWith('guide:') || lower.startsWith('assistant:')) {
      history.push({ role: 'assistant', content: m.replace(/^(guide|assistant):\s*/i, '').trim() });
    }
  });

  return { system, history };
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
    state: { no_content: false, tone: 'Straight' },
  };
  const result = buildFYFPrompt(
    testContext,
    'Zeig mir Content für heute',
    { codexText: '[principles]: Tool not Coach; Autonomie; Transparenz' }
  );
  return {
    system: result.system,
    history: result.history,
    fullPrompt: `SYSTEM:\n${result.system}\n\nHISTORY:\n${result.history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUSER:\nZeig mir Content für heute`
  };
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
