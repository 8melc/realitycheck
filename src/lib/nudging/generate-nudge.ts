import OpenAI from 'openai';
import type { NudgeType, UserNudgeProfile, GuideTone } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const TONE_INSTRUCTIONS: Record<GuideTone, string> = {
  'Soft Touch': `
    Sei warm, ermutigend und unterstützend. 
    Verwende sanfte Sprache und gelegentlich ein Emoji (🌿, 💭, ✨).
    Stelle offene Fragen, die zur Selbstreflexion einladen.
    Beispiel: "Hey, merkst du was? 🌿 Vielleicht Zeit für einen Check-in?"
  `,
  'Straight': `
    Sei direkt, ehrlich und klar - aber NICHT verletzend.
    Keine Floskeln, keine Emojis. Geh direkt zum Punkt.
    Fordere den User auf, bewusst zu entscheiden.
    Beispiel: "42 von 60 Minuten verbraucht. Was ist dein Plan für den Rest?"
  `,
  'Hard Truth': `
    Sei ungefiltert und konfrontativ - aber NIE beleidigend.
    Fordere brutale Selbstehrlichkeit. Keine Ausflüchte.
    Stelle unbequeme Fragen, die wachrütteln.
    Beispiel: "Autopilot oder bewusste Entscheidung? Sei ehrlich zu dir."
  `
};

export async function generateNudge({
  nudgeType,
  userProfile,
}: {
  nudgeType: NudgeType;
  userProfile: UserNudgeProfile;
}): Promise<string> {
  const systemPrompt = buildSystemPrompt(nudgeType, userProfile);
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generiere jetzt die Nudge-Message.' }
      ],
      max_tokens: 150,
      temperature: 0.9, // Höher für Varianz
    });

    const message = response.choices[0].message.content?.trim();
    
    if (!message) {
      console.warn('[Nudge] Empty response from OpenAI, using fallback');
      return getFallbackMessage(nudgeType, userProfile);
    }

    // Validate length (max 180 chars)
    if (message.length > 180) {
      return message.substring(0, 177) + '...';
    }

    return message;
  } catch (error: any) {
    console.error('[Nudge] OpenAI error:', error);
    // Fallback to template-based message
    return getFallbackMessage(nudgeType, userProfile);
  }
}

function buildSystemPrompt(type: NudgeType, profile: UserNudgeProfile): string {
  const toneInstruction = TONE_INSTRUCTIONS[profile.guideTone] || TONE_INSTRUCTIONS['Straight'];
  
  const basePrompt = `Du bist der "Reality Check Guide" - ein AI-Coach für Bewusstmachung.

DEINE AUFGABE:
- Bringe den User dazu, BEWUSST zu entscheiden (nicht bevormunden!)
- Stelle Fragen, die zum Nachdenken anregen
- Zeige Autopilot-Verhalten auf, ohne zu urteilen

USER-KONTEXT:
- Name: ${profile.name || 'User'}
- Ziel: "${profile.goal || 'bewusster leben'}"
- Interessen: ${profile.interests.join(', ') || 'keine angegeben'}
- Guide-Ton: ${profile.guideTone}

TON-GUIDELINE:
${toneInstruction}

NUDGE-TYP: ${type}
${getTypeSpecificContext(type, profile)}

REGELN:
- Maximal 2 Sätze
- Maximal 180 Zeichen
- Sprich den User direkt an (du/dich)
- KEINE Befehle, nur Bewusstmachung
- Stelle mind. 1 Frage
- Beziehe das User-Ziel ein, wenn relevant`;

  return basePrompt;
}

function getTypeSpecificContext(type: NudgeType, profile: UserNudgeProfile): string {
  switch (type) {
    case 'session_limit':
      const remaining = profile.dailyLimit - profile.currentDuration;
      const percentage = Math.round((profile.currentDuration / profile.dailyLimit) * 100);
      return `
KONTEXT: Session-Zeit-Limit
- Bisherige Zeit heute: ${profile.currentDuration} Minuten
- Tageslimit: ${profile.dailyLimit} Minuten
- Verbleibend: ${remaining} Minuten
- Bereits ${percentage}% des Limits verbraucht

ZIEL DER MESSAGE:
Mach bewusst, dass viel Zeit vergangen ist. Frage, ob das absichtlich war.`;

    case 'goal_drift':
      return `
KONTEXT: Ziel-Drift
- User-Ziel: "${profile.goal}"
- Letzter Ziel-Bezug: vor ${profile.daysSinceLastGoalActivity} Tagen

ZIEL DER MESSAGE:
Erinnere sanft an das selbst gesetzte Ziel. Frage, was passiert ist.`;

    case 'daily_checkin':
      return `
KONTEXT: Täglicher Check-in
- User-Ziel: "${profile.goal}"

ZIEL DER MESSAGE:
Kurze Reflexion: Wie läuft der Tag im Bezug auf das Ziel?`;

    default:
      return '';
  }
}

function getFallbackMessage(type: NudgeType, profile: UserNudgeProfile): string {
  const remaining = profile.dailyLimit - profile.currentDuration;
  
  switch (type) {
    case 'session_limit':
      if (profile.guideTone === 'Soft Touch') {
        return `Hey ${profile.name || 'du'}, du bist schon ${profile.currentDuration} Min online. Vielleicht Zeit für eine Pause? 🌿`;
      } else if (profile.guideTone === 'Hard Truth') {
        return `Brutal ehrlich: Du hast nur noch ${remaining} Min. Autopilot oder bewusst?`;
      } else {
        return `Reality Check: ${profile.currentDuration} Min von ${profile.dailyLimit} Min verbraucht. Was ist dein Plan?`;
      }
    
    case 'goal_drift':
      if (profile.guideTone === 'Soft Touch') {
        return `Ich hab bemerkt, du warst eine Weile nicht bei deinem Ziel '${profile.goal}'. Alles okay?`;
      } else if (profile.guideTone === 'Hard Truth') {
        return `'${profile.goal}' - erinnerst du dich? ${profile.daysSinceLastGoalActivity} Tage her. War das ernst gemeint?`;
      } else {
        return `Du hast vor ${profile.daysSinceLastGoalActivity} Tagen gesagt: '${profile.goal}'. Was ist passiert?`;
      }
    
    case 'daily_checkin':
      if (profile.guideTone === 'Soft Touch') {
        return `Kurze Frage: Wie läuft dein Tag mit deinem Ziel '${profile.goal}'?`;
      } else if (profile.guideTone === 'Hard Truth') {
        return `Sei ehrlich: Hast du heute an '${profile.goal}' gedacht oder nur gescrollt?`;
      } else {
        return `Daily Check: Bist du heute näher an '${profile.goal}' gekommen?`;
      }
    
    default:
      return 'Reality Check: Was machst du gerade?';
  }
}

