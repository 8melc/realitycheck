# Content Items Feld-Verwendung Analyse
## Tabelle `public.content_items` - Frontend vs. Backend

**Datum:** Code-Analyse basierend auf aktueller Codebase  
**Ziel:** Übersicht, welche Felder im Frontend verwendet werden vs. nur im Backend oder ungenutzt

---

## Feld-Verwendungs-Tabelle

| Feldname | Verwendet in Dateien | Status |
|----------|---------------------|--------|
| `id` | `src/app/api/feedboard/items/route.ts` – Mapping zu FeedItem<br>`src/app/api/guide/chat/route.ts` – Item-Auswahl<br>`src/app/feedboard/page.tsx` – FeedCard Key<br>`src/app/api/feedboard/interactions/route.ts` – Interaktionen | ✅ **Wird im Frontend genutzt** |
| `title` | `src/app/api/feedboard/items/route.ts` – Mapping zu FeedItem.title<br>`src/app/api/guide/chat/route.ts` – Empfehlungen<br>`src/app/feedboard/page.tsx` – FeedCard UI (Zeile 724)<br>`src/app/api/feedboard/items/[id]/guide-comment/route.ts` – Overlay | ✅ **Wird im Frontend genutzt** |
| `subtitle` | `src/app/api/feedboard/items/route.ts` – Mapping zu description/guideComment (Zeile 48)<br>`src/app/api/guide/chat/route.ts` – Fallback für why (Zeile 143, 171, 199)<br>`src/app/feedboard/page.tsx` – FeedCard guideComment (Zeile 726) | ✅ **Wird im Frontend genutzt** |
| `content_type` | `src/app/api/feedboard/items/route.ts` – Format-Mapping (Zeile 49)<br>`src/app/api/content/stats/route.ts` – Statistiken | ⚠️ **Nur im Backend genutzt** (Format-Mapping) |
| `url` | `src/app/api/feedboard/items/route.ts` – Mapping zu FeedItem.link (Zeile 62)<br>`src/app/api/guide/chat/route.ts` – Empfehlungen<br>`src/app/feedboard/page.tsx` – FeedCard Link (Zeile 771) | ✅ **Wird im Frontend genutzt** |
| `author` | `src/lib/types/database.types.ts` – Type-Definition | ❌ **Aktuell ungenutzt** |
| `source` | `src/app/api/feedboard/items/route.ts` – Mapping zu FeedItem.source (Zeile 65) | ⚠️ **Nur im Backend genutzt** (Mapping, nicht im UI) |
| `cluster` | `src/app/api/feedboard/items/route.ts` – Theme-Mapping (Zeile 52-53)<br>`src/app/api/guide/chat/route.ts` – Cluster-Filter (Zeile 113-114)<br>`src/app/feedboard/page.tsx` – FeedCard Theme (Zeile 721)<br>`src/app/api/feedboard/interactions/route.ts` – Logging (Zeile 77)<br>`src/app/api/content/stats/route.ts` – Statistiken | ✅ **Wird im Frontend genutzt** |
| `format` | `src/app/api/feedboard/items/route.ts` – Format-Mapping (Zeile 24-42)<br>`src/app/api/guide/chat/route.ts` – Format-Filter (Zeile 109)<br>`src/app/feedboard/page.tsx` – Format-Filter UI<br>`src/app/api/content/stats/route.ts` – Statistiken | ✅ **Wird im Frontend genutzt** |
| `read_time_minutes` | `src/app/api/guide/chat/route.ts` – Empfehlungen (Zeile 108, 141, 169, 198)<br>`src/app/feedboard/page.tsx` – selectedItem (Zeile 407) | ⚠️ **Nur im Backend genutzt** (wird gelesen, aber nicht im UI angezeigt) |
| `quote_text` | `src/app/api/feedboard/items/route.ts` – Fallback für description (Zeile 48)<br>`src/app/api/feedboard/items/route.ts` – Fallback für guideComment (Zeile 67) | ✅ **Wird im Frontend genutzt** |
| `person_role` | `src/lib/types/database.types.ts` – Type-Definition | ❌ **Aktuell ungenutzt** |
| `event_location` | `src/lib/types/database.types.ts` – Type-Definition | ❌ **Aktuell ungenutzt** |
| `event_date` | `src/lib/types/database.types.ts` – Type-Definition | ❌ **Aktuell ungenutzt** |
| `is_published` | `src/app/api/feedboard/items/route.ts` – Filter (implizit via `select('*')`)<br>`src/app/api/guide/chat/route.ts` – Filter (Zeile 109, 148, 181)<br>`src/app/api/content/stats/route.ts` – Statistiken (Zeile 26, 32, 44) | ⚠️ **Nur im Backend genutzt** (Filter, nicht im UI) |
| `created_at` | `src/app/api/feedboard/items/route.ts` – Sortierung (Zeile 89)<br>`src/app/api/guide/chat/route.ts` – Sortierung (Zeile 119, 156, 185)<br>`src/app/api/content/stats/route.ts` – Statistiken | ⚠️ **Nur im Backend genutzt** (Sortierung) |
| `updated_at` | `src/lib/types/database.types.ts` – Type-Definition | ❌ **Aktuell ungenutzt** |
| `slug` | `src/lib/types/database.types.ts` – Type-Definition | ❌ **Aktuell ungenutzt** |
| `transparency_reason` | `src/app/api/guide/chat/route.ts` – Empfehlungen why-Feld (Zeile 108, 144, 153, 172, 183, 200)<br>`src/app/api/feedboard/items/[id]/guide-comment/route.ts` – Overlay (Zeile 15, 26)<br>`src/app/feedboard/page.tsx` – Guide Overlay UI (Zeile 827, 1110) | ✅ **Wird im Frontend genutzt** |
| `guide_comment` | `src/app/api/feedboard/items/[id]/guide-comment/route.ts` – API-Route (Zeile 15, 25)<br>`src/app/feedboard/page.tsx` – FeedCard guideComment (Zeile 726, 754)<br>`src/app/feedboard/page.tsx` – Guide Overlay UI (Zeile 827, 1107) | ✅ **Wird im Frontend genutzt** |
| `eisenhower_category` | `src/lib/types/database.types.ts` – Type-Definition (nur in user_goals, nicht in content_items) | ❌ **Aktuell ungenutzt** |
| `perma_dimension` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `language` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `publication_date` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `thumbnail_url` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `tags` | Nicht in `database.types.ts` definiert (content_items)<br>Wird in Mock-Daten verwendet (`src/app/guide/page.tsx`), aber nicht aus DB gelesen | ❌ **Aktuell ungenutzt** |
| `target_audience` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `required_credits` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `related_goal_types` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `view_count` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `like_count` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `skip_count` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `content_quality_score` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `curator_notes` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `created_by_user_id` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `last_reviewed_at` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `is_featured` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |
| `priority_score` | Nicht in `database.types.ts` definiert | ❌ **Aktuell ungenutzt** |

---

## Wichtige Erkenntnisse

### ✅ Felder, die im Frontend verwendet werden:
1. **`id`** – Item-Identifikation, Keys, Interaktionen
2. **`title`** – FeedCard Überschrift
3. **`subtitle`** – FeedCard Beschreibung/Guide-Comment
4. **`url`** – FeedCard Link
5. **`cluster`** – Theme-Mapping und Filter
6. **`format`** – Format-Filter und UI-Anzeige
7. **`quote_text`** – Fallback für Beschreibung
8. **`transparency_reason`** – Guide Overlay "Warum?"-Sektion
9. **`guide_comment`** – FeedCard Guide-Comment und Overlay

### ⚠️ Felder, die nur im Backend verwendet werden:
1. **`content_type`** – Format-Mapping (nicht direkt im UI)
2. **`source`** – Mapping zu FeedItem.source (nicht im UI sichtbar)
3. **`read_time_minutes`** – Wird gelesen, aber **nicht im UI angezeigt**
4. **`is_published`** – Filter-Logik (nicht im UI)
5. **`created_at`** – Sortierung (nicht im UI)

### ❌ Felder, die aktuell ungenutzt sind:
- **Event-bezogen:** `event_location`, `event_date`, `person_role`
- **Metadaten:** `author`, `slug`, `updated_at`, `language`, `publication_date`
- **Kuration:** `tags`, `target_audience`, `thumbnail_url`, `curator_notes`, `is_featured`, `priority_score`
- **Credits/Goals:** `required_credits`, `related_goal_types`
- **Analytics:** `view_count`, `like_count`, `skip_count`, `content_quality_score`
- **Workflow:** `created_by_user_id`, `last_reviewed_at`
- **Klassifikation:** `eisenhower_category`, `perma_dimension`

---

## Besondere Hinweise

### `transparency_reason`
- ✅ **Wird im Frontend verwendet**
- Verwendet in: Guide Chat Empfehlungen (`why`-Feld), Guide Overlay in FeedCard
- UI: Zeile 1110 in `feedboard/page.tsx` – "Warum?"-Sektion im Guide Overlay

### `guide_comment`
- ✅ **Wird im Frontend verwendet**
- Verwendet in: FeedCard als `guideComment` (Zeile 726), Guide Overlay (Zeile 1107)
- UI: Direkt sichtbar in FeedCard und im Guide Overlay

### `eisenhower_category`, `perma_dimension`, `tags`, `target_audience`, `content_quality_score`
- ❌ **Aktuell ungenutzt**
- Diese Felder existieren in der DB (laut User-Liste), aber:
  - Nicht in `database.types.ts` definiert
  - Keine Verwendung im Code gefunden
  - Keine UI-Komponenten nutzen diese Felder

### `read_time_minutes`
- ⚠️ **Wird gelesen, aber nicht angezeigt**
- Wird in Guide Chat API verwendet (Zeile 108, 141, 169, 198 in `chat/route.ts`)
- Wird in `selectedItem` gespeichert (Zeile 407 in `feedboard/page.tsx`)
- **ABER:** Keine UI-Komponente zeigt die Lesezeit an

---

## Vorschläge für ungenutzte Felder

### 1. **`read_time_minutes`** → Lesezeit-Badge
- **Feature:** Zeige Lesezeit auf FeedCards (z.B. "5 Min" Badge)
- **UI:** Kleines Badge oben rechts auf FeedCard, ähnlich wie Format-Badge
- **Nutzen:** User können Zeitaufwand einschätzen, bevor sie klicken

### 2. **`tags`** → Tag-Filter & Badges
- **Feature:** Tag-Badges auf FeedCards + Filter-Sidebar
- **UI:** Chips unter FeedCard-Titel, Filter-Optionen in Sidebar
- **Nutzen:** Bessere Kategorisierung, ähnlich wie Cluster, aber granularer

### 3. **`thumbnail_url`** → Card-Vorschaubilder
- **Feature:** Thumbnail-Bilder auf FeedCards statt Gradient
- **UI:** Ersetze `feed-card__visual` Gradient durch `<img src={thumbnail_url}>`
- **Nutzen:** Visuell ansprechender, bessere Erkennbarkeit

### 4. **`is_featured`** + `priority_score` → Hero-Card-Logik
- **Feature:** Automatische Hero-Card-Auswahl basierend auf `is_featured` und `priority_score`
- **UI:** Ersetze hardcoded `index === 0` Logik (Zeile 107 in `items/route.ts`)
- **Nutzen:** Bessere Kuratierung, Featured-Items bekommen mehr Sichtbarkeit

### 5. **`view_count`, `like_count`, `skip_count`** → Engagement-Metriken
- **Feature:** Engagement-Badges ("1.2k Views", "👍 45") + Skip-Rate-Warnung
- **UI:** Kleine Metrik-Badges auf FeedCards, Tooltip mit Details
- **Nutzen:** Social Proof, Transparenz über Content-Performance

### 6. **`content_quality_score`** → Qualitäts-Badge
- **Feature:** Qualitäts-Indikator (z.B. "⭐⭐⭐⭐⭐" oder "Kuratierte Auswahl")
- **UI:** Badge neben Format-Badge, Tooltip erklärt Score
- **Nutzen:** Vertrauen in Content-Qualität, Unterscheidung von User-Generated Content

### 7. **`target_audience`** → Personalisierungs-Filter
- **Feature:** Filter nach Zielgruppe (z.B. "Für Einsteiger", "Für Experten")
- **UI:** Filter-Option in Sidebar, Badge auf FeedCard
- **Nutzen:** Bessere Personalisierung, User sehen nur relevante Inhalte

### 8. **`eisenhower_category`** → Prioritäts-Badge
- **Feature:** Eisenhower-Matrix Badge (Wichtig/Dringend)
- **UI:** Farbcodiertes Badge (z.B. rot = wichtig+dringend, grün = weder/noch)
- **Nutzen:** Schnelle Priorisierung, hilft bei Zeit-Entscheidungen

### 9. **`perma_dimension`** → PERMA-Wellbeing-Badge
- **Feature:** PERMA-Dimension Badge (Meaning, Relationships, Accomplishment, etc.)
- **UI:** Badge neben Cluster-Badge, Tooltip erklärt Dimension
- **Nutzen:** Verbindung zu Wellbeing-Dimensionen, bessere Kategorisierung

### 10. **`required_credits`** → Credits-System
- **Feature:** Premium-Content mit Credits-Gate
- **UI:** Badge "2 Credits" auf FeedCard, Overlay bei Klick wenn Credits fehlen
- **Nutzen:** Monetarisierung, Premium-Content-Modell

---

## Zusammenfassung der wichtigsten Lücken

1. **`read_time_minutes`** – Wird gelesen, aber nicht angezeigt → **Höchste Priorität**
2. **`tags`** – Keine Tag-Filterung möglich → **Hohe Priorität**
3. **`thumbnail_url`** – Keine Bilder, nur Gradienten → **Mittlere Priorität**
4. **`is_featured` + `priority_score`** – Hero-Card-Logik ist hardcoded → **Mittlere Priorität**
5. **Engagement-Metriken** (`view_count`, `like_count`, `skip_count`) – Keine Social Proof → **Niedrige Priorität**
6. **`content_quality_score`** – Keine Qualitäts-Indikatoren → **Niedrige Priorität**

---

## Empfehlung: Top 3 Features für nächste Iteration

1. **Lesezeit-Badge** (`read_time_minutes`) – Schnell umsetzbar, hoher Nutzen
2. **Tag-System** (`tags`) – Bessere Filterung, ähnlich wie Cluster
3. **Thumbnail-Images** (`thumbnail_url`) – Visuelle Verbesserung, hoher Impact

