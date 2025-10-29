import { GuideTone } from '@/stores/guideStore';

type ToneTexts = {
  [key: string]: {
    straight: string;
    soft: string;
  };
};

const toneTexts: ToneTexts = {
  // Guide Settings
  guideSettingsTitle: {
    straight: 'Guide-Einstellungen',
    soft: 'Deine Guide-Präferenzen',
  },
  nudgingDescription: {
    straight: 'Ich erinnere dich, wenn es wichtig wird. Nicht nervig, aber konsequent.',
    soft: 'Dein Guide passt sich an deine Bedürfnisse an.',
  },
  
  // Tone Calibration
  toneStraight: {
    straight: 'Straight Talk',
    soft: 'Direkt & Ehrlich',
  },
  toneSoft: {
    straight: 'Soft Touch',
    soft: 'Sanft & Verständnisvoll',
  },
  toneActive: {
    straight: 'Modus: Straight Talk aktiviert',
    soft: 'Modus: Soft Touch aktiviert',
  },
  
  // Nudging
  nudgingTitle: {
    straight: 'NUDGING-FREQUENZ',
    soft: 'Wie oft soll ich dich erinnern?',
  },
  
  // Silence Button
  haltDieFresse: {
    straight: 'Halt die Fresse',
    soft: 'Guide pausieren',
  },
  haltDieFresseFeedback: {
    straight: 'Okay, ich halte jetzt die Klappe. Du kannst mich jederzeit wieder aktivieren.',
    soft: 'Verstanden. Ich warte, bis du bereit bist.',
  },
  
  // Conversation
  conversationTitle: {
    straight: 'Guide Gespräche',
    soft: 'Deine Gespräche mit mir',
  },
  conversationSubtitle: {
    straight: 'Frag den FYF Guide etwas – deine Gespräche werden hier gespeichert.',
    soft: 'Stell mir Fragen oder lass uns über deine Ziele sprechen.',
  },
  
  // Actions
  actionsTitle: {
    straight: 'Deine To-Dos',
    soft: 'Deine nächsten Schritte',
  },
  actionsSubtitle: {
    straight: 'Tasks, die dir helfen, dein Ziel zu erreichen.',
    soft: 'Ich habe dir ein paar Aufgaben zusammengestellt.',
  },
  
  // Profile Summary
  profileGoal: {
    straight: 'Ziel:',
    soft: 'Dein Ziel:',
  },
  profileStatus: {
    straight: 'On Fire',
    soft: 'Auf dem richtigen Weg',
  },
  profileStatusDescription: {
    straight: 'Halte das Tempo. Du setzt dein Ziel konsequent um.',
    soft: 'Du machst großartige Fortschritte. Weiter so!',
  },
  
  // Life Weeks
  lifeWeeksTitle: {
    straight: 'Life in Weeks',
    soft: 'Deine Zeit im Überblick',
  },
  lifeWeeksSubtitle: {
    straight: 'Visualisiere deine verbleibende Zeit',
    soft: 'Sieh, wie wertvoll deine Zeit ist',
  },
  
  // Journey
  journeyTitle: {
    straight: 'Journey',
    soft: 'Dein Weg',
  },
  journeySubtitle: {
    straight: 'Deine letzten Schritte in FYF – damit dein Momentum sichtbar bleibt.',
    soft: 'Schau dir an, was du bereits erreicht hast.',
  },
};

export const getGuideText = (key: string, tone: GuideTone): string => {
  const textGroup = toneTexts[key];
  if (!textGroup) {
    console.warn(`No text found for key: ${key}`);
    return key;
  }
  
  return textGroup[tone] || textGroup.straight;
};

export const getGuideTextWithFallback = (key: string, tone: GuideTone, fallback: string): string => {
  const text = getGuideText(key, tone);
  return text === key ? fallback : text;
};