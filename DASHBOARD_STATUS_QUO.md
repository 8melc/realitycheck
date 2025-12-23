# Dashboard Status Quo Analyse
## `/user/dashboard` - Backend-Verbindungen

**Datum:** Analyse basierend auf Codebase-Stand  
**Ziel:** Übersicht, welche Einstellungs-Bereiche bereits mit Backend verbunden sind vs. noch Dummy/Fake

---

## 1. Credits

**Status:** ❌ **NUR DUMMY / FEHLT BACKEND**

**Backend:**
- Tabelle `user_credits` existiert in `database.types.ts` (Spalten: `id`, `user_id`, `balance`, `created_at`, `updated_at`)
- **ABER:** Keine Verwendung im Dashboard-Code gefunden
- Keine API-Route `/api/profile/credits` oder ähnlich
- Keine Komponente, die Credits anzeigt oder lädt

**UI-Elemente:**
- Keine Credits-Sektion im aktuellen Dashboard sichtbar (nicht in `page.tsx` gefunden)

**Notiz:** Credits-Feature ist in der DB-Struktur vorbereitet, aber nicht im Frontend implementiert.

---

## 2. Profil & Ziel

**Status:** ✅ **VOLLSTÄNDIG MIT BACKEND VERDRAHTET**

**Backend:**
- **Tabelle:** `user_profiles`
  - Spalten: `display_name`, `birth_date`, `target_age`, `created_at`, `updated_at`
  - Wird gelesen: ✅ (Zeile 130-134 in `page.tsx`)
  - Wird gespeichert: ✅ (via `useProfileSettings` Hook → Supabase Update)
- **Tabelle:** `user_goals`
  - Spalten: `id`, `user_id`, `title`, `is_primary`, `status`, `created_at`, `updated_at`
  - Wird gelesen: ✅ (Zeile 205-210 in `page.tsx`)
  - Wird gespeichert: ✅ (Zeile 320-379 in `page.tsx` via `handleGoalSave`)

**API-Routen:**
- `/api/profile` (GET) - lädt Profil + Goal
- `/api/profile/onboarding` (POST) - erstellt/updated Profil

**UI-Elemente:**
- Name (`display_name`) - ✅ aus DB, ✅ speicherbar
- E-Mail (`identity.email`) - ✅ aus Supabase Auth, nur Anzeige
- Ziel (`primaryGoalTitle` / `user_goals.title`) - ✅ aus DB, ✅ speicherbar via GoalModal
- Life in Weeks (berechnet aus `birth_date` + `target_age`) - ✅ berechnet aus DB-Daten

**Notiz:** Vollständig funktional. Life in Weeks wird clientseitig aus `birth_date` und `target_age` berechnet.

---

## 3. Guide-Futter

**Status:** ✅ **MIT BACKEND VERDRAHTET** (teilweise)

**Backend:**
- **Tabelle:** `user_profiles`
  - Spalten: `focus_topic`, `will_learn` (string[]), `will_share` (string[]), `bio`
  - Wird gelesen: ✅ (Zeile 286-288 in `page.tsx`)
  - Wird gespeichert: ✅ (via `useProfileSettings` Hook → Supabase Update, Zeile 436-467)

**API-Routen:**
- Keine dedizierte API-Route, aber Update über direkten Supabase-Client-Call im Hook

**UI-Elemente:**
- **Fokus (Ziel):** ✅ aus `focus_topic`, ✅ speicherbar
- **Will lernen:** ✅ aus `will_learn` Array, ✅ speicherbar (Tag-Input)
- **Will teilen:** ✅ aus `will_share` Array, ✅ speicherbar (Tag-Input)
- **Bio:** ✅ aus `bio`, ✅ speicherbar (nicht im Overview sichtbar, aber im Profil-Editor)

**Notiz:** Alle drei Felder sind vollständig mit Backend verbunden und speicherbar.

---

## 4. Zeit-Profil

**Status:** ⚠️ **TEILWEISE VERDRAHTET**

**Backend:**
- **Tabelle:** `user_profiles`
  - Spalte: `guide_personality` (entspricht "Zeit-Philosophie")
  - Wird gelesen: ✅ (Zeile 247 in `page.tsx`)
  - Wird gespeichert: ❌ **NICHT SPEICHERBAR** (nur beim Onboarding, kein Update-Mechanismus im Dashboard)
- **Lebensstil:** ❌ **NUR DUMMY**
  - Keine DB-Spalte gefunden
  - Hardcoded als `{ optionId: 'default', label: 'Standard' }` (Zeile 252-254 in `page.tsx`)

**UI-Elemente:**
- **Zeit-Philosophie:** ✅ wird angezeigt, ❌ nicht editierbar im Dashboard
- **Lebensstil:** ❌ nur Platzhaltertext, keine DB-Verbindung

**Notiz:** Zeit-Philosophie wird aus DB gelesen, aber nicht im Dashboard bearbeitbar. Lebensstil ist komplett Dummy.

---

## 5. Energie-Feeds

**Status:** ❌ **NUR DUMMY / FEHLT BACKEND**

**Backend:**
- **Interessen:** ❌ Keine Tabelle `user_interests` gefunden
  - Im Code: `profile.interests` ist immer leeres Array `[]` (Zeile 256 in `page.tsx`)
  - Keine API-Route
- **Projekte:** ❌ Keine Tabelle `user_projects` gefunden
  - Im Code: `profile.projects` ist immer leeres Array `[]` (Zeile 257 in `page.tsx`)
  - Keine API-Route
- **Musik-DNA / Spotify:** ❌ Nur Frontend-State
  - `musicDNA.spotifyLinked` ist hardcoded `false` (Zeile 260)
  - `handleConnectSpotify` (Zeile 381-395) setzt nur lokalen State, keine DB-Speicherung
  - Keine Spotify-Integration oder DB-Tabelle
- **Matching:** ❌ Nur Platzhaltertext ("Kommt bald")

**UI-Elemente:**
- **Interessen:** ❌ nur Platzhaltertext "Noch keine Interessen hinterlegt"
- **Projekte:** ❌ nur Platzhaltertext "Noch keine Projekte definiert"
- **Musik-DNA:** ❌ Button "Spotify verbinden" funktioniert nur lokal, speichert nicht
- **Matching:** ❌ nur Info-Text, keine Funktionalität

**Notiz:** Komplett Dummy. Keine Backend-Struktur vorhanden.

---

## 6. Guide-Einstellungen

**Status:** ⚠️ **NUR LOCALSTORAGE, KEINE DB**

**Backend:**
- ❌ Keine DB-Tabellen für Guide-Einstellungen
- ❌ Keine API-Routen
- ✅ Nutzt `guideStore` (Zustand) mit `localStorage` Persistierung

**UI-Elemente:**
- **Ton-Kalibrierung** (`guideTone`: 'straight' | 'soft'): ✅ funktioniert, ❌ nur localStorage
- **Nudging-Frequenz** (`nudgingFrequency`: 'high' | 'medium' | 'low' | 'off'): ✅ funktioniert, ❌ nur localStorage
- **Guide aktivieren/deaktivieren** (`isGuideMuted`): ✅ funktioniert, ❌ nur localStorage

**Notiz:** Alle Einstellungen werden nur im Browser-LocalStorage gespeichert (`rc-guide-settings`), nicht in Supabase. Gehen bei Browser-Wechsel/Logout verloren.

---

## 7. Tageslimit

**Status:** ⚠️ **MOCK-BACKEND, KEINE ECHTE DB**

**Backend:**
- **Tabelle:** `user_profiles.daily_time_limit_minutes` existiert in DB-Types
- **ABER:** API-Route `/api/profile/usage-limit` nutzt `DemoUsageService` (Mock-In-Memory-Service)
  - Zeile 19 in `usage-limit/route.ts`: `DemoUsageService.getInstance()`
  - Keine echte DB-Verbindung
- **Tabelle:** `user_sessions` existiert (für Session-Tracking), wird aber nicht für Limits genutzt

**UI-Elemente:**
- **Checkbox "Tageslimit aktivieren":** ✅ funktioniert, ❌ speichert nur in Mock-Service
- **Dropdown für Minuten:** ✅ funktioniert, ❌ speichert nur in Mock-Service
- **Anzeige "Heute verbraucht":** ✅ funktioniert, ❌ berechnet nur aus Mock-Daten

**Notiz:** Feature ist UI-seitig fertig, aber Backend nutzt nur Demo-Service. Echte DB-Integration fehlt.

---

## 8. Slots pro Tag

**Status:** ⚠️ **UNSICHER - VERMUTLICH VERDRAHTET, ABER NICHT IN DB-TYPES**

**Backend:**
- **Tabelle:** `user_profiles` - Spalten `slots_article`, `slots_podcast`, `slots_quote`
  - ❌ **NICHT in `database.types.ts` definiert** (grep ergab keine Treffer)
  - ✅ **ABER:** Werden im Code verwendet:
    - `SlotManager.tsx` Zeile 48-50: liest aus `user_profiles` (slots_article, slots_podcast, slots_quote)
    - `SlotManager.tsx` Zeile 101-108: speichert in `user_profiles`
    - `guide/chat/route.ts` Zeile 47: liest slots aus Profil

**UI-Elemente:**
- **Artikel-Slider:** ✅ funktioniert, ✅ speichert (wenn DB-Spalten existieren)
- **Podcast-Slider:** ✅ funktioniert, ✅ speichert (wenn DB-Spalten existieren)
- **Zitate-Slider:** ✅ funktioniert, ✅ speichert (wenn DB-Spalten existieren)

**Notiz:** Code versucht, Slots zu speichern, aber Spalten fehlen in TypeScript-Definitionen. **UNSICHER - bitte manuell prüfen**, ob Spalten in Supabase existieren.

---

## 9. Guide Gespräche

**Status:** ⚠️ **TEILWEISE VERDRAHTET**

**Backend:**
- **Tabelle:** `guide_conversations` existiert in `database.types.ts`
  - Spalten: `id`, `user_id`, `role` ('user' | 'guide'), `message`, `created_at`
- **Tabelle:** `guide_logs` wird im Code verwendet (z.B. `guidePrompt.ts` Zeile 255), aber **NICHT in `database.types.ts` definiert**
- **API-Route:** `/api/guide/chat` (POST) - speichert in `guide_logs` (Zeile 260-268 in `chat/route.ts`)
- **ABER:** Dashboard zeigt nur Daten aus `useGuideState` (localStorage), **NICHT aus DB**

**UI-Elemente:**
- **Chat-History:** ❌ zeigt nur localStorage-Daten (`state.guidePrompts` aus `useGuideState`)
- Keine Abfrage von `guide_conversations` Tabelle im Dashboard

**Notiz:** Backend speichert Gespräche, aber Dashboard lädt sie nicht. **UNSICHER - bitte prüfen**, ob `guide_logs` Tabelle existiert (wird verwendet, aber nicht in Types).

---

## 10. Journey

**Status:** ❌ **NUR DUMMY / FEHLT BACKEND**

**Backend:**
- ❌ Keine Tabelle `user_journey` oder ähnlich gefunden
- ❌ Keine API-Route
- Im Code: `profile.journey` ist hardcoded Array mit einem Eintrag "Profil erstellt" (Zeile 268-270 in `page.tsx`)

**UI-Elemente:**
- **Timeline:** ❌ zeigt nur Dummy-Daten
- Keine echte Journey-Tracking-Logik

**Notiz:** Komplett Dummy. Keine Backend-Struktur vorhanden.

---

## 11. Aktionen / To-Dos

**Status:** ❌ **NUR LOCALSTORAGE, KEINE DB**

**Backend:**
- ❌ Keine Tabelle `user_actions` oder `user_todos` gefunden
- ❌ Keine API-Route
- ✅ Nutzt `useGuideState` Hook mit `localStorage` Persistierung

**UI-Elemente:**
- **Action Items:** ✅ funktioniert (Checkboxen, Reminder-Button), ❌ nur localStorage
- **Checkboxen:** ✅ funktionieren lokal, ❌ speichern nicht in DB

**Notiz:** Alle Aktionen werden nur im Browser-LocalStorage gespeichert, nicht in Supabase. Gehen bei Browser-Wechsel/Logout verloren.

---

## 12. Feedback & Impulse

**Status:** ❌ **NUR DUMMY / FEHLT BACKEND**

**Backend:**
- ❌ Keine Tabelle `user_feedback` oder `guide_feedback` gefunden
- ❌ Keine API-Route
- Im Code: `profile.feedback` ist hardcoded Array mit 2 Dummy-Einträgen (Zeile 271-284 in `page.tsx`), nur wenn `goalTitle` existiert

**UI-Elemente:**
- **Feedback-Liste:** ❌ zeigt nur Dummy-Daten
- Keine echte Feedback-Generierung oder -Speicherung

**Notiz:** Komplett Dummy. Keine Backend-Struktur vorhanden.

---

## Zusammenfassung

### ✅ Vollständig mit Backend verbunden:
1. **Profil & Ziel** (Name, E-Mail, Ziel, Life in Weeks)
2. **Guide-Futter** (Fokus, Will lernen, Will teilen, Bio)

### ⚠️ Teilweise verbunden / Unklar:
3. **Zeit-Profil** (Zeit-Philosophie: lesbar, nicht speicherbar; Lebensstil: Dummy)
4. **Tageslimit** (UI fertig, aber Mock-Backend)
5. **Slots pro Tag** (Code verwendet DB, aber Spalten nicht in Types - **UNSICHER**)
6. **Guide Gespräche** (Backend speichert, Dashboard lädt nicht)

### ❌ Nur Dummy / Fehlt Backend:
7. **Credits** (Tabelle existiert, aber keine UI/API)
8. **Energie-Feeds** (Interessen, Projekte, Musik-DNA, Matching)
9. **Guide-Einstellungen** (nur localStorage)
10. **Journey** (Timeline)
11. **Aktionen / To-Dos** (nur localStorage)
12. **Feedback & Impulse**

---

## Empfehlungen für manuelle Prüfung

1. **Slots-Spalten:** Prüfen, ob `user_profiles.slots_article`, `slots_podcast`, `slots_quote` in Supabase existieren (Code verwendet sie, Types fehlen)
2. **guide_logs Tabelle:** Prüfen, ob Tabelle existiert (wird in Code verwendet, aber nicht in Types)
3. **daily_time_limit_minutes:** Prüfen, ob echte DB-Integration gewünscht ist (aktuell nur Mock)


