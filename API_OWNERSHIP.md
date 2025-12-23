# API Ownership Regeln

**Version:** 1.0  
**Letzte Aktualisierung:** 2025-01-XX  
**Zweck:** Verbindliche Regeln welche API welche Felder schreiben/lesen darf

Siehe auch: [FIELD_MATRIX.md](./FIELD_MATRIX.md) für die vollständige Feld-Matrix.

## Grundprinzipien

1. **Ein Feld = Eine Write-API**: Jedes Feld wird von genau einer API geschrieben (Ausnahme: `guide_tone` kann initial und später geändert werden)
2. **Onboarding = Initial**: Onboarding API setzt nur Initial-Felder, die später nicht mehr geändert werden sollen
3. **Settings = Updateable**: Settings APIs können ihre spezifischen Felder überschreiben
4. **Keine impliziten Defaults**: Frontend hat keine Fallbacks - wenn ein Feld fehlt, muss die API es setzen
5. **Explizite Read-Permissions**: Jede API liest nur die Felder, die sie benötigt (keine `select *`)

## Write APIs

### 1. `/api/profile/onboarding` (POST)

**Zweck:** Initiales Setzen von Basis-Profilfeldern beim Onboarding

**Darf schreiben:**
- `display_name` (MUSS gesetzt werden)
- `birth_date` (MUSS gesetzt werden, NOT NULL)
- `target_age` (MUSS gesetzt werden, NOT NULL)
- `goal_direction` (optional, nullable)
- `answer_style` (optional, default: 'medium')
- `guide_tone` (optional, default: 'Straight')
- `main_goal_id` (wenn Goal-Text übergeben wird, via user_goals)

**Darf NICHT schreiben:**
- Alle anderen Felder (insbesondere Settings-Felder wie `nudging_frequency`, `is_public`, `bio`, etc.)

**Validierung:**
- `name` (display_name): MUSS vorhanden und nicht leer sein
- `birth_date`: MUSS vorhanden sein (NOT NULL)
- `target_age`: MUSS zwischen 18 und 120 liegen
- `goal` ODER `goal_direction`: Mindestens eines muss vorhanden sein, nicht beide

**Besonderheiten:**
- Erstellt initiales Profil mit `display_name: 'RealityCheck User'` (wird sofort überschrieben)
- Erstellt/aktualisiert primäres Goal in `user_goals` wenn Goal-Text übergeben wird
- Setzt `main_goal_id` auf das primäre Goal
- Erstellt Journey Event "Profil erstellt"
- Initialisiert `user_credits` mit 50 Credits

### 2. `/api/profile/guide-settings` (PATCH)

**Zweck:** Aktualisierung von Guide-Einstellungen

**Darf schreiben:**
- `guide_tone` (kann von initial 'Straight' geändert werden)
- `nudging_frequency`
- `nudging_paused_until` (für Guide-Mute)

**Darf NICHT schreiben:**
- Onboarding-Felder (display_name, birth_date, target_age, etc.)
- Andere Settings-Felder

**Validierung:**
- `guide_tone`: Muss einer der Werte sein: 'Soft Touch', 'Straight', 'Hard Truth'
- `nudging_frequency`: Muss einer der Werte sein: 'minimal', 'standard', 'frequent'

### 3. `/api/profile/observatory` (POST)

**Zweck:** Observatory (People) Onboarding und Sichtbarkeitseinstellungen

**Darf schreiben:**
- `is_public` (MUSS boolean sein)
- `bio` (optional, max 120 Zeichen, nur wenn is_public = true)
- `observatory_onboarding_completed` (wird auf true gesetzt)

**Darf NICHT schreiben:**
- Onboarding-Felder
- Andere Settings-Felder

**Validierung:**
- `is_public`: MUSS boolean sein
- `bio`: Max 120 Zeichen, nur wenn `is_public = true`
- Wenn `is_public = false`, wird `bio` auf null gesetzt

**Besonderheiten:**
- Prüft dass Profil existiert (Onboarding muss abgeschlossen sein)

### 4. `/api/profile/avatar` und `/api/profile/avatar/upload`

**Zweck:** Avatar-Verwaltung

**Darf schreiben:**
- `avatar_type`
- `avatar_url`
- `avatar_seed`
- `avatar_style`

**Darf NICHT schreiben:**
- Alle anderen Felder

### 5. (TODO) Felder ohne explizite API

Folgende Felder haben keine explizite Update-API gefunden:
- `focus_topic`
- `will_learn`
- `will_share`
- `slots_article`, `slots_podcast`, `slots_quote`
- `music_taste`
- `lifestyle`
- `interests` (evtl. via separate `user_interests` Tabelle)
- `focus_window`

**Aktion erforderlich:** Prüfen ob diese Felder verwendet werden und ggf. API-Routen erstellen.

## Read APIs

### 1. `/api/people` und `/api/people/[userId]` (GET)

**Zweck:** Öffentliche Profile für People-Seite

**Darf lesen (nur öffentliche Felder):**
- `user_id`
- `display_name`
- `birth_date`
- `target_age`
- `goal_direction`
- `avatar_type`, `avatar_url`, `avatar_seed`, `avatar_style`
- `is_public`
- `bio`
- `created_at`, `updated_at` (optional)

**Plus aus `user_goals` (join):**
- `title` (als `primary_goal.title`)

**Filter:**
- `is_public = true`
- `observatory_onboarding_completed = true`
- `display_name IS NOT NULL`
- `birth_date IS NOT NULL`
- `target_age IS NOT NULL`

**Darf NICHT lesen:**
- Private Felder (answer_style, guide_tone, nudging_frequency, slots_*, etc.)
- `main_goal_id` (direkt, wird via user_goals join geladen)

**Implementierung:**
- Explizite `select()` Liste verwenden, NICHT `select('*')`
- Siehe [FIELD_MATRIX.md](./FIELD_MATRIX.md) für vollständige Liste

### 2. `/api/guide/chat` (POST)

**Zweck:** Guide-Funktionalität mit User-Kontext

**Darf lesen (private + öffentliche Felder):**
- `display_name`
- `focus_topic`
- `bio`
- `slots_article`, `slots_podcast`, `slots_quote`
- `answer_style`
- `guide_tone`
- `focus_window`
- `nudging_frequency`

**Plus aus `user_goals` (join):**
- `title` (als `primary_goal`)

**Darf NICHT lesen:**
- `birth_date`, `target_age` (werden nicht direkt verwendet, evtl. für Kontext)
- `is_public` (nicht relevant für Guide)

**Implementierung:**
- Explizite `select()` Liste verwenden
- Siehe [FIELD_MATRIX.md](./FIELD_MATRIX.md) für vollständige Liste

### 3. `/api/profile` (GET)

**Zweck:** Eigener User-Profil für Settings/Display

**Darf lesen:**
- Alle Felder (`select('*')` ist hier erlaubt, da es der eigene User ist)

**Filter:**
- `user_id = current_user.id` (nur eigener User)

**Besonderheiten:**
- Gibt auch gemapptes Legacy-Format zurück (via `mapUserProfileToLegacyProfile`)
- Lädt primäres Goal aus `user_goals`

## Konsistenz-Regeln

### 1. main_goal_id ↔ user_goals.is_primary

**Regel:** Wenn `main_goal_id` gesetzt ist, muss ein entsprechendes Goal in `user_goals` mit `is_primary = true` und `id = main_goal_id` existieren.

**Implementierung:**
- Onboarding API stellt dies sicher: Erstellt/aktualisiert Goal in `user_goals`, setzt dann `main_goal_id`
- Keine andere API sollte `main_goal_id` direkt setzen ohne `user_goals` zu aktualisieren

### 2. birth_date NOT NULL

**Regel:** `birth_date` MUSS beim Onboarding gesetzt werden (NOT NULL per API-Validierung).

**Aktueller Zustand:**
- DB: nullable (Migration 014 macht es nullable)
- API: erzwingt NOT NULL beim Onboarding

**Empfehlung:** DB-Migration prüfen/aktualisieren, damit DB und API konsistent sind.

### 3. is_public ↔ bio

**Regel:** Wenn `is_public = false`, sollte `bio = null` sein.

**Implementierung:**
- Observatory API setzt `bio = null` wenn `is_public = false`

### 4. Keine Fallbacks im Frontend

**Regel:** Frontend hat keine impliziten Defaults für fehlende Felder.

**Beispiel:** `display_name || 'RealityCheck User'` ist NICHT erlaubt. Wenn `display_name` fehlt, muss die API es setzen.

**Zu entfernen:**
- `profile-mapper.ts`: `display_name || 'RealityCheck User'`
- `profile-mapper.ts`: `targetAge || 80`
- Alle anderen Fallbacks in Read-APIs

## Migrations-Strategie

Wenn neue Felder hinzugefügt werden:

1. Feld in DB hinzufügen (Migration)
2. Feld in `database.types.ts` hinzufügen
3. Feld in [FIELD_MATRIX.md](./FIELD_MATRIX.md) dokumentieren
4. Write-API definieren (eine API, die das Feld schreibt)
5. Read-APIs aktualisieren (explizite select-Listen)
6. Dokumentation aktualisieren (dieses Dokument)

## Validierungs-Checkliste

Vor jedem Deploy prüfen:

- [ ] Jedes Feld hat genau eine Write-API
- [ ] Onboarding API schreibt nur Initial-Felder
- [ ] Settings APIs überschreiben nur ihre Felder
- [ ] People API verwendet explizite select-Liste (nur öffentliche Felder)
- [ ] Guide API verwendet explizite select-Liste
- [ ] Keine Fallbacks im Frontend-Code
- [ ] `birth_date` ist NOT NULL (API + DB konsistent)
- [ ] `main_goal_id` ↔ `user_goals.is_primary` ist konsistent
- [ ] `is_public = false` → `bio = null`

