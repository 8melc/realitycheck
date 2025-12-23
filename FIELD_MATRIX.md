# Feld-Matrix: user_profiles

**Version:** 1.0  
**Letzte Aktualisierung:** 2025-01-XX  
**Zweck:** Verbindliche Definition der Feld-Ownership, Write-APIs, Read-APIs und Öffentlichkeit

## Prinzipien

1. **Ein Feld = Eine Write-API**: Jedes Feld wird von genau einer API geschrieben
2. **Onboarding vs. Settings**: Initial-Felder (Onboarding) vs. änderbare Felder (Settings)
3. **Keine impliziten Defaults**: Frontend hat keine Fallbacks für fehlende Werte
4. **Explizite Read-Permissions**: Jede API liest nur die Felder, die sie benötigt

## Legende

- **Kategorie**: `INITIAL` (nur Onboarding) | `UPDATEABLE` (kann später geändert werden)
- **Write API**: Genau eine API-Route, die das Feld schreibt
- **Read APIs**: `People` | `Guide` | `Profile` (eigener User)
- **Public**: `Ja` (sichtbar in People API) | `Nein` (nur für eigenen User/Guide)

## Feld-Matrix

| Feld | DB-Spalte | Kategorie | Geschrieben von | Gelesen von | Öffentlich | Validation | Bemerkungen |
|------|-----------|-----------|-----------------|-------------|------------|------------|-------------|
| **Identity** |
| display_name | `display_name` | INITIAL | `/api/profile/onboarding` | People, Guide, Profile | Ja | NOT NULL (implizit via API) | Name des Users, initial beim Onboarding gesetzt |
| birth_date | `birth_date` | INITIAL | `/api/profile/onboarding` | People, Guide, Profile | Ja | NOT NULL (API erzwingt, DB ist nullable - siehe TODO) | Geburtsdatum, muss beim Onboarding gesetzt werden |
| target_age | `target_age` | INITIAL | `/api/profile/onboarding` | People, Guide, Profile | Ja | NOT NULL (implizit via API) | Zielalter, muss beim Onboarding gesetzt werden |
| **Goal & Direction** |
| goal_direction | `goal_direction` | INITIAL | `/api/profile/onboarding` | People, Guide, Profile | Ja | nullable | Zielrichtung (freedom, clarity, growth, balance, meaning) |
| main_goal_id | `main_goal_id` | INITIAL | `/api/profile/onboarding` | Guide, Profile | Nein | nullable, FK zu user_goals | Referenz zum primären Goal in user_goals |
| **Guide Settings** |
| answer_style | `answer_style` | INITIAL | `/api/profile/onboarding` | Guide, Profile | Nein | nullable, default: 'medium' | Antwort-Länge (short, medium, long) |
| guide_tone | `guide_tone` | UPDATEABLE | `/api/profile/onboarding` (initial), `/api/profile/guide-settings` (Update) | Guide, Profile | Nein | nullable, default: 'Straight' | Guide-Ton (Soft Touch, Straight, Hard Truth). Initial beim Onboarding, kann später geändert werden |
| focus_window | `focus_window` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Guide, Profile | Nein | nullable | Bevorzugtes Zeitfenster (morning, afternoon, evening, late_night) |
| nudging_frequency | `nudging_frequency` | UPDATEABLE | `/api/profile/guide-settings` | Guide, Profile | Nein | nullable, default: 'standard' | Nudging-Frequenz (minimal, standard, frequent) |
| nudging_paused_until | `nudging_paused_until` | UPDATEABLE | `/api/profile/guide-settings` | Guide, Profile | Nein | nullable | Pause bis Datum (für Guide-Mute) |
| **Observatory (People)** |
| is_public | `is_public` | UPDATEABLE | `/api/profile/observatory` | People, Guide, Profile | Ja | NOT NULL, default: false | Öffentlichkeit des Profils |
| bio | `bio` | UPDATEABLE | `/api/profile/observatory` | Guide, Profile | Ja | nullable, max 120 Zeichen | Bio-Text für öffentliches Profil |
| observatory_onboarding_completed | `observatory_onboarding_completed` | UPDATEABLE | `/api/profile/observatory` | (interne Verwendung) | Nein | NOT NULL, default: false | Flag für abgeschlossenes Observatory-Onboarding |
| **Avatar** |
| avatar_type | `avatar_type` | UPDATEABLE | `/api/profile/avatar`, `/api/profile/avatar/upload` | People, Guide, Profile | Ja | nullable | Avatar-Typ (initials, upload, generated) |
| avatar_url | `avatar_url` | UPDATEABLE | `/api/profile/avatar`, `/api/profile/avatar/upload` | People, Guide, Profile | Ja | nullable | URL zum hochgeladenen Avatar |
| avatar_seed | `avatar_seed` | UPDATEABLE | `/api/profile/avatar` | People, Guide, Profile | Ja | nullable | Seed für generierte Avatare |
| avatar_style | `avatar_style` | UPDATEABLE | `/api/profile/avatar` | People, Guide, Profile | Ja | nullable | Stil für generierte Avatare (avataaars, personas, bottts, micah, lorelei) |
| **Content Slots** |
| slots_article | `slots_article` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Guide, Profile | Nein | nullable, default: 3 | Maximale Anzahl Artikel pro Tag |
| slots_podcast | `slots_podcast` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Guide, Profile | Nein | nullable, default: 2 | Maximale Anzahl Podcasts pro Tag |
| slots_quote | `slots_quote` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Guide, Profile | Nein | nullable, default: 4 | Maximale Anzahl Zitate pro Tag |
| **Content Preferences** |
| music_taste | `music_taste` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Profile | Nein | nullable | Musikgeschmack (electronic, hiphop, rock, jazz, classical, ambient, pop, indie) |
| lifestyle | `lifestyle` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Profile | Nein | nullable | Lebensstil (digital-nomad, remote-worker, office-player, etc.) |
| interests | `interests` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Profile | Nein | nullable | Array von Interessen (vermutlich separate Tabelle user_interests für Details) |
| **Focus & Learning** |
| focus_topic | `focus_topic` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Guide, Profile | Nein | nullable | Fokus-Thema |
| will_learn | `will_learn` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Profile | Nein | nullable | Array: Was der User lernen möchte |
| will_share | `will_share` | UPDATEABLE | (Keine explizite API gefunden - TODO) | Profile | Nein | nullable | Array: Was der User teilen möchte |
| **System Fields** |
| id | `id` | SYSTEM | (Auto-generiert) | People, Guide, Profile | Nein | NOT NULL, UUID | Primärschlüssel |
| user_id | `user_id` | SYSTEM | (Auto-generiert) | People, Guide, Profile | Ja | NOT NULL, FK zu auth.users | User-Referenz |
| guide_personality | `guide_personality` | UNUSED | (Verwendet?) | - | - | nullable | Veraltet/ungenutzt? |
| daily_time_limit_minutes | `daily_time_limit_minutes` | UNUSED | (Verwendet?) | - | - | nullable | Veraltet? (vermutlich user_credits oder user_sessions statt) |
| created_at | `created_at` | SYSTEM | (Auto-generiert) | Profile | Nein | NOT NULL, timestamptz | Erstellt am |
| updated_at | `updated_at` | SYSTEM | (Auto-generiert) | Profile | Nein | NOT NULL, timestamptz | Aktualisiert am |

## Öffentliche Felder (People API)

Die People API (`/api/people`, `/api/people/[userId]`) liest **NUR** folgende Felder (wenn `is_public = true`):

- `user_id`
- `display_name`
- `birth_date`
- `target_age`
- `goal_direction`
- `avatar_type`, `avatar_url`, `avatar_seed`, `avatar_style`
- `is_public`
- `bio` (optional, nur wenn gesetzt)

**Plus** aus `user_goals` (join):
- `title` (als `primary_goal.title`)

## Private Felder (Guide API)

Die Guide API (`/api/guide/chat`) liest folgende Felder für die Guide-Funktionalität:

- `display_name`
- `focus_topic`
- `bio`
- `slots_article`, `slots_podcast`, `slots_quote`
- `answer_style`
- `guide_tone`
- `focus_window`
- `nudging_frequency`

**Plus** aus `user_goals`:
- `title` (als `primary_goal`)

## Offene Fragen / TODOs

1. **focus_topic, will_learn, will_share**: Keine API-Route gefunden, die diese Felder schreibt. Werden sie verwendet?
2. **slots_article, slots_podcast, slots_quote**: Keine explizite Update-Route gefunden. Wie werden diese gesetzt?
3. **music_taste, lifestyle, interests**: Keine explizite Update-Route gefunden. Werden sie verwendet? (interests scheint eine separate Tabelle `user_interests` zu haben)
4. **focus_window**: Keine explizite Update-Route gefunden. Wird es verwendet?
5. **birth_date**: DB ist nullable (Migration 014), aber Onboarding API erzwingt NOT NULL. Das ist bewusst so designed:
   - DB erlaubt nullable für Profile, die noch im Erstellungsprozess sind
   - API erzwingt NOT NULL beim Onboarding (Validierung)
   - Nach Onboarding ist birth_date immer gesetzt (praktisch NOT NULL, aber DB erlaubt nullable für Flexibilität)
6. **guide_personality, daily_time_limit_minutes**: Werden diese Felder noch verwendet?

## Konsistenz-Regeln

1. **main_goal_id ↔ user_goals.is_primary**: Wenn `main_goal_id` gesetzt ist, muss ein entsprechendes Goal in `user_goals` mit `is_primary = true` existieren. Die Onboarding API stellt dies sicher.

2. **is_public ↔ bio**: Wenn `is_public = false`, sollte `bio` null sein (Observatory API implementiert dies bereits).

3. **birth_date**: Muss beim Onboarding gesetzt werden (API erzwingt NOT NULL), auch wenn DB nullable ist.

