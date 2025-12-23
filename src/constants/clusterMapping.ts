// src/constants/clusterMapping.ts
export const CLUSTER_LABELS: Record<string, string> = {
  time_focus: "Zeit & Endlichkeit",
  freedom_places: "Freiheit & Orte",
  money_value: "Geld & Wert",
  meaning: "Sinn & Bedeutung",
  growth: "Wachstum",
  relationships: "Beziehungen",
  self_knowledge: "Selbsterkenntnis",
  culture: "Kultur & Stimmen",
  focus_flow: "Fokus & Flow",
};

// optional: falls du an anderer Stelle die Keys brauchst
export type ClusterCode = keyof typeof CLUSTER_LABELS;


