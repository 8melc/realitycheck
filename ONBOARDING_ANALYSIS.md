# Onboarding-Prozess Analyse & Implementierung

## A) Onboarding-Steps + Felder

### Onboarding-Flow (10 Steps)

1. **Intro** (`intro`)
   - Keine Felder

2. **Basics** (`basics`)
   - `name` (string)
   - `email` (string)
   - `birthDate` (string, date format)
   - `targetAge` (string, number)

3. **Focus** (`focus`)
   - `focusTopic` (string)

4. **Bio** (`bio`)
   - `bio` (string, max 280 chars)

5. **Zeit-Philosophie** (`zeit`)
   - `timePhilosophy` (string, one of: 'dividende', 'wirkung', 'limitiert', 'balance', 'no-waste')

6. **Goal** (`goal`)
   - `goal` (string, freetext)
   - `goals` (string[], array of selected chips)
   - `goalDirection` ('freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null)

7. **Musik-DNA** (`musik`)
   - `musicTaste` (string, one of: 'electronic', 'hiphop', 'rock', 'jazz', 'classical', 'ambient', 'pop', 'indie')

8. **Lifestyle** (`lifestyle`)
   - `lifestyle` (string, one of: 'digital-nomad', 'remote-worker', 'office-player', 'hybrid', 'creator', 'sidepreneur', 'explorer', 'caretaker', 'teamplayer', 'rebel', 'family-flow', 'minimalist', 'old-school')

9. **Interessen** (`interests`)
   - `interests` (string[], array of selected interests)

10. **Complete** (`complete`)
    - Keine Felder (nur Anzeige)

### API-Route
- **POST** `/api/profile/onboarding`
- Speichert am Ende von Step 9 (interests)

---

## B) Mapping-Tabelle: UI → Supabase

| UI-Feldname | Supabase Tabelle | Supabase Spalte | Datentyp | Quelle | Status |
|------------|------------------|-----------------|----------|--------|--------|
| `name` | `user_profiles` | `display_name` | string | Onboarding | ✅ Gespeichert |
| `email` | `auth.users` | `email` | string | Onboarding | ⚠️ Nicht in onboarding route |
| `birthDate` | `user_profiles` | `birth_date` | date | Onboarding | ✅ Gespeichert |
| `targetAge` | `user_profiles` | `target_age` | number | Onboarding | ✅ Gespeichert |
| `focusTopic` | `user_profiles` | `focus_topic` | string | Onboarding | ✅ Gespeichert |
| `bio` | `user_profiles` | `bio` | string | Onboarding | ✅ Gespeichert |
| `timePhilosophy` | `user_profiles` | `guide_personality` | string | Onboarding | ✅ Gespeichert (als guide_personality) |
| `goal` | `user_goals` | `title` | string | Onboarding | ✅ Gespeichert (als primary goal) |
| `goals` | `user_goals` | `title` | string[] | Onboarding | ⚠️ Nur erstes Goal wird gespeichert |
| `goalDirection` | `user_profiles` | `goal_direction` | enum | Onboarding | ✅ Gespeichert |
| `musicTaste` | `user_profiles` | ❌ FEHLT | string | Onboarding | ❌ NICHT gespeichert |
| `lifestyle` | `user_profiles` | ❌ FEHLT | string | Onboarding | ❌ NICHT gespeichert |
| `interests` | `user_profiles` | ❌ FEHLT | string[] | Onboarding | ❌ NICHT gespeichert |
| `answer_style` | `user_profiles` | `answer_style` | 'short'\|'medium'\|'long' | Settings | ❌ Nicht im Onboarding |
| `guide_tone` | `user_profiles` | `guide_tone` | 'Soft Touch'\|'Straight'\|'Hard Truth' | Settings | ❌ Nicht im Onboarding |
| `focus_window` | `user_profiles` | `focus_window` | 'morning'\|'afternoon'\|'evening'\|'late_night' | Settings | ❌ Nicht im Onboarding |
| `nudging_frequency` | `user_profiles` | `nudging_frequency` | 'minimal'\|'standard'\|'frequent' | Settings | ❌ Nicht im Onboarding |
| `slots_article` | `user_profiles` | `slots_article` | number | Settings | ❌ Nicht im Onboarding |
| `slots_podcast` | `user_profiles` | `slots_podcast` | number | Settings | ❌ Nicht im Onboarding |
| `slots_quote` | `user_profiles` | `slots_quote` | number | Settings | ❌ Nicht im Onboarding |

---

## C) Abweichungen (Bug-/Gap-Liste)

### ❌ Kritische Lücken

1. **Onboarding speichert `musicTaste` nicht**
   - Feld wird erfasst, aber nicht an API gesendet
   - Kein DB-Feld vorhanden (muss hinzugefügt werden oder in JSON-Feld)

2. **Onboarding speichert `lifestyle` nicht**
   - Feld wird erfasst, aber nicht an API gesendet
   - Kein DB-Feld vorhanden (muss hinzugefügt werden oder in JSON-Feld)

3. **Onboarding speichert `interests` nicht**
   - Feld wird erfasst, aber nicht an API gesendet
   - Kein DB-Feld vorhanden (muss hinzugefügt werden oder in JSON-Feld)

4. **Guide-Settings fehlen im Onboarding**
   - `answer_style`, `guide_tone`, `focus_window`, `nudging_frequency` werden nicht gesetzt
   - Defaults sollten im Onboarding gesetzt werden

5. **Content-Slots fehlen im Onboarding**
   - `slots_article`, `slots_podcast`, `slots_quote` werden nicht gesetzt
   - Defaults sollten im Onboarding gesetzt werden

6. **Kein Prefill beim Reload**
   - Onboarding lädt keine existierenden Daten beim erneuten Öffnen
   - User muss alles neu eingeben

### ⚠️ Warnungen

7. **Guide Settings API verwendet falsche Feldnamen**
   - `/api/profile/guide-settings` verwendet `guide_nudging_frequency` statt `nudging_frequency`
   - `/api/profile/guide-settings` verwendet `guide_muted` (existiert nicht in DB)

8. **Mehrere Goals werden nicht gespeichert**
   - Nur das erste Goal aus `goals` Array wird als primary goal gespeichert
   - Restliche Goals gehen verloren

9. **Email wird nicht validiert/gespeichert**
   - Email wird im Onboarding erfasst, aber nicht in der API-Route verwendet

---

## D) Guide-Integration: Wirksamkeit

### ✅ Wirksam im Guide (aus `src/app/api/guide/chat/route.ts`)

| Setting | DB-Feld | Prompt-Context | Operationalisiert | Status |
|---------|---------|----------------|-------------------|--------|
| `answer_style` | `answer_style` | `state.answerLength` | ✅ Ja (Zeilen-Limits: 6-8/10-14/16-24) | ✅ Wirksam |
| `guide_tone` | `guide_tone` | `state.tone` | ✅ Ja (Soft Touch/Straight/Hard Truth) | ✅ Wirksam |
| `focus_window` | `focus_window` | `state.focusTime` | ✅ Ja (Zeitfenster-Check) | ✅ Wirksam |
| `nudging_frequency` | `nudging_frequency` | `state.nudgingFrequency` | ⚠️ Im Prompt, aber nicht operationalisiert | ⚠️ Teilweise |
| `slots_article` | `slots_article` | `slots.article.available` | ✅ Ja (Content-Eligibility) | ✅ Wirksam |
| `slots_podcast` | `slots_podcast` | `slots.podcast.available` | ✅ Ja (Content-Eligibility) | ✅ Wirksam |
| `slots_quote` | `slots_quote` | `slots.quote.available` | ✅ Ja (Content-Eligibility) | ✅ Wirksam |
| `focus_topic` | `focus_topic` | `profile.focus_topic` | ✅ Ja (im Prompt-Context) | ✅ Wirksam |
| `display_name` | `display_name` | `profile.name` | ✅ Ja (im Prompt-Context) | ✅ Wirksam |
| `primary_goal` | `user_goals.title` | `profile.primary_goal` | ✅ Ja (im Prompt-Context) | ✅ Wirksam |

### ❌ Gespeichert aber ohne Effekt

- `guide_personality` - wird gespeichert, aber nicht im Guide verwendet (nur `guide_tone` wird verwendet)
- `bio` - wird gespeichert, aber nicht im Guide-Prompt verwendet
- `will_learn`, `will_share` - werden gespeichert, aber nicht im Guide-Prompt verwendet

---

## E) Soll-Zustand

### Onboarding soll setzen:

1. **User-Profile Basis:**
   - ✅ `display_name`, `birth_date`, `target_age`
   - ✅ `focus_topic`, `bio`
   - ✅ `goal_direction`
   - ❌ `musicTaste` → **NEU:** `music_taste` (string)
   - ❌ `lifestyle` → **NEU:** `lifestyle` (string)
   - ❌ `interests` → **NEU:** `interests` (string[])

2. **Guide-Settings (Defaults):**
   - ❌ `answer_style` → Default: `'medium'`
   - ❌ `guide_tone` → Default: `'Straight'`
   - ❌ `focus_window` → Default: `'evening'`
   - ❌ `nudging_frequency` → Default: `'standard'`

3. **Content-Slots (Defaults):**
   - ❌ `slots_article` → Default: `3`
   - ❌ `slots_podcast` → Default: `2`
   - ❌ `slots_quote` → Default: `4`

4. **Goals:**
   - ✅ Primary Goal wird gespeichert
   - ⚠️ Weitere Goals könnten als non-primary gespeichert werden (optional)

5. **Prefill:**
   - ❌ Beim Reload sollten existierende Daten geladen werden

---

## F) Implementierungs-Plan

### Schritt 1: DB-Migration für fehlende Felder
- `music_taste` (text, nullable)
- `lifestyle` (text, nullable)
- `interests` (text[], nullable)

### Schritt 2: Onboarding API erweitern
- `musicTaste` → `music_taste`
- `lifestyle` → `lifestyle`
- `interests` → `interests`
- Guide-Settings Defaults setzen
- Content-Slots Defaults setzen

### Schritt 3: Onboarding UI erweitern
- Payload erweitern (musicTaste, lifestyle, interests)
- Prefill-Logik hinzufügen (beim Mount Profile laden)

### Schritt 4: Guide Settings API fixen
- `guide_nudging_frequency` → `nudging_frequency`
- `guide_muted` entfernen (existiert nicht)

### Schritt 5: Profile Fetch erweitern
- Alle neuen Felder selektieren
- Guide-Settings beim Laden inkludieren

---

## G) Test-Checkliste

### ✅ Onboarding-Flow

1. **Neuen User onboarden:**
   - [ ] Alle 10 Steps durchlaufen
   - [ ] Alle Felder ausfüllen (name, email, birthDate, targetAge, focusTopic, bio, timePhilosophy, goal, goalDirection, musicTaste, lifestyle, interests)
   - [ ] Am Ende speichern
   - [ ] Prüfen: Alle Werte in Supabase `user_profiles` vorhanden?
   - [ ] Prüfen: Primary Goal in `user_goals` vorhanden?
   - [ ] Prüfen: Guide-Settings Defaults gesetzt?
   - [ ] Prüfen: Content-Slots Defaults gesetzt?

2. **Reload-Test:**
   - [ ] Onboarding-Seite neu laden (nach Speichern)
   - [ ] Prüfen: Werte werden aus DB geladen und angezeigt (Prefill)
   - [ ] Änderungen vornehmen und erneut speichern
   - [ ] Prüfen: Änderungen werden gespeichert

### ✅ Guide-Integration

3. **Guide-Settings wirksam:**
   - [ ] Guide-Ton ändern (Settings-Page) → `'Soft Touch'` setzen
   - [ ] Guide-Chat öffnen und Nachricht senden
   - [ ] Prüfen: Antwort hat weicheren Ton (weniger direkt)
   - [ ] Guide-Ton auf `'Hard Truth'` ändern
   - [ ] Neue Nachricht senden
   - [ ] Prüfen: Antwort ist direkter/härter

4. **Antwort-Länge wirksam:**
   - [ ] `answer_style` auf `'short'` setzen
   - [ ] Guide-Chat: Nachricht senden
   - [ ] Prüfen: Antwort ist kurz (6-8 Zeilen)
   - [ ] `answer_style` auf `'long'` setzen
   - [ ] Neue Nachricht senden
   - [ ] Prüfen: Antwort ist länger (16-24 Zeilen)

5. **Fokus-Zeit wirksam:**
   - [ ] `focus_window` auf `'morning'` setzen
   - [ ] Guide-Chat außerhalb des Fensters (z.B. Abend) öffnen
   - [ ] Nachricht senden
   - [ ] Prüfen: Keine Content-Empfehlung (außerhalb des Fensters)
   - [ ] `focus_window` auf `'evening'` setzen
   - [ ] Guide-Chat im Fenster (Abend) öffnen
   - [ ] Nachricht senden (nach 3+ Turns)
   - [ ] Prüfen: Content-Empfehlung möglich (wenn eligible)

6. **Content-Slots wirksam:**
   - [ ] `slots_article` auf `0` setzen
   - [ ] Guide-Chat: Nachricht mit Content-Anfrage senden
   - [ ] Prüfen: Keine Artikel-Empfehlung
   - [ ] `slots_article` auf `3` setzen
   - [ ] Neue Nachricht senden
   - [ ] Prüfen: Artikel-Empfehlung möglich

### ✅ Console-Logs

7. **Debug-Logs prüfen:**
   - [ ] Guide Chat Route: Console zeigt aktive Settings pro Request
   - [ ] Format: `[Guide Settings] { tone, answerLength, nudgingFrequency, focusTime, inFocusWindow, contentEligible, max_output_tokens }`

