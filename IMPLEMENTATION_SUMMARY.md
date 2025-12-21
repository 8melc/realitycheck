# Implementation Summary - Session Tracking & Tageslimit

## Letzte Änderungen (2025-12-20)

### birth_date Constraint entschärft

**Problem:** 
Die `user_profiles.birth_date` Spalte war als NOT NULL definiert, was dazu führte, dass Profile nicht angelegt werden konnten, ohne dass ein Geburtsdatum angegeben wurde.

**Lösung:**
Die NOT NULL Constraint wurde entfernt, sodass `birth_date` nun optional ist.

**DB-Migration (in Supabase ausführen):**
```sql
ALTER TABLE user_profiles
  ALTER COLUMN birth_date DROP NOT NULL;

COMMENT ON COLUMN user_profiles.birth_date IS 'Optional: Geburtsdatum des Nutzers. Kann NULL sein, wenn noch nicht angegeben.';
```

**Auswirkungen:**
- Profile können jetzt angelegt werden, auch wenn das Geburtsdatum noch nicht bekannt ist
- Onboarding-Flow ist flexibler
- API-Routen behandeln `birth_date` als optional
- TypeScript-Typen zeigen bereits `birth_date?: string | null` (nullable)

**Betroffene Dateien:**
- ✅ `src/lib/types/database.types.ts` - `birth_date: string | null` (bereits nullable)
- ✅ `src/app/api/profile/usage-limit/route.ts` - Erstellt Profile ohne `birth_date`
- ✅ `src/app/api/profile/route.ts` - Behandelt `birth_date` als optional
- ✅ `src/app/api/profile/onboarding/route.ts` - Setzt `birth_date` explizit auf `null` wenn nicht vorhanden

**Testing-Hinweise:**
- Teste das Erstellen eines Profils ohne `birth_date`
- Prüfe, dass die Life-in-Weeks-View nur angezeigt wird, wenn `birth_date` gesetzt ist
- Teste, dass Tageslimit auch ohne vollständiges Onboarding funktioniert

---

## Datenbank-Schema

### `user_profiles` Tabelle
- **`birth_date`**: `timestamptz | null` (nullable)
  - **Wichtig**: In der aktuellen Version ist `birth_date` **optional** (nullable)
  - Profile können ohne Geburtsdatum angelegt werden
  - Wird später im Onboarding-Flow ergänzt
  - **Supabase Migration erforderlich**:
    ```sql
    ALTER TABLE user_profiles
      ALTER COLUMN birth_date DROP NOT NULL;
    ```

- **`daily_time_limit_minutes`**: `integer | null`
  - Tageslimit in Minuten (15-480, 15er Schritte)
  - `null` = kein Limit gesetzt

### `user_sessions` Tabelle
- `id`: uuid (PK)
- `user_id`: uuid (FK zu auth.users)
- `session_start`: timestamptz (default now())
- `session_end`: timestamptz | null
- `duration_minutes`: integer | null (wird beim Beenden berechnet)

### `user_credits` Tabelle
- `balance`: integer (Credits-Balance)
- Wird für Limit-Override verwendet (1 Credit = 1 Override)

## API-Routen

### `GET /api/profile/usage-limit`
- Liest `daily_time_limit_minutes` aus `user_profiles`
- Summiert alle `user_sessions` von heute
- Berechnet `limitReached = todayUsageMinutes >= dailyLimitMinutes`
- **Robust**: Nutzt `maybeSingle()` - funktioniert auch wenn kein Profil existiert

### `PATCH /api/profile/usage-limit`
- **Robust**: Erstellt Profil, falls keines existiert
- Setzt `daily_time_limit_minutes` (ohne `birth_date` zu benötigen)
- Funktioniert auch für User ohne vollständiges Onboarding

### `POST /api/profile/session/start`
- Erstellt neue Session in `user_sessions`
- Keine Profil-Prüfung erforderlich
- Funktioniert für alle authentifizierten User

### `POST /api/profile/session/end`
- Beendet offene Session
- Berechnet `duration_minutes`
- Keine Profil-Prüfung erforderlich

### `POST /api/profile/override-limit`
- Zieht 1 Credit aus `user_credits` ab
- Erlaubt User, Tageslimit zu überschreiben
- Erstellt Credits-Eintrag, falls keiner existiert

## Frontend-Komponenten

### `useUsageLimit` Hook
- Rate-limited: Max alle 60 Sekunden
- Minimum 30 Sekunden zwischen Calls
- Verhindert parallele Requests

### `UsageBadge` Komponente
- Zeigt "HEUTE: X / Y Min" oder nur "X Min"
- Farben: Grün (normal), Orange (>80%), Rot (Limit erreicht)

### `LimitReachedModal` (Guide)
- Erscheint automatisch bei `limitReached === true`
- Buttons: "Jetzt abmelden" / "Trotzdem weiter"

### `SessionLimitOverlay` (Feedboard - Stoppschild)
- Erscheint bei `limitReached === true`
- Buttons: "Schmeiß mich raus" / "Grenze lockern, neue Session" (kostet Credits)

## Wichtige Design-Entscheidungen

### Kein Guest-Mode
- **Alle User müssen authentifiziert sein**
- Jeder User bekommt automatisch ein `user_profiles`-Profil (auch minimal)
- `birth_date` ist optional - wird später im Onboarding ergänzt
- Alle Features (Sessions, Tageslimit, Credits) funktionieren ohne vollständiges Onboarding

### Profil-Erstellung
- Profile werden automatisch erstellt, wenn:
  - User Tageslimit setzt (`PATCH /api/profile/usage-limit`)
  - User Onboarding abschließt (`POST /api/profile/onboarding`)
- Minimales Profil: `user_id`, `display_name` (aus Email), `daily_time_limit_minutes` (optional)

### Session-Tracking
- Startet automatisch beim App-Start (via `SessionTrackerProvider`)
- Wird auch in `UsageLimitSettings` initialisiert
- Beendet automatisch bei:
  - Tab-Close (via `beforeunload` + `sendBeacon`)
  - 30 Min Inaktivität
  - Manueller Logout

## Migration-Checkliste

- [ ] `ALTER TABLE user_profiles ALTER COLUMN birth_date DROP NOT NULL;` in Supabase ausführen
- [ ] Test-User `melissa@test.com` hat `user_profiles`-Eintrag mit `daily_time_limit_minutes = 60`
- [ ] Test-User hat `user_credits`-Eintrag mit `balance > 0` (für Override-Test)

## Code-Status

### ✅ Keine Guest-Logik
- Keine Guest-Checks im Code gefunden
- Alle Routen gehen von authentifizierten Usern aus

### ✅ Robuste Profil-Erstellung
- `PATCH /api/profile/usage-limit` erstellt Profil automatisch, falls keines existiert
- `birth_date` wird **nicht** gesetzt (bleibt null)
- Funktioniert auch ohne vollständiges Onboarding

### ✅ Session-Routen
- `POST /api/profile/session/start` - Keine Profil-Prüfung
- `POST /api/profile/session/end` - Keine Profil-Prüfung
- Funktionieren für alle authentifizierten User

### ✅ Credits-Override
- `POST /api/profile/override-limit` erstellt Credits-Eintrag, falls keiner existiert
- Keine Profil-Prüfung erforderlich

### ✅ Session-Cap & Zeitzonen-Logik
- **Cap pro Session**: Max 1440 Minuten (24h) pro Session verhindert Outliers
- **UTC-basierte Berechnung**: "Heute" wird in UTC berechnet, um Zeitzonen-Probleme zu vermeiden
- **Robuste Filterung**: Nur Sessions von heute (UTC) werden gezählt
- Verhindert, dass alte/kaputte Sessions die Berechnung verfälschen

### ✅ Credit-System (2025-01-20)
- **Zentrale `chargeCredits` Utility**: Alle Credit-Operationen laufen durch eine gemeinsame Funktion
  - Prüft aktuellen Credit-Stand
  - Validiert ausreichende Credits
  - Zieht Credits ab
  - Schreibt Transaktion in `credit_history`
- **Credit-Historie Tabelle**: `credit_history` speichert alle Transaktionen (earned, spent, purchased)
  - Migration: `db/migrations/006_add_credit_history.sql`
  - Felder: `amount`, `balance_after`, `reason`, `meta` (JSONB)
- **Standardisierte API-Responses**:
  - Erfolg: `{ ok: true, credits: { cost, new_balance, message } }`
  - Fehler: `{ ok: false, error: 'INSUFFICIENT_CREDITS', credits: { balance, required, message } }`
- **Frontend-Komponenten**:
  - `InsufficientCreditsModal`: Zeigt Modal bei zu wenig Credits
  - `CreditToast`: Toast-Benachrichtigung bei erfolgreichem Credit-Abzug
  - `CreditHistory`: Historie-Komponente für Dashboard
- **Refactored Routes**:
  - `POST /api/profile/override-limit`: Nutzt jetzt `chargeCredits` Utility
  - `GET /api/credits/history`: Neue Route für Credit-Historie
- **Integration**: Feedboard nutzt neue Komponenten für Credit-Feedback
