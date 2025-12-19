# FYF Guide Chat Architektur

## Kernprinzip: "1 kuratiertes Item im Chat, Rest im Feedboard"

### Warum diese Architektur?

- **Dosis klein halten**: Respektiert Slots und verhindert Überforderung
- **Guide = Spiegel**: Der Guide hebt **1 Stück** hervor, der Feed bleibt der Ort für "mehr davon"
- **Klare Trennung**: "Das ist heute dein Vorschlag. Alles andere kannst du dir bewusst holen."

## Architektur-Übersicht

```
User fragt Guide
    ↓
API findet passende Items aus Cluster
    ↓
LLM wählt 1 Item aus (selected_item)
    ↓
┌─────────────────────────────────────┐
│  CHAT: 1 kuratiertes Item           │
│  - Titel, Dauer, Cluster            │
│  - "Warum siehst du das?"           │
│  - Buttons: Ja / Später / Skip      │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  FEEDBOARD: Restliche Items        │
│  - Aus demselben Cluster            │
│  - Passt sich im Hintergrund an     │
│  - Mehr/Weniger/Cluster-Prefs      │
└─────────────────────────────────────┘
```

## API Response Struktur

```typescript
{
  response: string,              // Guide's Antwort (Spiegelung)
  selected_item: {               // Das eine Item für den Chat
    id: string,
    title: string,
    cluster: string,
    format: string,
    read_time_minutes: number,
    url: string,
    subtitle: string,
    why: string                  // "Warum siehst du das?"
  } | null,
  feedboard_items: [             // Restliche Items für Feedboard
    {
      id: string,
      title: string,
      cluster: string,
      format: string,
      read_time_minutes: number,
      url: string,
      subtitle: string
    }
  ],
  detectedCluster: string | null, // Erkanntes Cluster aus User-Intent
  slots_remaining: {
    article: "2/3",
    podcast: "1/2",
    quote: "4/∞"
  }
}
```

## Frontend Implementierung

### GuideChatSidebar

- Zeigt **nur 1 Item** (selected_item)
- Enthält:
  - Titel, Format, Cluster, Dauer
  - "Warum siehst du das?" (mit Grund)
  - Action Buttons: **Ja / Später / Skip**
  - Link zum Item

### Feedboard

- Zeigt **restliche Items** aus demselben Cluster
- Filtert automatisch nach `detectedCluster`
- Passt sich im Hintergrund an (Mehr/Weniger/Cluster-Prefs)

## Action Buttons (TODO)

### "Ja"
- Item als konsumiert markieren
- Slot dekrementieren
- Item öffnen

### "Später"
- Item für später speichern
- Slot nicht dekrementieren

### "Skip"
- Item als übersprungen markieren
- Slot nicht dekrementieren
- Feedback für Algorithmus

## Datenfluss

1. **User fragt Guide** → `/api/guide/chat`
2. **API findet Items** → Filtert nach Cluster, Format, Slots
3. **LLM wählt 1 Item** → `selected_item`
4. **Restliche Items** → `feedboard_items`
5. **Chat zeigt 1 Item** → GuideChatSidebar
6. **Feedboard zeigt Rest** → Filtert nach `detectedCluster`

## Vorteile

✅ **Kleine Dosis**: Nur 1 Vorschlag, nicht überwältigend  
✅ **Klare Trennung**: Chat = Vorschlag, Feedboard = Exploration  
✅ **Respektiert Slots**: Guide zeigt nur, was verfügbar ist  
✅ **Hintergrund-Anpassung**: Feedboard passt sich automatisch an  
✅ **Bewusste Entscheidung**: User wählt aktiv (Ja/Später/Skip)

## Code-Stellen

- **API Route**: `src/app/api/guide/chat/route.ts`
- **Chat Component**: `src/components/feedboard/GuideChatSidebar.tsx`
- **Feedboard Integration**: `src/app/feedboard/page.tsx`
- **Types**: `src/types/feedboard.ts`
