# Tageslimit/Nutzungsdauer Feature - Dokumentation

## Übersicht

Das Tageslimit-Feature ermöglicht es Benutzern, ein tägliches Zeitlimit für ihre FYF-Nutzung zu setzen. Das System überwacht die Nutzungszeit, zeigt Warnungen an und erzwingt ein Logout, wenn das Limit erreicht wird.

**Hinweis für MVP/Demo:** Diese Implementierung nutzt einen `DemoUsageService` mit localStorage als Datenspeicher. Für die Produktion sollte eine echte PostgreSQL-Datenbank verwendet werden.

## Architektur

### Backend (Next.js API Routes)

#### Demo-Service (MVP)
Für die Demo-Version wird ein `DemoUsageService` verwendet, der Daten im Browser localStorage speichert:

```typescript
// /src/lib/demoUsageService.ts
interface DemoUsageState {
  dailyLimitMinutes: number | null;
  lastLimitUpdateAt: string | null;
  requiresReauth: boolean;
  sessionUsage: Record<string, SessionData>;
  updatedAt: string;
}
```

#### Datenbank-Schema (Produktion)

**Tabelle: `session_usage`**
```sql
CREATE TABLE session_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consumed_minutes INTEGER NOT NULL DEFAULT 0,
    limit_reached_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**User-Tabelle Erweiterungen:**
```sql
ALTER TABLE users ADD COLUMN daily_usage_limit_minutes INTEGER;
ALTER TABLE users ADD COLUMN last_limit_update_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN requires_reauth BOOLEAN DEFAULT FALSE;
```

#### API-Endpunkte

**GET `/api/profile/usage-limit`**
- Liefert aktuelles Limit und Tagesverbrauch
- Response: `UsageLimitResponse`

**PUT `/api/profile/usage-limit`**
- Setzt neues Tageslimit
- Validierung: 15-480 Minuten, 15er Schritte
- Setzt `requires_reauth = true`
- Response: `UsageLimitResponse`

**POST `/api/session/usage`**
- Heartbeat für Session-Tracking
- Aktualisiert `session_usage`
- Response: `SessionHeartbeatResponse`

**POST `/api/auth/logout`**
- Beendet Session
- Setzt `requires_reauth = false`
- Löscht Session-Daten

### Frontend (React + Zustand)

#### State Management

**`useUsageStore`** - Zustand Store für Usage Limit
- `dailyLimitMinutes`: Aktuelles Tageslimit
- `todayUsageMinutes`: Heutiger Verbrauch
- `requiresReauth`: Re-Authentifizierung erforderlich
- `limitReached`: Limit erreicht
- Actions: `setLimit`, `fetchUsageData`, `updateUsage`

#### Session Timer Hook

**`useSessionTimer`** - Timer-Hook mit Features:
- Startet bei Mount, tickt alle 30 Sek
- Page Visibility API (pausiert im Hintergrund)
- Heartbeat-Synchronisation mit Backend
- BroadcastChannel für Multi-Tab-Sync
- Warnungen bei 80% und 95%
- Limit-Erreichung bei 100%

#### UI-Komponenten

**`UsageLimitSettings`** - Profil-Einstellungen
- Toggle für Limit-Aktivierung
- Numeric Stepper (15-480 Min, 15er Schritte)
- Anzeige des Tagesverbrauchs
- Reauth-Hinweise und Validierung

**`SessionUsageBadge`** - Timer-Badge
- Kompakter Timer mit Progress-Ring
- Farbwechsel bei Warnungen (Mint → Coral)
- Sticky Position im Feed

**`UsageWarningBanner`** - Warnbanner
- Erscheint bei 80% und 95%
- Dismissable, aber kehrt zurück
- Fade-in Animation (220ms)

**`LimitReachedModal`** - Limit-Modal
- Blocking Modal bei Limit-Erreichung
- Fokus-Trap, keine ESC-Taste
- Logout-Handler

## User Flow

### 1. Limit setzen
1. User geht zu `/profile-v2`
2. Aktiviert "Tageslimit" in den Einstellungen
3. Wählt Limit (15-480 Min, 15er Schritte)
4. Klickt "Speichern"
5. System setzt `requires_reauth = true`
6. Toast: "Limit aktualisiert. Melde dich neu an, um es zu aktivieren."

### 2. Session starten
1. User meldet sich neu an
2. System setzt `requires_reauth = false`
3. Timer startet automatisch in Guide/Access
4. Heartbeat sendet alle 30 Sek Verbrauch an Backend

### 3. Warnungen
1. Bei 80%: Erster Warnbanner
2. Bei 95%: Kritischer Warnbanner (Coral)
3. Banner sind dismissable, kehren aber zurück

### 4. Limit erreicht
1. Bei 100%: Timer stoppt, Modal erscheint
2. Feed wird deaktiviert (Overlay)
3. Modal: "Tageslimit verbraucht"
4. CTA: "Jetzt abmelden"
5. Logout → Redirect zu `/login?limitReached=1`

### 5. Re-Login
1. Login-Seite zeigt Banner: "Tageslimit zurückgesetzt nach Mitternacht"
2. Nach Login: `requires_reauth = false`
3. Neues Limit ist aktiv

## Technische Details

### Multi-Tab-Synchronisation
- BroadcastChannel für Tab-Kommunikation
- Nur aktiver Tab sendet Heartbeat
- Andere Tabs hören auf "usageUpdate" Events

### Page Visibility API
- Timer pausiert bei Tab-Wechsel
- Resume bei Rückkehr
- Verhindert falsche Zeitberechnung

### Validierung
- Backend: 15-480 Minuten, 15er Schritte
- Frontend: Sofortiges Feedback
- Reauth-Requirement blockiert Änderungen

### Sicherheit
- `requires_reauth` Flag verhindert Umgehung
- Session-basierte Authentifizierung
- Heartbeat-Validierung

## Design-Tokens

### Farben
- `--fyf-mint`: Normale Timer-Anzeige
- `--fyf-coral`: Warnungen und Limit erreicht
- `--fyf-steel`: Sekundäre Texte
- `--fyf-cream`: Primäre Texte

### Animationen
- Fade-in: 220ms ease-out
- Progress-Ring: Smooth transitions
- Banner: Slide-in von oben

### Responsive
- Mobile: Einspaltig, full-width Buttons
- Desktop: Sticky Badge, Modal zentriert
- Breakpoints: 640px, 768px, 1024px

## Testing

### Unit Tests
- `useSessionTimer.test.ts`: Timer-Logik, Warnungen, Multi-Tab
- `usageStore.test.ts`: State Management, API-Calls, Fehlerbehandlung

### Integration Tests
- `usage-limit.test.ts`: API-Endpunkte, Validierung, Auth-Flow

### E2E Tests (geplant)
- Kompletter Flow: Limit setzen → Session → Warnungen → Logout → Re-Login
- Multi-Tab-Szenarien
- Offline/Online-Verhalten

### Demo-Smoke-Test
Für die Demo-Version kann folgender Flow getestet werden:
1. Gehe zu `/profile-v2`
2. Aktiviere "Tageslimit" und setze ein Limit (z.B. 2 Minuten)
3. Gehe zu `/guide` oder `/access`
4. Warte auf Warnung bei 80% (1:36 Min)
5. Warte auf Limit-Erreichung (2:00 Min)
6. Bestätige Logout im Modal
7. Überprüfe Redirect zu `/login?limitReached=1`

## QA-Checklist

### Funktionalität
- [ ] Limit setzen (15-480 Min, 15er Schritte)
- [ ] Timer startet automatisch
- [ ] Warnungen bei 80% und 95%
- [ ] Limit-Modal bei 100%
- [ ] Logout-Enforcement
- [ ] Reauth-Requirement
- [ ] Multi-Tab-Sync
- [ ] Page Visibility Handling

### UI/UX
- [ ] Responsive Design (Mobile/Desktop)
- [ ] Accessibility (Screenreader, Fokus)
- [ ] Animationen (Fade-in, Progress)
- [ ] Farbwechsel (Mint → Coral)
- [ ] Toast-Nachrichten
- [ ] Error-Handling

### Edge Cases
- [ ] Limit = 0 (nicht erlaubt)
- [ ] Limit knapp über Verbrauch
- [ ] Tageswechsel (Mitternacht Reset)
- [ ] Offline/Netzunterbrechung
- [ ] Mehrere Sessions parallel
- [ ] Browser Sleep/Wake

### Performance
- [ ] Timer-Performance (1s Ticks)
- [ ] Heartbeat-Effizienz (30s)
- [ ] Memory Leaks (Cleanup)
- [ ] Bundle Size Impact

### Sicherheit
- [ ] Auth-Validation
- [ ] Session-Sicherheit
- [ ] Reauth-Enforcement
- [ ] Input-Validierung

## Deployment

### Dependencies
```bash
npm install zustand pg @types/pg date-fns
```

### Database Migration
```bash
psql -d fyf_db -f db/migrations/001_add_usage_limit.sql
```

### Environment Variables
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=...
```

### Build & Deploy
```bash
npm run build
npm run start
```

## Monitoring

### Logs
- Session-Start/End
- Limit-Änderungen
- Warnungen ausgelöst
- Logout-Events

### Metrics
- Durchschnittliche Nutzungszeit
- Limit-Erreichungsrate
- Reauth-Frequenz
- Multi-Tab-Usage

### Alerts
- Ungewöhnliche Session-Längen
- Häufige Limit-Änderungen
- API-Fehler-Rate
- Performance-Degradation

## Roadmap

### Phase 2 (geplant)
- [ ] Wöchentliche/Monatliche Limits
- [ ] Familien-Accounts mit geteilten Limits
- [ ] Analytics Dashboard
- [ ] Push-Notifications für Warnungen

### Phase 3 (geplant)
- [ ] AI-basierte Limit-Empfehlungen
- [ ] Integration mit Kalender-Apps
- [ ] Gamification (Streaks, Achievements)
- [ ] Social Features (Limit-Challenges)

## Support

### Troubleshooting
- Timer startet nicht: Check `dailyLimitMinutes`
- Warnungen erscheinen nicht: Check Timer-Hook
- Logout funktioniert nicht: Check API-Route
- Multi-Tab-Sync: Check BroadcastChannel Support

### Debug-Modus
```javascript
// In Browser Console
localStorage.setItem('fyf-debug', 'true');
// Zeigt detaillierte Timer-Logs
```

### Kontakt
- Technical Issues: [GitHub Issues]
- Feature Requests: [Product Board]
- Documentation: [Wiki]
