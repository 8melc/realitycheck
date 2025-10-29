/**
 * Reality Check Guide Responses - JSON Structure
 * 
 * Strukturierte Guide-Antworten für bessere Matching-Logik
 * und einfache Erweiterung durch das Team
 */

export interface GuideResponseData {
  id: string;
  prompt: string;
  keywords: string[];
  guide: string;
  why: string;
  followUp: string;
  recommendedTypes: string[];
  clusterId: string;
  priority: number; // 1-10, höher = wichtiger
}

export const GUIDE_RESPONSES_DATA: GuideResponseData[] = [
  {
    id: 'focus',
    prompt: 'wie bekomme ich mehr fokus',
    keywords: ['fokus', 'fokussieren', 'konzentration', 'konzentrieren', 'aufmerksamkeit'],
    guide: 'Weniger Tabs offen lassen – auch im Kopf. Kill jetzt 5 unnötige Tasks oder Apps.',
    why: 'Du bekommst diese Antwort, weil Fokus nicht von alleine kommt, sondern durch aktives Streichen.',
    followUp: 'Was ist dein größter Ablenkungsfaktor?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Fokus & Flow',
    priority: 9
  },
  {
    id: 'doomscrolling',
    prompt: 'wie stoppe ich mein doomscrolling',
    keywords: ['doomscrolling', 'scrollen', 'handy', 'smartphone', 'social media', 'instagram', 'tiktok'],
    guide: 'Leg das Handy für 30 Minuten in einen anderen Raum und schreib dir per Hand auf, was dir fehlt.',
    why: 'Weil du Muster nur durchbrechen kannst, wenn du die Routine hart abbrichst.',
    followUp: 'Was vermisst du wirklich, wenn du nicht scrollst?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Fokus & Flow',
    priority: 8
  },
  {
    id: 'klarheit',
    prompt: 'warum bin ich nie klar',
    keywords: ['klarheit', 'entscheidungen', 'unentschlossen', 'schwanken', 'zögern'],
    guide: 'Weil du Entscheidungen dodgst. Klär heute EIN Thema brutal fertig – kein Switchen.',
    why: 'Unser Hirn liebt Ausweichmanöver. Du lernst Klarheit nur im realen Cut.',
    followUp: 'Welche Entscheidung schiebst du seit Wochen vor dir her?',
    recommendedTypes: ['article', 'people'],
    clusterId: 'Fokus & Flow',
    priority: 8
  },
  {
    id: 'komfort',
    prompt: 'bin ich zu bequem',
    keywords: ['bequem', 'komfort', 'faul', 'träge', 'energie', 'motivation'],
    guide: 'Komfort frisst Energie. Tausche heute einen lauwarmen Slot gegen radikales „Nein".',
    why: 'Weil Aufschieben immer nach Belohnung schreit – sag heute absichtlich ab.',
    followUp: 'Was machst du aus Komfort, obwohl du weißt, dass es dich bremst?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Fokus & Flow',
    priority: 7
  },
  {
    id: 'prokrastination',
    prompt: 'warum prokrastiniere ich',
    keywords: ['prokrastination', 'aufschieben', 'verzögerung', 'morgen', 'später'],
    guide: 'Weil du zu höflich zu deinen eigenen Ausreden bist. Schreib dir heute alle Ausreden auf und streich sie durch.',
    why: 'So siehst du, wie viel du dir Tag für Tag vormachst.',
    followUp: 'Welche Ausrede benutzt du am häufigsten?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Fokus & Flow',
    priority: 9
  },
  {
    id: 'routinen',
    prompt: 'wie baue ich eine neue routine',
    keywords: ['routine', 'gewohnheit', 'habit', 'täglich', 'struktur', 'disziplin'],
    guide: 'Mach\'s klein und schmerzhaft: Starte mit 2 Min, dann steig erst auf. Alles andere ist Ego-Show.',
    why: 'Du hältst länger durch, wenn du dich nicht selbst überforderst.',
    followUp: 'Welche Routine willst du etablieren?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Fokus & Flow',
    priority: 7
  },
  {
    id: 'beziehungen-fokus',
    prompt: 'warum lenken mich andere ab',
    keywords: ['ablenkung', 'andere', 'menschen', 'grenzen', 'nein sagen', 'beziehungen'],
    guide: 'Weil du deine Grenzen nicht aussprichst. Sag heute EINEM Menschen radikal ehrlich ab.',
    why: 'Beziehungen machen wir klarer durch Reibung, nicht durch Anpassung.',
    followUp: 'Wer oder was lenkt dich am meisten ab?',
    recommendedTypes: ['article', 'people'],
    clusterId: 'Beziehungen',
    priority: 6
  },
  {
    id: 'deadlines',
    prompt: 'wie halte ich deadline ein',
    keywords: ['deadline', 'termin', 'frist', 'zeitdruck', 'stress', 'projekt'],
    guide: 'Teil sie in drei hässliche Mini-Steps und feiere nur, wenn ALLE nerven.',
    why: 'Deine Komfortzone trickst dich – kleine Stressoren killen den großen Stress.',
    followUp: 'Welche Deadline stresst dich gerade am meisten?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Zeit & Endlichkeit',
    priority: 8
  },
  {
    id: 'geld-zeit',
    prompt: 'warum habe ich kein zeitgefühl für geld',
    keywords: ['geld', 'zeit', 'wert', 'kosten', 'investition', 'sparen', 'ausgeben'],
    guide: 'Weil Geld und Zeit für dich Synonyme sind. Tracke heute beides in einer Liste.',
    why: 'Du wirst merken: Dein Wert entsteht erst beim Konfrontieren, nicht beim Schätzen.',
    followUp: 'Was kostet dich am meisten Zeit, ohne dass du es merkst?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Geld & Wert',
    priority: 6
  },
  {
    id: 'überforderung',
    prompt: 'warum fühle ich mich dauernd überfordert',
    keywords: ['überfordert', 'stress', 'zu viel', 'multitasking', 'chaos', 'burnout'],
    guide: 'Du sagst zu allem Ja, aber niemandem radikal Nein.',
    why: 'Wirkliche Freiheit heißt: Minimalismus bei Menschen UND Aufgaben.',
    followUp: 'Wozu sagst du Ja, obwohl du eigentlich Nein meinst?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Fokus & Flow',
    priority: 8
  },
  {
    id: 'status-unsicherheit',
    prompt: 'warum fühle ich mich oft lost',
    keywords: ['lost', 'unsicher', 'richtung', 'ziel', 'sinn', 'purpose', 'identität'],
    guide: 'Weil du extern validiert wirst. Schreib heute auf, wem du es beweisen willst – und streiche zwei Namen.',
    why: 'Nur so entsteht eigene Richtung.',
    followUp: 'Wem willst du eigentlich etwas beweisen?',
    recommendedTypes: ['article', 'people'],
    clusterId: 'Selbsterkenntnis',
    priority: 7
  },
  {
    id: 'grenzen',
    prompt: 'wie ziehe ich bessere grenzen',
    keywords: ['grenzen', 'nein', 'boundaries', 'limits', 'schutz', 'abgrenzung'],
    guide: 'Teste heute ein absichtliches „Nein", auch wenn\'s wehtut.',
    why: 'Grenzen musst du üben wie Muskeln, nicht einmal setzen.',
    followUp: 'Wo fällt es dir am schwersten, Nein zu sagen?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Beziehungen',
    priority: 7
  },
  {
    id: 'purpose-sinnkrise',
    prompt: 'wozu mache ich das alles',
    keywords: ['sinn', 'purpose', 'bedeutung', 'wozu', 'warum', 'motivation', 'ziel'],
    guide: 'Weil Sinn nicht geliefert wird. Geh raus, kill einen alten Glaubenssatz, bevor du GO machst.',
    why: 'Leere entsteht beim Nachlaufen, Fülle beim Konfrontieren.',
    followUp: 'Welcher alte Glaubenssatz hält dich fest?',
    recommendedTypes: ['article', 'people'],
    clusterId: 'Sinn & Bedeutung',
    priority: 8
  },
  {
    id: 'energie',
    prompt: 'wieso bin ich abends platt',
    keywords: ['energie', 'müde', 'erschöpft', 'kraftlos', 'antriebslos', 'ermüdet'],
    guide: 'Weil du zu oft „durchziehst". Baue jetzt 10 Minuten Nichts-Tun ein.',
    why: 'Pausen machen mehr Output als Dauervollgas – das ist kein Softtalk.',
    followUp: 'Wann gönnst du dir bewusst eine Pause?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Fokus & Flow',
    priority: 6
  },
  {
    id: 'kreativität',
    prompt: 'wie kriege ich mehr ideen',
    keywords: ['ideen', 'kreativität', 'inspiration', 'einfall', 'brainstorm', 'innovation'],
    guide: 'Stell dein Ego leiser. Mach was Dummes, was nicht postenbar ist.',
    why: 'Kreativität braucht Fehlerraum, keine Zieloptimierung.',
    followUp: 'Was würdest du machen, wenn niemand es sehen könnte?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Wachstum',
    priority: 6
  },
  {
    id: 'default',
    prompt: 'keine passende antwort gefunden',
    keywords: ['default', 'fallback', 'unbekannt'],
    guide: 'Du stellst die richtige Frage, aber ich brauche mehr Kontext. Beschreib dein Problem in einem Satz.',
    why: 'Manchmal sind die besten Antworten die, die wir gemeinsam finden.',
    followUp: 'Was beschäftigt dich gerade am meisten?',
    recommendedTypes: ['article', 'podcast'],
    clusterId: 'Fokus & Flow',
    priority: 1
  }
];

/**
 * Matching-Logik für Guide-Responses
 */
export function findBestGuideResponse(prompt: string): GuideResponseData {
  const normalizedPrompt = normalizeText(prompt);
  const promptWords = normalizedPrompt.split(' ').filter(word => word.length > 2);
  
  let bestMatch: GuideResponseData | null = null;
  let bestScore = 0;
  
  for (const response of GUIDE_RESPONSES_DATA) {
    let score = 0;
    
    // Exact prompt match (höchste Priorität)
    if (normalizeText(response.prompt) === normalizedPrompt) {
      score = 1000;
    }
    
    // Keyword matches
    for (const keyword of response.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      
      // Exact keyword match
      if (normalizedPrompt.includes(normalizedKeyword)) {
        score += 100;
      }
      
      // Partial keyword match
      if (promptWords.some(word => word.includes(normalizedKeyword) || normalizedKeyword.includes(word))) {
        score += 50;
      }
    }
    
    // Priority bonus
    score += response.priority * 2;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = response;
    }
  }
  
  // Return best match or default
  return bestMatch || GUIDE_RESPONSES_DATA.find(r => r.id === 'default')!;
}

/**
 * Text normalization für besseres Matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}
