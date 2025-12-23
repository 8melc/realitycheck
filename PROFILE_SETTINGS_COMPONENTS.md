# Profile Settings Page - Alle konfigurierbaren Komponenten

## 📋 Übersicht

Die Profile Settings Page ist in 4 Hauptbereiche unterteilt:

1. **Ziel & Leben** (`/user/settings/ziel`)
2. **Guide** (`/user/settings/guide`)
3. **Credits** (`/user/settings/credits`)
4. **Account** (`/user/settings/account`)

---

## 1. Ziel & Leben (`/user/settings/ziel`)

### 1.1 Aktuelles Ziel (`#ziel`)
- **Komponente:** `GoalModal`
- **Einstellungen:**
  - Ziel bearbeiten (Text-Input)
  - Ziel speichern
  - Ziel-Richtung: `balance` (Standard)

### 1.2 Interessen (`#interessen`)
- **Einstellungen:**
  - Neue Interesse hinzufügen (Text-Input)
  - Interessen anzeigen (Liste)
  - Interesse löschen (per Interesse)

### 1.3 Projekte (`#projekte`)
- **Einstellungen:**
  - Neues Projekt hinzufügen (Text-Input)
  - Projekte anzeigen (Liste mit Status & Priorität)
  - Projekt löschen (per Projekt)

---

## 2. Guide (`/user/settings/guide`)

### 2.1 Guide-Verhalten (`#guide-verhalten`)
- **Komponente:** `GuideSettings`

#### 2.1.1 Antwort-Länge
- **Optionen:**
  - `short` - Kurz (~250 Tokens) - Knappe, präzise Antworten
  - `medium` - Medium (~450 Tokens) - Ausgewogene Länge
  - `long` - Ausführlich (~800 Tokens) - Detaillierte, umfassende Antworten

#### 2.1.2 Guide-Ton
- **Optionen:**
  - `Soft Touch` - Sanft und ermutigend
  - `Straight` - Direkt und ehrlich
  - `Hard Truth` - Ungefiltert und klar

#### 2.1.3 Nudging-Frequenz
- **Optionen:**
  - `minimal` - Minimal (1 Nudge pro Tag)
  - `standard` - Standard (2-3 Nudges pro Tag - Empfohlen)
  - `frequent` - Häufig (3-4 Nudges pro Tag)

#### 2.1.4 Fokus-Zeit
- **Optionen:**
  - `morning` - Morgen (6:00 - 12:00 Uhr)
  - `afternoon` - Nachmittag (12:00 - 18:00 Uhr)
  - `evening` - Abend (18:00 - 22:00 Uhr)
  - `late_night` - Spät (22:00 - 6:00 Uhr)

#### 2.1.5 Nudging Pausieren
- **Einstellungen:**
  - Nudging für 24 Stunden pausieren
  - Nudging aktivieren (wenn pausiert)

### 2.2 Content-Filter (`#filter`)
- **Komponente:** `SlotManager`

#### 2.2.1 Slots pro Tag (Max. 12 gesamt)
- **Artikel pro Tag:**
  - Range: 0 - 12
  - Standard: 3
  - Beschreibung: "Für Tiefgang, nicht für Scrollen."

- **Podcasts pro Tag:**
  - Range: 0 - 12
  - Standard: 2
  - Beschreibung: "Für unterwegs. Kein Nebenbei-Gedudel."

- **Zitate pro Tag:**
  - Range: 0 - 12
  - Standard: 4
  - Beschreibung: "Kleine Hiebe statt Kalendersprüche."

### 2.3 Tageslimit (`#tageslimit`)
- **Komponente:** `UsageLimitSettings`

#### 2.3.1 Tageslimit aktivieren/deaktivieren
- **Toggle:** Ein/Aus

#### 2.3.2 Maximale Nutzungszeit pro Tag
- **Optionen:** 15-Minuten-Schritte
  - 15 Minuten bis 480 Minuten (8 Stunden)
  - Format: "X Stunde(n) Y Min" oder "X Minuten"
  - Standard: 60 Minuten (1 Stunde)

#### 2.3.3 Heute verbraucht
- **Anzeige:** Aktuelle Nutzungszeit (Stunden:Minuten)

#### 2.3.4 Re-Anmeldung
- **Hinweis:** Änderungen werden erst nach erneutem Anmelden aktiv
- **Button:** "Neu anmelden" (wenn Reauth erforderlich)

---

## 3. Credits (`/user/settings/credits`)

### 3.1 Aktueller Stand (`#aktueller-stand`)
- **Anzeige:** Verfügbare Credits (Zahl)
- **Nur Anzeige** (keine Einstellung)

### 3.2 Transaktions-Historie (`#transaktionen`)
- **Komponente:** `CreditHistory`
- **Einstellungen:**
  - Limit: 50 Transaktionen
  - Anzeige aller Credit-Transaktionen
- **Nur Anzeige** (keine Einstellung)

### 3.3 Credits-System (`#credits-system`)
- **Komponente:** `CreditsTable`
- **Nur Info** (keine Einstellung)

### 3.4 Credits kaufen (`#credits-kaufen`)
- **Komponente:** `CreditsPurchaseFlow`
- **Einstellungen:**
  - Credits-Pakete auswählen
  - Kaufprozess durchführen

---

## 4. Account (`/user/settings/account`)

### 4.1 Basis-Informationen (`#basis`)
- **Einstellungen:**
  - **Name:** Text-Input (display_name)
  - **E-Mail:** E-Mail-Input (email)
  - **E-Mail-Bestätigung:** Status-Anzeige (emailConfirmed)

### 4.2 Profilbild (`#profilbild`)
- **Komponente:** `AvatarSettings`

#### 4.2.1 Avatar-Typ
- **Optionen:**
  - `initials` - Initialen (Zeigt deine Initialen in farbigem Kreis)
  - `upload` - Eigenes Bild hochladen (JPG, PNG oder WEBP, max. 2MB)
  - `generated` - KI-generierter Avatar (Wähle aus verschiedenen Styles)

#### 4.2.2 Avatar-Style (nur bei `generated`)
- **Optionen:**
  - `avataaars` - Avataaars (Standard, Cartoon-Style)
  - `personas` - Personas (Minimalistisch)
  - `bottts` - Bottts (Roboter)
  - `micah` - Micah (Ilustrativ)
  - `lorelei` - Lorelei (Abstrakt)

#### 4.2.3 Bild hochladen (nur bei `upload`)
- **Einstellungen:**
  - Drag & Drop oder Klick zum Hochladen
  - Dateiformate: JPG, PNG, WEBP
  - Maximale Dateigröße: 2MB
  - Vorschau des hochgeladenen Bildes
  - Anderes Bild wählen
  - Bild löschen (wenn bereits hochgeladen)

#### 4.2.4 Neuer Avatar (nur bei `generated`)
- **Button:** "🎲 Neuer Avatar" (generiert neuen Seed)

### 4.3 Passwort ändern (`#passwort`)
- **Einstellungen:**
  - **Aktuelles Passwort:** Password-Input
  - **Neues Passwort:** Password-Input (min. 8 Zeichen)
  - **Passwort bestätigen:** Password-Input
  - Validierung: Passwörter müssen übereinstimmen

### 4.4 Account löschen (`#account-loeschen`)
- **Einstellungen:**
  - **Button:** "Account löschen"
  - **Bestätigung:** 2-stufig
    1. Confirm-Dialog: "Bist du sicher, dass du deinen Account löschen möchtest?"
    2. Prompt: Eingabe von "LÖSCHEN" erforderlich

---

## 📊 Datenbank-Felder Mapping

### `user_profiles` Tabelle:
- `display_name` - Name
- `email` - E-Mail (via auth.users)
- `avatar_type` - Avatar-Typ (initials, upload, generated)
- `avatar_url` - URL des hochgeladenen Bildes
- `avatar_style` - Avatar-Style (bei generated)
- `avatar_seed` - Seed für generierte Avatare
- `answer_style` - Antwort-Länge (short, medium, long)
- `guide_tone` - Guide-Ton (Soft Touch, Straight, Hard Truth)
- `focus_window` - Fokus-Zeit (morning, afternoon, evening, late_night)
- `nudging_frequency` - Nudging-Frequenz (minimal, standard, frequent)
- `nudging_paused_until` - Nudging-Pause bis Datum
- `slots_article` - Artikel-Slots (0-12)
- `slots_podcast` - Podcast-Slots (0-12)
- `slots_quote` - Zitate-Slots (0-12)
- `daily_limit_minutes` - Tageslimit in Minuten (via usage_limits Tabelle)

### `user_goals` Tabelle:
- `title` - Ziel-Text
- `is_primary` - Primäres Ziel

### `user_interests` Tabelle:
- `label` - Interesse-Text

### `user_projects` Tabelle:
- `title` - Projekt-Titel
- `status` - Projekt-Status
- `priority` - Priorität

---

## 🔄 API-Endpunkte

### Account:
- `GET /api/user/settings` - Account-Daten laden
- `PATCH /api/user/settings` - Account-Daten aktualisieren
- `DELETE /api/user/settings` - Account löschen

### Avatar:
- `PUT /api/profile/avatar` - Avatar-Einstellungen speichern
- `POST /api/profile/avatar/upload` - Bild hochladen
- `DELETE /api/profile/avatar/upload` - Bild löschen

### Guide:
- `GET /api/profile/guide-settings` - Guide-Einstellungen laden
- `PATCH /api/profile/guide-settings` - Guide-Einstellungen speichern

### Slots:
- Direkt via Supabase Client (`user_profiles` Update)

### Usage Limit:
- `GET /api/profile/usage-limit` - Limit laden
- `PATCH /api/profile/usage-limit` - Limit setzen

### Ziel:
- `POST /api/profile/onboarding` - Ziel speichern

### Interessen:
- `GET /api/profile/interests` - Interessen laden
- `POST /api/profile/interests` - Interesse hinzufügen
- `DELETE /api/profile/interests?id={id}` - Interesse löschen

### Projekte:
- `GET /api/profile/projects` - Projekte laden
- `POST /api/profile/projects` - Projekt hinzufügen
- `DELETE /api/profile/projects/{id}` - Projekt löschen

### Credits:
- `GET /api/profile/credits` - Credits laden
- `GET /api/profile/credits/history` - Transaktions-Historie

---

## ✅ Zusammenfassung

**Gesamt: 4 Hauptbereiche, 12 Sektionen, ~30 konfigurierbare Einstellungen**

1. **Ziel & Leben:** 3 Sektionen (Ziel, Interessen, Projekte)
2. **Guide:** 3 Sektionen (Verhalten, Content-Filter, Tageslimit)
3. **Credits:** 4 Sektionen (Stand, Historie, System, Kauf)
4. **Account:** 4 Sektionen (Basis-Info, Profilbild, Passwort, Löschen)

