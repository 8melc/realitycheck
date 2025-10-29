export interface FYFPillar {
  key: string
  title: string
  subtitle: string
  text: string
  action: string
  link: string
  accent: 'mint' | 'coral' | 'white'
  visual: string
}

export const fyfPillars: FYFPillar[] = [
  {
    key: "guide",
    title: "GUIDE",
    subtitle: "KI, die Haltung lernt.",
    text: "Dein persönlicher Sparringspartner. Nicht für Ziele – für Klarheit.",
    action: "Geh hinein",
    link: "/feedboard",
    accent: "mint",
    visual: "guide"
  },
  {
    key: "people",
    title: "PEOPLE",
    subtitle: "Perspektiven statt Profile.",
    text: "Entdecke Menschen, die Zeit anders denken – Künstler, Denker, Rebellen.",
    action: "Begegne ihnen",
    link: "/people",
    accent: "coral",
    visual: "people"
  },
  {
    key: "access",
    title: "ACCESS",
    subtitle: "Erlebnisse, die bleiben.",
    text: "Events, Räume und reale Momente, die FYF für dich kreiert.",
    action: "Erlebe es",
    link: "/access",
    accent: "white",
    visual: "access"
  }
]
