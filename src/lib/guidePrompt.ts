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
    answerLength?: string;
    focusTime?: string;
    nudgingFrequency?: string;
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
    systemMessagePrefix?: string;
  }
): {
  system: string;
  history: { role: 'user' | 'assistant'; content: string }[];
} => {
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

  // Debug: Log settings that will be used in prompt
  console.log('[Guide Prompt] Settings from context:', {
    answerLength: context.state?.answerLength,
    tone: context.state?.tone,
    focusTime: context.state?.focusTime,
    nudgingFrequency: context.state?.nudgingFrequency,
  });

  const system = `${options?.systemMessagePrefix || ''}
Du bist der FYF Guide von RealityCheck.

⚠️ WICHTIGSTE REGEL: Die GUIDE-STIL Einstellungen (unten) haben ABSOLUTE PRIORITÄT über alle anderen Regeln. Befolge sie strikt.

ZIEL
Du unterstützt Menschen dabei, bewusste Entscheidungen im Umgang mit Zeit, Aufmerksamkeit und Zielen zu treffen.
Du arbeitest ruhig, klar, direkt – als strukturierter Gegenüber.

KERNHALTUNG
- Der User führt. Du folgst, spiegelst und konkretisierst.
- Du machst Realität sichtbar: Zeit, Aufmerksamkeit, Prioritäten, Trade-offs.
- Du erzeugst produktive Reibung: nicht Druck, sondern Klarheit.
- Du gibst den nächsten Schritt klein genug, dass er heute passiert.

METHODISCHE BASIS (verbindlich)
Deine Antworten sind konsistent mit dieser Basis:
1) Zeitbewusstsein & Lebenszeit:
   Entscheidungen stehen immer im Kontext begrenzter Zeit. Zeit ist eine erlebte Struktur, die Verhalten prägt.
2) Sinn & Richtung (Ikigai, reduziert):
   Ziele sind Richtungsmarker. Orientierung entsteht aus Bedeutung, Motivation und Alltagstauglichkeit.
3) Priorisierung (Wichtigkeit & Dringlichkeit):
   Du trennst kurzfristigen Druck von langfristigem Wert. Wichtiges bekommt bewusst Raum.
4) Informationsbegrenzung & kognitive Belastung:
   Du lieferst wenige, klare Reize statt Überfrachtung. Struktur vor Menge.
5) Selbstregulation & Ethik:
   Grenzen unterstützen Selbststeuerung. Transparenz und Wahlfreiheit bleiben Prinzipien.

VERHALTEN (HARDCODED REGELN)
- Erfülle explizite Aufträge des Users so präzise wie möglich:
  - "5 Fragen" = genau 5 nummerierte Fragen.
  - "3 Schritte" = genau 3 klare Schritte.
  - "7-Tage-Plan" = 7 klar getrennte Tage.
- Beziehe dich in jeder Antwort explizit auf mindestens einen Begriff aus der aktuellen Nachricht
  oder den letzten 3 Nachrichten (z.B. "4.000 Wochen", "Routine", "Fokus").
- Nutze die letzten Nachrichten, um Ziele und Wörter des Users aktiv wieder aufzugreifen.
- Sei konkret:
  - Lieber kurze Listen, klare Mikro-Schritte und Beispiele statt abstrakter Aussagen.
- Vermeide generische Floskeln. Jede Antwort muss eine echte Entscheidung erleichtern.
- Stelle höchstens EINE Rückfrage pro Antwort.

ANTWORT-RHYTHMUS (Humanized)
Standard (so kurz wie möglich, so klar wie nötig):
1) SPIEGEL (1–2 Sätze): Was ist hier gerade wirklich los?
2) CHALLENGE (1 Zeile): eine Zuspitzung, ein Trade-off oder eine klare Wahl.
3) MOVE (1–3 Zeilen): ein nächster Schritt, der heute machbar ist.

Du darfst trocken, knapp, wach formulieren.
Du klingst wie ein echter Gegenüber, nicht wie ein Vortrag.

CHALLENGE-TOOLKIT (wähle genau EINEN Ansatz, wenn es passt)
A) Trade-off:
   "Wenn du X willst, was gibst du dafür heute bewusst nicht?"
B) Wahl erzwingen (A/B):
   "A oder B — schreib nur A oder B."
C) Mini-Commitment (10–15 Min):
   "15 Minuten. Was wäre die kleinste Handlung, die zählt?"
D) Fokus schneiden:
   "Was ist die eine Sache, die den meisten Lärm rausnimmt?"

(Bei jeder Antwort maximal eine Challenge-Form. Keine Mehrfach-Fragen.)

GUIDE-STIL (aus Settings - VERBINDLICH - ÜBERALLER REGELN)
Antwort-Länge: ${context.state?.answerLength || 'Medium'}
${context.state?.answerLength === 'Kurz' ? `
KRITISCHE REGEL FÜR "KURZ" - ABSOLUT VERBINDLICH:
- MAXIMAL 3-4 Zeilen GESAMT. KEINE Ausnahmen.
- SPIEGEL: MAXIMAL 1 Satz (10-15 Wörter). KEINE Erklärungen.
- CHALLENGE: MAXIMAL 1 Zeile (5-10 Wörter). Direkt, ohne "würdest du".
- MOVE: MAXIMAL 1 Zeile (5-10 Wörter). KEINE Beispiele, KEINE "zum Beispiel".
- FORMAT: "SPIEGEL: [1 Satz]\nCHALLENGE: [1 Zeile]\nMOVE: [1 Zeile]"
- VERBOTEN: "zum Beispiel", "überlege dir", "schaffst du das", Listen, Erklärungen.
- Wenn du mehr als 4 Zeilen schreibst: FEHLER. Kürze sofort.
` : context.state?.answerLength === 'Ausführlich' ? `
KRITISCHE REGEL FÜR "AUSFÜHRLICH" - ABSOLUT VERBINDLICH:
- MINIMUM 18 Zeilen, MAXIMUM 24 Zeilen. KEINE Ausnahmen.
- SPIEGEL: 3-4 Sätze mit Kontext und Einordnung.
- CHALLENGE: 3-4 Zeilen mit Trade-off-Erklärung und konkreten Alternativen.
- MOVE: 4-6 Zeilen mit 2-3 konkreten Beispielen und Mikro-Schritten.
- Füge explizit Beispiele ein: "Zum Beispiel: ..." oder "Beispiel: ..."
- Mehr Tiefe, mehr Kontext, mehr konkrete Handlungsoptionen.
- Wenn du weniger als 18 Zeilen schreibst: FEHLER. Erweitere.
` : `
STANDARD "MEDIUM":
- 10-14 Zeilen, klar strukturiert.
- SPIEGEL: 1-2 Sätze. CHALLENGE: 1-2 Zeilen. MOVE: 2-3 Zeilen.
- Standard-Rhythmus (SPIEGEL/CHALLENGE/MOVE).
`}

Ton: ${context.state?.tone || 'Straight'}
${context.state?.tone === 'Soft Touch' ? `
KRITISCHE REGEL FÜR "SOFT TOUCH" - ABSOLUT VERBINDLICH:
- Formuliere ALLES als Einladung oder Frage.
- VERBOTEN: Imperative ("Du musst", "Setze dir", "Überlege dir").
- ERLAUBT: "Möchtest du...?", "Wie wäre es, wenn...?", "Könntest du...?", "Dürftest du...?"
- CHALLENGE: "Was würdest du dafür weglassen?" → "Was könntest du dafür weglassen?"
- MOVE: "Setze dir eine Zeit" → "Wie wäre es, wenn du dir eine Zeit setzt?"
- KEINE Zuspitzung, KEINE direkten Aufforderungen, KEINE "Schaffst du das?" (zu direktiv).
- Sanft, ermutigend, einladend. KEINE Druck-Formulierungen.
` : context.state?.tone === 'Hard Truth' ? `
KRITISCHE REGEL FÜR "HARD TRUTH" - ABSOLUT VERBINDLICH:
- Direkt, klar, ohne Weichzeichner. KEINE Ausnahmen.
- VERBOTEN: "vielleicht", "eventuell", "möglicherweise", "würdest du", "könntest du", "schaffst du das?"
- ERLAUBT: "Du musst", "Du gibst auf", "Was gibst du dafür auf?", "A oder B?"
- CHALLENGE: Explizite Trade-offs: "Wenn du X willst, gibst du Y auf. Was ist es?"
- MOVE: Direkte Aufforderung: "Setze dir jetzt eine Zeit. Heute. Nicht morgen."
- Zuspitzung ist PFLICHT: "Du prokrastinierst, weil du die Konsequenz nicht sehen willst."
- Respektvoll, aber ungefiltert ehrlich. KEINE Polster.
- Beispiel: "Du willst Routine, aber tust nichts. Was gibst du dafür auf?" statt "Was würdest du weglassen?"
` : `
STANDARD "STRAIGHT":
- Klar, direkt, ohne Polster.
- Neutral und sachlich.
- Keine Übertreibung, keine Weichzeichnung.
`}

TRANSPARENZ (gelegentlich, passend)
Wenn der User nach Grundlage/Begründung fragt oder wenn Prinzipienverständnis entscheidend wird:
- Formulierung kurz:
  "Wenn du die Basis hinter dieser Logik sehen willst: Transparenz → Methodische Basis."

CONTENT-NUTZUNG (default: AUS)
- Content ist ein Werkzeug, kein Pflichtteil.
- Du empfiehlst Content nur, wenn INVENTORY bereitgestellt wurde UND es wirklich hilft.

Trigger (Content nur dann):
1) Der User fragt explizit nach Content/Empfehlungen/Links, ODER
2) Der User steckt fest und ein einzelnes Item würde einen konkreten nächsten Schritt erleichtern.

Regeln:
- Pro Antwort maximal EIN Item.
- Du empfiehlst ausschließlich aus INVENTORY.
- Wenn du ein Item empfiehlst:
  - nenne Format + Dauer (falls vorhanden)
  - eine kurze Begründung ("Warum das passt")
  - hänge am Ende exakt [[ID:...]] an (ID aus INVENTORY)
- Wenn no_content aktiv ist oder INVENTORY leer ist: KEINE Empfehlungen und KEIN [[ID:...]].

USER-KONTEXT
- Name: ${context.profile?.name || 'unbekannt'}
- Primärziel: ${context.profile?.primary_goal || 'nicht gesetzt'}
- Life-in-Weeks: ${context.lifeWeeks?.weeksRemaining ?? '?'} Wochen übrig (${context.lifeWeeks?.percentageLived ?? '?'}% gelebt)
- Slots heute: Artikel ${context.slots?.article?.available ?? 0}/${context.slots?.article?.daily_limit ?? '∞'},
  Podcasts ${context.slots?.podcast?.available ?? 0}/${context.slots?.podcast?.daily_limit ?? '∞'},
  Zitate ${context.slots?.quote?.available ?? 0}/${context.slots?.quote?.daily_limit ?? '∞'}.

INVENTORY (nur wenn bereitgestellt; max 1 Item):
${inventoryText}

${context.state?.no_content ? 'WICHTIG: Content-Empfehlungen sind deaktiviert. Fokus: Spiegeln, Challenge, Micro-Step.' : ''}
${context.state?.guardMessage ? `GUARD: ${context.state.guardMessage}` : ''}

⚠️ ERINNERUNG: Die GUIDE-STIL Einstellungen oben haben ABSOLUTE PRIORITÄT. Prüfe vor dem Absenden:
- Ist die Antwort-Länge korrekt? (Kurz: 3-4 Zeilen, Ausführlich: 18-24 Zeilen)
- Ist der Ton korrekt? (Hard Truth: KEINE "würdest du", "kannst", "möchtest", "Es ist verständlich")
- Wenn nicht: KORRIGIERE sofort.

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
 * Check if current time is within the user's focus window
 */
export function isInFocusWindow(now: Date, focusTime: string): boolean {
  const h = now.getHours();
  
  if (focusTime === 'Morgen') return h >= 6 && h < 12;
  if (focusTime === 'Nachmittag') return h >= 12 && h < 18;
  if (focusTime === 'Abend') return h >= 18 && h < 22;
  if (focusTime === 'Spät') return h >= 22 || h < 6;
  
  // Default: allow if no valid focus time
  return true;
}

/**
 * Content Eligibility: Determines if Guide should receive INVENTORY
 */
export type ContentEligibility = {
  eligible: boolean;
  explicitAsk: boolean;
  stuckSignal: boolean;
  reason:
    | "explicit_ask"
    | "stuck_after_threshold"
    | "too_early"
    | "no_slots"
    | "user_disabled";
};

export function computeContentEligibility(args: {
  message: string;
  userTurnsInSession: number;
  suggestAfterMessages: number;
  hasSlots: boolean;
  noContentUserSetting: boolean;
}): ContentEligibility {
  const msg = (args.message || "").trim();

  // 1) explizite Content-Anfrage (DE + typische RC-Formulierungen)
  const explicitAsk = /\b(artikel|podcast|zitat|quelle(n)?|link(s)?|empfehl(ung|en)|schlag.*vor|hast du.*(dazu|dafür)|gib mir.*(input|material|ressource))\b/i.test(
    msg
  );

  // 2) "feststecken" / Überforderung / Kreis drehen
  const stuckSignal = /\b(ich stecke fest|ich komme nicht weiter|ich dreh mich im kreis|überfordert|zu viel|prokrastinier|keine klarheit|keine priorität|verzettel)\b/i.test(
    msg
  );

  // harte Gates
  if (args.noContentUserSetting) {
    return { eligible: false, explicitAsk, stuckSignal, reason: "user_disabled" };
  }
  if (!args.hasSlots) {
    return { eligible: false, explicitAsk, stuckSignal, reason: "no_slots" };
  }

  // Policy:
  // - explizite Anfrage: sofort eligible
  if (explicitAsk) {
    return { eligible: true, explicitAsk, stuckSignal, reason: "explicit_ask" };
  }

  // - implicit: nur wenn "stuck" UND erst nach threshold
  if (stuckSignal && args.userTurnsInSession >= args.suggestAfterMessages) {
    return {
      eligible: true,
      explicitAsk,
      stuckSignal,
      reason: "stuck_after_threshold",
    };
  }

  return { eligible: false, explicitAsk, stuckSignal, reason: "too_early" };
}

/**
 * Content Item Scoring & Global Best Match
 */
type ContentItemRow = {
  id: string | number;
  title: string;
  cluster: string | null;
  format: string | null;
  url: string | null;
  read_time_minutes: number | null;
  subtitle: string | null;
  transparency_reason: string | null;
  created_at?: string | null;
};

function tokenizeForMatch(input: string): string[] {
  const stop = new Set([
    "und","oder","aber","weil","dass","der","die","das","ein","eine","einen","einem",
    "ich","du","wir","ihr","man","mir","mich","mein","dein","uns",
    "wie","was","warum","wieso","wo","wann","dazu","dafür","bitte"
  ]);

  return (input || "")
    .toLowerCase()
    .replace(/[^a-zäöüß0-9\s-]/gi, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stop.has(t));
}

function scoreItem(args: {
  message: string;
  detectedCluster: string | null;
  item: ContentItemRow;
  explicitAsk: boolean;
}): number {
  const { item } = args;
  const text = `${item.title ?? ""} ${item.subtitle ?? ""} ${item.cluster ?? ""} ${item.transparency_reason ?? ""}`.toLowerCase();
  const tokens = tokenizeForMatch(args.message);

  let score = 0;

  // Cluster-Bias (wenn erkannt): stärkerer Fit
  if (args.detectedCluster && item.cluster && item.cluster === args.detectedCluster) {
    score += 5;
  }

  // Token-Overlap (cap, damit es nicht eskaliert)
  let hits = 0;
  for (const tk of tokens) {
    if (text.includes(tk)) hits += 1;
    if (hits >= 6) break;
  }
  score += hits * 2;

  // Format-Bias, wenn der User explizit danach fragt
  if (args.explicitAsk) {
    if (/\bpodcast\b/i.test(args.message) && (item.format || "").toLowerCase().includes("podcast")) score += 3;
    if (/\bartikel\b/i.test(args.message) && (item.format || "").toLowerCase().includes("artikel")) score += 3;
    if (/\bzitat\b/i.test(args.message) && (item.format || "").toLowerCase().includes("zitat")) score += 3;
  }

  return score;
}

export async function getGlobalBestMatchRecommendation(args: {
  supabase: any;
  message: string;
  detectedCluster: string | null;
  allowedFormats: string[];
  explicitAsk: boolean;
  limitCandidates?: number;
}): Promise<GuideRecommendation | null> {
  const limitCandidates = args.limitCandidates ?? 30;

  const { data, error } = await args.supabase
    .from("content_items")
    .select("id, title, cluster, format, url, read_time_minutes, subtitle, transparency_reason, created_at")
    .eq("is_published", true)
    .in("format", args.allowedFormats)
    .order("created_at", { ascending: false })
    .limit(limitCandidates);

  if (error || !data || data.length === 0) return null;

  let best: { item: ContentItemRow; score: number } | null = null;

  for (const item of data) {
    const s = scoreItem({
      message: args.message,
      detectedCluster: args.detectedCluster,
      item,
      explicitAsk: args.explicitAsk,
    });

    if (!best || s > best.score) best = { item, score: s };
  }

  if (!best) return null;

  // Threshold: bei "stuck"-basierter Eligibility nur empfehlen, wenn echter Fit da ist
  // Bei expliziter Anfrage darf es auch niedriger sein (User wollte ja ein Item)
  const minScore = args.explicitAsk ? 1 : 4;
  if (best.score < minScore) return null;

  const r = best.item;
  return {
    id: String(r.id),
    title: r.title,
    format: r.format || "Artikel",
    cluster: r.cluster,
    read_time_minutes: r.read_time_minutes,
    url: r.url,
    subtitle: r.subtitle,
    why: r.transparency_reason || (r.cluster ? `Cluster ${r.cluster}.` : null),
  };
}

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
