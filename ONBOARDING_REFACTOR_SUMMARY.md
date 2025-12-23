# Onboarding Refactoring - Finale Zusammenfassung

## ✅ Durchgeführte Änderungen

### 1. Onboarding Steps reduziert

**VORHER:** 10 Steps
- intro, basics, focus, bio, zeit, goal, musik, lifestyle, interests, complete

**NACHHER:** 4 Steps
- intro, basics, goal, guide-style

### 2. AccessFormData Interface bereinigt

**VORHER:**
```typescript
{
  name, email, birthDate, targetAge,
  goal, goals[], goalDirection,
  timePhilosophy, musicTaste, lifestyle,
  interests[], focusTopic, bio
}
```

**NACHHER:**
```typescript
{
  name, email, birthDate, targetAge,
  goal, goalDirection,
  answerStyle: 'short' | 'medium' | 'long',
  guideTone: 'soft' | 'straight' | 'hard'
}
```

### 3. Steps angepasst

#### BasicsStep (`src/components/onboarding/steps/BasicsStep.tsx`)
- ✅ Email ist read-only (wird aus Auth geladen)
- ✅ Alle Felder sind required (name, birthDate, targetAge)
- ✅ Labels hinzugefügt

#### GoalStep (`src/components/onboarding/steps/GoalStep.tsx`)
- ✅ Nur noch goal ODER goalDirection (nicht beides)
- ✅ Wenn goal eingegeben wird → goalDirection wird zurückgesetzt
- ✅ Wenn goalDirection gewählt wird → goal wird zurückgesetzt
- ✅ Goal-Chips entfernt (nur noch freier Text oder Richtung)

#### GuideStyleStep (`src/components/onboarding/steps/GuideStyleStep.tsx`) - NEU
- ✅ Antwort-Länge: short | medium | long
- ✅ Guide-Ton: soft | straight | hard

### 4. API Route angepasst (`src/app/api/profile/onboarding/route.ts`)

**Nur noch erlaubte Felder werden geschrieben:**
```typescript
{
  display_name: string,
  birth_date: string, // NIEMALS NULL
  target_age: number,
  goal_direction: string | null,
  answer_style: 'short' | 'medium' | 'long',
  guide_tone: 'Soft Touch' | 'Straight' | 'Hard Truth',
  updated_at: string
}
```

**Validierungen:**
- ✅ name muss vorhanden sein
- ✅ birth_date muss vorhanden sein (niemals NULL)
- ✅ target_age muss zwischen 18-120 sein
- ✅ Entweder goal ODER goalDirection (nicht beides)
- ✅ answer_style muss short/medium/long sein
- ✅ guide_tone muss soft/straight/hard sein

**Mapping:**
- `guide_tone` wird gemappt: `soft` → `Soft Touch`, `straight` → `Straight`, `hard` → `Hard Truth`

**Entfernt:**
- ❌ bio, focus_topic, guide_personality, lifestyle, music_taste, interests
- ❌ will_learn, will_share
- ❌ Defaults für focus_window, nudging_frequency, slots

### 5. Validierung angepasst

**Nur noch für erlaubte Steps:**
- `basics`: name, email, birthDate, targetAge müssen vorhanden sein
- `goal`: goal.trim() ODER goalDirection muss vorhanden sein
- `guide-style`: answerStyle und guideTone müssen vorhanden sein

---

## 📋 Finale Onboarding-Step-Liste

1. **Intro** (`intro`)
   - Willkommens-Screen
   - Keine Eingabe

2. **Identität** (`basics`)
   - **display_name** (Pflicht)
   - **email** (read-only aus Auth)
   - **birth_date** (Pflicht)
   - **target_age** (Pflicht, 18-120)

3. **Ziel** (`goal`)
   - **ENTWEDER:** `goal` (freier Text) → wird in `user_goals` als primary goal gespeichert
   - **ODER:** `goal_direction` (Enum: freedom/clarity/growth/balance/meaning) → wird in `user_profiles.goal_direction` gespeichert

4. **Guide-Grundstil** (`guide-style`)
   - **answer_style** (short/medium/long) → `user_profiles.answer_style`
   - **guide_tone** (soft/straight/hard) → `user_profiles.guide_tone` (gemappt zu Soft Touch/Straight/Hard Truth)

---

## 🔄 Exaktes Feld-Mapping

### UI → API → Database

| UI Feld | API Parameter | DB Tabelle | DB Spalte | Datentyp | Validierung |
|---------|---------------|------------|-----------|----------|-------------|
| `name` | `name` | `user_profiles` | `display_name` | `text` | Pflicht, nicht leer |
| `email` | `email` | `auth.users` | `email` | `text` | Read-only aus Auth |
| `birthDate` | `birthDate` | `user_profiles` | `birth_date` | `date` | Pflicht, niemals NULL |
| `targetAge` | `targetAge` | `user_profiles` | `target_age` | `integer` | Pflicht, 18-120 |
| `goal` | `goal` | `user_goals` | `title` | `text` | Optional (wenn goalDirection nicht gesetzt) |
| `goalDirection` | `goalDirection` | `user_profiles` | `goal_direction` | `enum` | Optional (wenn goal nicht gesetzt) |
| `answerStyle` | `answerStyle` | `user_profiles` | `answer_style` | `enum` | Pflicht: short/medium/long |
| `guideTone` | `guideTone` | `user_profiles` | `guide_tone` | `text` | Pflicht: soft→Soft Touch, straight→Straight, hard→Hard Truth |

---

## 📝 Code-Stellen, die angepasst wurden

### 1. `src/components/onboarding/AccessOnboarding.tsx`
- ✅ Steps-Array reduziert (10 → 4)
- ✅ AccessFormData Interface bereinigt
- ✅ Prefill-Logik angepasst (nur erlaubte Felder)
- ✅ nextStep() angepasst (nur erlaubte Felder an API senden)
- ✅ validateCurrentStep() angepasst (nur erlaubte Steps)
- ✅ renderStepContent() angepasst (nur erlaubte Steps)

### 2. `src/components/onboarding/steps/BasicsStep.tsx`
- ✅ Email read-only gemacht
- ✅ Labels hinzugefügt
- ✅ Alle Felder required

### 3. `src/components/onboarding/steps/GoalStep.tsx`
- ✅ Goal-Chips entfernt
- ✅ Nur noch goal ODER goalDirection
- ✅ Gegenseitiges Zurücksetzen implementiert

### 4. `src/components/onboarding/steps/GuideStyleStep.tsx` - NEU
- ✅ Komponente erstellt
- ✅ answer_style Auswahl
- ✅ guide_tone Auswahl

### 5. `src/app/api/profile/onboarding/route.ts`
- ✅ Body-Parsing bereinigt (nur erlaubte Felder)
- ✅ Validierung erweitert
- ✅ updateData bereinigt (nur erlaubte Felder)
- ✅ guide_tone Mapping hinzugefügt
- ✅ Alle nicht-erlaubten Felder entfernt

---

## ✅ Akzeptanzkriterien

### Nach Onboarding:

1. ✅ **Name steht korrekt im Header & People**
   - `display_name` wird korrekt gespeichert
   - Kein "FYF User" Fallback mehr (außer beim initialen upsert)

2. ✅ **Ziel oder Zielrichtung ist gesetzt**
   - Entweder `goal` in `user_goals` als primary goal
   - Oder `goal_direction` in `user_profiles`

3. ✅ **Guide antwortet sofort im gewählten Stil**
   - `answer_style` wird gespeichert
   - `guide_tone` wird gespeichert und gemappt
   - Guide Chat Route lädt diese Settings

4. ✅ **Kein "FYF User"-Fallback mehr**
   - `display_name` ist Pflicht im Onboarding
   - API validiert, dass name vorhanden ist
   - Nur beim initialen upsert wird "FYF User" verwendet (wird sofort überschrieben)

---

## 🚨 Wichtige Hinweise

1. **birth_date ist NIEMALS NULL**
   - Validierung in API stellt sicher, dass birth_date vorhanden ist
   - Initialer upsert ohne birth_date ist OK (wird sofort im Update gesetzt)

2. **goal vs. goalDirection**
   - API validiert: Entweder goal ODER goalDirection, nicht beides
   - Wenn goal gesetzt → wird in `user_goals` gespeichert
   - Wenn goalDirection gesetzt → wird in `user_profiles.goal_direction` gespeichert

3. **guide_tone Mapping**
   - UI verwendet: `soft`, `straight`, `hard`
   - DB speichert: `Soft Touch`, `Straight`, `Hard Truth`
   - Mapping erfolgt in API Route

4. **Entfernte Steps**
   - Alle Step-Komponenten (FocusStep, BioStep, etc.) bleiben im Code, werden aber nicht mehr verwendet
   - Können später gelöscht werden, wenn nicht mehr benötigt

---

## 📦 Nächste Schritte (Optional)

1. Entfernte Step-Komponenten löschen (wenn nicht mehr benötigt)
2. Tests schreiben für neue Validierungen
3. Migration prüfen: `birth_date` sollte nullable sein (wird aber im Onboarding immer gesetzt)

