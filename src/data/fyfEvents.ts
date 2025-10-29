export interface FYFEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  pitch: string;
  why_now: string;
  format: string[];
  people: string[];
  restzeit_info: string;
  rsvp: {
    limit: number;
    application_hint: string;
  };
  isHighlight?: boolean;
  image?: string;
}

export const realitycheckEvents: FYFEvent[] = [
  {
    id: 'nach-uns-sintflut',
    title: 'Nach uns die Sintflut',
    date: '18.10.2025',
    location: 'Berlin, Club Endlos',
    pitch: 'Nächtlicher Rave + philosophischer Realitätscheck. Um 3 Uhr Pause für unbequeme Gedanken zur Vergänglichkeit, dann weiter Hedonismus mit Haltung.',
    why_now: 'Noch 200 Partynächte im Leben. Tanzt du die nächste durch?',
    format: ['Club-Night', 'Talk'],
    people: ['Techno-DJ', 'Philosophin'],
    restzeit_info: 'Noch 15 Samstagabende bis 2026.',
    rsvp: {
      limit: 100,
      application_hint: 'Bewerbung mit 1 Satz: Was treibt dich nachts an?',
    },
    image: '/images/event-rave.jpg',
  },
  {
    id: 'uhrwerk-zukunft',
    title: 'Uhrwerk Zukunft',
    date: '15.06.2025',
    location: 'Leipzig, Alte Uhrenfabrik',
    pitch: 'Du baust mit eigenen Händen Zeit. 80-jähriger Uhrmacher, Zukunftsforscherin: schrauben, denken, machen.',
    why_now: 'Noch 1000 Arbeitswochen im Leben. Baust du was Echtes?',
    format: ['Werkstatt', 'Experiment'],
    people: ['Uhrmacher (80)', 'Zukunftsforscherin'],
    restzeit_info: 'Noch 365 Tage bis 2026.',
    rsvp: {
      limit: 15,
      application_hint: 'Bewerbung mit 1 Satz: Was möchtest du unbedingt noch bauen?',
    },
    image: '/images/event-workshop.jpg',
  },
  {
    id: 'weisheit-wein',
    title: 'Weisheit & Wein',
    date: '22.11.2025',
    location: 'Hamburg, Omas Küche (Pop-up)',
    pitch: 'Intimes Dinner mit Jahrgangswein + Generationen. 83-jährige Bohemienne und 25-jähriger Philosoph am Tisch.',
    why_now: 'Noch 10 Abendessen mit Oma – wie gestaltest du das nächste?',
    format: ['Gesprächs-Dinner'],
    people: ['Bohemienne (83)', 'Philosoph (25)'],
    restzeit_info: 'Noch 12 Wochenenden bis 2026.',
    rsvp: {
      limit: 12,
      application_hint: 'Bewerbung mit 1 Satz: Warum gehörst du an diesen Tisch?',
    },
    image: '/images/event-dinner.jpg',
  },
  {
    id: 'nacht-nomaden',
    title: 'Nacht-Nomaden',
    date: '12.09.2025',
    location: 'Berlin, Teufelsberg (Nachtwanderung)',
    pitch: 'Nächtliche Expedition mit Sternen, Teleskop, Astrophysikerin, Poesie im Dunkel, Morgenhimmel verbindet.',
    why_now: 'Noch 100 Sonnenaufgänge bis 2026. Erlebst du den nächsten bewusst?',
    format: ['Urban Walk', 'Poesie'],
    people: ['Astrophysikerin', 'Poetry-Slammer'],
    restzeit_info: 'Noch 6 Stunden bis zum Morgengrauen.',
    rsvp: {
      limit: 20,
      application_hint: 'Bewerbung mit 1 Satz: Was hält dich nachts wach?',
    },
    image: '/images/event-walk.jpg',
  },
  {
    id: 'reality-trip',
    title: 'Reality Trip',
    date: '21.06.2025',
    location: 'Köln, Odonien',
    pitch: '24h Mikro-Festival, Kunst, Blitz-Talks, Midnight-Yoga, Party & Perspektivwechsel.',
    why_now: 'Noch 15 Wochenenden bis 2026. Wird dein nächstes unvergesslich?',
    format: ['Mikro-Festival', 'Workshops', 'Stage & Club'],
    people: ['Künstlerinnen-Kollektiv', 'Denkerinnen'],
    restzeit_info: 'Noch 100 Tage bis 2026.',
    rsvp: {
      limit: 50,
      application_hint: 'Bewerbung mit 1 Satz: Wofür brennst du im Leben?',
    },
    image: '/images/event-festival.jpg',
  },
  {
    id: 'montagsflucht',
    title: 'Montagsflucht',
    date: '04.08.2025',
    location: 'Frankfurt, leerstehendes Bürohochhaus',
    pitch: 'Escape Game im Büroalltag, Endgegner: Chef, Sinn statt Preisgeld.',
    why_now: 'Noch 1000 Montags-Meetings bis zur Rente. Steigst du beim nächsten aus?',
    format: ['Escape Game', 'Diskussion'],
    people: ['Game-Designerin', 'Psychologe'],
    restzeit_info: 'Noch 20 Montage bis 2026.',
    rsvp: {
      limit: 8,
      application_hint: 'Bewerbung mit 1 Satz: Warum willst du da raus?',
    },
    image: '/images/event-escape.jpg',
  },
  {
    id: 'spater-war-gestern',
    title: 'Später war gestern',
    date: '25.04.2025',
    location: 'Hamburg, Gängeviertel',
    pitch: 'Kreativer Protestabend, Klima-Aktivistin und Street-Art-Künstler heizen ein.',
    why_now: 'Noch 5 Jahre bis 2030. Bleibst du leise oder wirst du laut?',
    format: ['Art-Aktion', 'Mini-Rave'],
    people: ['Klima-Aktivistin', 'Street-Art-Künstler'],
    restzeit_info: 'Noch 20 Freitage bis 2026.',
    rsvp: {
      limit: 30,
      application_hint: 'Bewerbung mit 1 Satz: Wofür gehst du auf die Barrikaden?',
    },
    image: '/images/event-protest.jpg',
  },
  {
    id: 'zeitverschwendung-deluxe',
    title: 'Zeitverschwendung Deluxe',
    date: '18.01.2026',
    location: 'Berlin, Tempelhofer Feld',
    pitch: 'Anti-Burnout, Zen-Mönch und Ex-Managerin, Pflichtprogramm: Nichts tun.',
    why_now: 'Noch 15 Sonntage bis 2026. Legst du beim nächsten die Füße hoch?',
    format: ['Urban Retreat (Silent)'],
    people: ['Zen-Mönch', 'Ex-Managerin'],
    restzeit_info: 'Noch 12 Urlaubstage bis 2026.',
    rsvp: {
      limit: 10,
      application_hint: 'Bewerbung mit 1 Satz: Was ist deine liebste Art, Zeit zu verschwenden?',
    },
    image: '/images/event-retreat.jpg',
  },
  {
    id: 'future-selfie',
    title: 'Future Selfie',
    date: '17.04.2026',
    location: 'München, Future Lab',
    pitch: 'Mit KI siehst du dich um 25 Jahre gealtert, Life-Coach und KI-Entwicklerin moderieren.',
    why_now: 'Noch 25 Jahre bis 2050. Kennst du dein Zukunfts-Ich?',
    format: ['Demo', 'Selbstexperiment'],
    people: ['Life-Coach', 'KI-Entwicklerin'],
    restzeit_info: 'Noch 25 Silvester bis 2050.',
    rsvp: {
      limit: 20,
      application_hint: 'Bewerbung mit 1 Satz: Welche Frage würdest du deinem Zukunfts-Ich stellen?',
    },
    image: '/images/event-ki.jpg',
  },
  {
    id: 'balance-check-zeit-edition',
    title: 'Balance Check: Zeit-Edition',
    date: '22.11.2025 · Sa · 18:30',
    location: 'Köln, Altes Pfandhaus',
    pitch: 'Dein wichtigstes Konto ist im Minus. Live-Audit deines Zeit-Vermögens mit Experten, die deine Illusionen zerstören. Danach: DJ, Drinks, Menschen.',
    why_now: 'Wie viel Autopilot steckt in deinem Leben?',
    format: ['Live Event', '3h Reality Check', 'Beats'],
    people: ['Jonas Geißler', 'Prof. Dr. Lothar Seiwert', 'Céleste Spahić'],
    restzeit_info: 'Noch 14 Samstage bis Silvester',
    rsvp: {
      limit: 50,
      application_hint: 'Warum ist der Balance Check jetzt für dich unverzichtbar? (1 Satz)',
    },
    isHighlight: true,
    image: '/images/balance-check-hero.jpg',
  },
];
