// src/utils/whyText.ts
import { CLUSTER_LABELS } from "@/constants/clusterMapping";

type BuildWhyTextOpts = {
  matchReason?: string | null;
  guideWhy?: string | null;
  lastUserMessage?: string | null;
  clusterCode?: string | null;
};

function extractClusterCode(raw?: string | null): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();

  // Beispiele:
  // "Cluster time_focus (erkannt aus deiner Nachricht)."
  // "Cluster time_focus."
  // "time_focus"
  // "cluster:time_focus"
  // "theme=time_focus"
  const lower = trimmed.toLowerCase();

  // 1. Wenn direkt ein bekannter Key drin steckt
  for (const key of Object.keys(CLUSTER_LABELS)) {
    if (lower.includes(key.toLowerCase())) {
      return key;
    }
  }

  return null;
}

export function buildWhyText(opts: BuildWhyTextOpts): string {
  const { matchReason, guideWhy, lastUserMessage, clusterCode } = opts;

  // 1. Wenn ein sauberer guideWhy-Text da ist → direkt verwenden
  if (guideWhy && guideWhy.trim().length > 0) {
    return guideWhy.trim();
  }

  // 2. Cluster-Code bestimmen (Prio: expliziter Code > aus matchReason extrahiert)
  const code = clusterCode || extractClusterCode(matchReason);
  const label = code ? CLUSTER_LABELS[code] : null;

  // 3. Wenn Cluster-Label + User-Message da sind → kontextueller Satz
  if (label && lastUserMessage && lastUserMessage.trim().length > 0) {
    return `Weil du gerade zu „${lastUserMessage.trim()}“ gearbeitet hast und dieses Stück genau in den Cluster ${label} fällt – Klarheit statt weiterer Ablenkung.`;
  }

  // 4. Nur Cluster-Label → allgemeiner Satz
  if (label) {
    return `Weil dieses Stück in den Cluster ${label} fällt und zu deinem aktuellen Fokus passt – kein Random-Content, sondern kuratierte Relevanz.`;
  }

  // 5. Fallback – nie peinlich, nie technisch
  return "Weil Inhalt, Dauer und Thema zu deinem Fokus und deinen Filtern passen – nicht optimiert für Klicks, sondern für deine Zeit.";
}
