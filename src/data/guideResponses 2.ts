/**
 * Reality Check Guide Responses Data
 * 
 * Keyword-to-comment mappings for the GuideChatModal
 * Each response maps keywords to a brutally honest guide comment
 */

import { GuideResponse } from '@/types/feedboard';

export const GUIDE_RESPONSES: GuideResponse[] = [
  {
    id: 'focus-procrastination',
    keywords: ['fokus', 'fokussieren', 'konzentration', 'prokrastination', 'aufschub', 'ablenkung'],
    comment: 'Komfort frisst deine Wochen. Wähl Reibung.',
    clusterId: 'Fokus & Flow',
    promptHook: 'Du willst Fokus, aber bleibst weich.',
    followUpQuestion: 'Was ist dein größter Ablenkungsfaktor?',
    recommendedTypes: ['article', 'podcast']
  },
  {
    id: 'focus-late-energy',
    keywords: ['müde', 'erschöpft', 'energie', 'abends', 'spät', 'kraftlos'],
    comment: 'Du bist nicht müde. Du bist unterstimuliert.',
    clusterId: 'Fokus & Flow',
    promptHook: 'Späte Energie-Löcher sind Komfort-Zeichen.',
    followUpQuestion: 'Was machst du, wenn du müde bist?',
    recommendedTypes: ['article', 'event']
  },
  {
    id: 'time-management',
    keywords: ['zeit', 'zeitmanagement', 'produktivität', 'effizienz', 'planung', 'termine'],
    comment: 'Zeit gehört dir nie. Deine Aufmerksamkeit schon.',
    clusterId: 'Zeit & Endlichkeit',
    promptHook: 'Zeitmanagement ist eine Illusion.',
    followUpQuestion: 'Wofür vergeudest du deine Aufmerksamkeit?',
    recommendedTypes: ['article', 'podcast']
  },
  {
    id: 'evening-pause',
    keywords: ['pause', 'abend', 'entspannung', 'ruhe', 'feierabend', 'chillen'],
    comment: 'Pause ist kein Luxus. Sie ist Widerstand.',
    clusterId: 'Zeit & Endlichkeit',
    promptHook: 'Du brauchst keine Pause. Du brauchst Klarheit.',
    followUpQuestion: 'Was passiert in deiner Pause wirklich?',
    recommendedTypes: ['article', 'people']
  },
  {
    id: 'routine-breaker',
    keywords: ['routine', 'gewohnheit', 'langweilig', 'monoton', 'alltag', 'stumpf'],
    comment: 'Routine tötet nicht. Langeweile schon.',
    clusterId: 'Wachstum',
    promptHook: 'Du willst Routine brechen, aber bleibst bequem.',
    followUpQuestion: 'Welche Routine kostet dich am meisten?',
    recommendedTypes: ['article', 'event']
  },
  {
    id: 'scroll-relapse',
    keywords: ['scrollen', 'social media', 'handy', 'instagram', 'tiktok', 'süchtig'],
    comment: 'Du scrollst nicht. Du betäubst dich.',
    clusterId: 'Fokus & Flow',
    promptHook: 'Social Media ist kein Problem. Deine Unfähigkeit zu warten schon.',
    followUpQuestion: 'Was passiert, wenn du nicht scrollst?',
    recommendedTypes: ['article', 'podcast']
  },
  {
    id: 'purpose-meaning',
    keywords: ['sinn', 'bedeutung', 'purpose', 'ziel', 'richtung', 'lebenssinn'],
    comment: 'Sinn ist kein Retreat. Er ist Arbeit im Alltag.',
    clusterId: 'Sinn & Bedeutung',
    promptHook: 'Du suchst Sinn, aber vermeidest die Arbeit.',
    followUpQuestion: 'Was würdest du tun, wenn niemand zuschaut?',
    recommendedTypes: ['article', 'people']
  },
  {
    id: 'money-value',
    keywords: ['geld', 'finanzen', 'wert', 'reichtum', 'armut', 'investition'],
    comment: 'Geld ist Zeit in Ketten. Du entscheidest, wohin sie ziehen.',
    clusterId: 'Geld & Wert',
    promptHook: 'Geld ist nicht das Problem. Deine Beziehung dazu schon.',
    followUpQuestion: 'Wofür gibst du deine Zeit aus?',
    recommendedTypes: ['article', 'podcast']
  },
  {
    id: 'relationships',
    keywords: ['beziehungen', 'freunde', 'familie', 'kontakte', 'netzwerk', 'sozial'],
    comment: 'Nur 20% deiner Kontakte tragen dich. Der Rest hält dich fest.',
    clusterId: 'Beziehungen',
    promptHook: 'Du willst Beziehungen, aber bleibst oberflächlich.',
    followUpQuestion: 'Welche Beziehung kostet dich am meisten Energie?',
    recommendedTypes: ['article', 'people']
  },
  {
    id: 'self-awareness',
    keywords: ['selbsterkenntnis', 'bewusstsein', 'identität', 'wer bin ich', 'persönlichkeit'],
    comment: 'Masken fallen nicht von selbst. Reiß sie runter.',
    clusterId: 'Selbsterkenntnis',
    promptHook: 'Du willst dich kennen, aber bleibst bei der Oberfläche.',
    followUpQuestion: 'Wer bist du, wenn niemand zuschaut?',
    recommendedTypes: ['article', 'event']
  },
  {
    id: 'growth-learning',
    keywords: ['wachstum', 'lernen', 'entwicklung', 'verbesserung', 'skills', 'meisterschaft'],
    comment: 'Wachstum ist kein Feed. Es ist das, was weh tut.',
    clusterId: 'Wachstum',
    promptHook: 'Du willst wachsen, aber bleibst im Komfort.',
    followUpQuestion: 'Was lernst du gerade, das weh tut?',
    recommendedTypes: ['article', 'event']
  },
  {
    id: 'freedom-location',
    keywords: ['freiheit', 'orte', 'reisen', 'nomad', 'standort', 'mobilität'],
    comment: 'Freiheit ist kein Strand. Sie ist ein Kalender.',
    clusterId: 'Freiheit & Orte',
    promptHook: 'Du willst Freiheit, aber bleibst gefesselt.',
    followUpQuestion: 'Wo fühlst du dich am meisten gefangen?',
    recommendedTypes: ['article', 'people']
  },
  {
    id: 'culture-voices',
    keywords: ['kultur', 'stimmen', 'kunst', 'kreativität', 'ausdruck', 'widerstand'],
    comment: 'Mach Kunst, die beißt. Sonst ist sie Werbung.',
    clusterId: 'Kultur & Stimmen',
    promptHook: 'Du willst Kultur, aber konsumierst nur.',
    followUpQuestion: 'Was erschaffst du, das beißt?',
    recommendedTypes: ['article', 'people']
  },
  {
    id: 'general-struggle',
    keywords: ['probleme', 'schwierigkeiten', 'stress', 'überforderung', 'chaos', 'hilfe'],
    comment: 'Du bist 16 Slots zu weich. Drei killst du heute.',
    clusterId: 'Fokus & Flow',
    promptHook: 'Du willst Hilfe, aber bleibst passiv.',
    followUpQuestion: 'Was ist dein größter Slot-Killer?',
    recommendedTypes: ['article', 'podcast']
  },
  {
    id: 'motivation-energy',
    keywords: ['motivation', 'energie', 'antrieb', 'lustlos', 'müde', 'erschöpft'],
    comment: 'Energie ist keine Ressource. Sie ist eine Entscheidung.',
    clusterId: 'Wachstum',
    promptHook: 'Du willst Energie, aber bleibst passiv.',
    followUpQuestion: 'Was gibt dir echte Energie?',
    recommendedTypes: ['article', 'event']
  },
  {
    id: 'digital-distraction',
    keywords: ['handy', 'social media', 'digital', 'screen', 'online', 'internet'],
    comment: '30 Tage ohne Betäubung. Wer bist du ohne Bildschirm?',
    clusterId: 'Fokus & Flow',
    promptHook: 'Du willst weniger Digital, aber bleibst süchtig.',
    followUpQuestion: 'Wer bist du ohne Bildschirm?',
    recommendedTypes: ['article', 'event']
  }
];
