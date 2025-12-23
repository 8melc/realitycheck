# Test-Plan: Guide Settings End-to-End

## Test-Fälle

### 1. Antwort-Länge: Kurz + Hard Truth
**Settings:**
- Antwort-Länge: `Kurz`
- Guide-Ton: `Hard Truth`
- Fokus-Zeit: `Abend` (oder aktuelle Zeit)

**Erwartung:**
- Antwort ist sehr kurz (6-8 Zeilen)
- Direkter, klarer Ton
- Challenge ist hart formuliert
- `max_output_tokens: 250` im Log

**Test-Frage:** "Ich prokrastiniere zu viel"

---

### 2. Antwort-Länge: Ausführlich + Soft Touch
**Settings:**
- Antwort-Länge: `Ausführlich`
- Guide-Ton: `Soft Touch`
- Fokus-Zeit: `Abend` (oder aktuelle Zeit)

**Erwartung:**
- Antwort ist ausführlich (16-24 Zeilen)
- Sanfter, ermutigender Ton
- Challenge als Einladung formuliert
- `max_output_tokens: 800` im Log

**Test-Frage:** "Ich prokrastiniere zu viel"

---

### 3. Fokus-Zeit: Morgen (außerhalb des Fensters)
**Settings:**
- Fokus-Zeit: `Morgen` (6:00-12:00)
- Aktuelle Zeit: z. B. 20:00 Uhr (Abend)

**Erwartung:**
- `inFocusWindow: false` im Log
- `contentEligible: false` (wenn nicht explizit nach Content gefragt)
- Keine Content-Empfehlung erscheint

**Test-Frage:** "Zeig mir einen Artikel"

---

### 4. Fokus-Zeit: Abend (innerhalb des Fensters)
**Settings:**
- Fokus-Zeit: `Abend` (18:00-22:00)
- Aktuelle Zeit: z. B. 19:00 Uhr

**Erwartung:**
- `inFocusWindow: true` im Log
- Content-Empfehlung erscheint (wenn eligible)

**Test-Frage:** "Zeig mir einen Artikel"

---

### 5. System-Prompt prüfen
**Vorgehen:**
1. Setze Settings (z. B. `Kurz` + `Hard Truth`)
2. Stelle eine Frage im Guide-Chat
3. Prüfe in den Server-Logs (Terminal/Console) den System-Prompt

**Erwartung im System-Prompt:**
```
GUIDE-STIL (aus Settings)
- Antwort-Länge: Kurz
  - Kurz: maximal 6–8 Zeilen insgesamt. Sehr kompakt, nur das Wesentliche.
- Ton: Hard Truth
  - Hard Truth: klare Zuspitzung + Trade-off; keine Weichzeichner. Direkt, aber respektvoll.
```

---

## Quick-Test-Checklist

- [ ] Settings werden in DB gespeichert (nach "Einstellungen speichern")
- [ ] Settings werden beim Reload geladen
- [ ] `[Guide Settings]` Log erscheint bei jedem Guide-Request
- [ ] `max_output_tokens` entspricht der gewählten Länge
- [ ] Antwort-Länge ist spürbar unterschiedlich (Kurz vs. Ausführlich)
- [ ] Ton ist spürbar unterschiedlich (Soft Touch vs. Hard Truth)
- [ ] Fokus-Zeit blockt Content außerhalb des Fensters
- [ ] Fokus-Zeit erlaubt Content innerhalb des Fensters

---

## Debugging

### Settings werden nicht geladen?
- Prüfe Browser-Console auf Fehler
- Prüfe Network-Tab: Wird `/api/profile/guide-settings` aufgerufen?
- Prüfe Supabase: Sind die Werte in `user_profiles` gespeichert?

### Settings wirken nicht im Guide?
- Prüfe Server-Logs (Terminal) auf `[Guide Settings]` Log
- Prüfe ob `nudging_frequency` in der DB-Spalte vorhanden ist
- Prüfe ob die Settings vor dem Guide-Request gespeichert wurden

### Fokus-Zeit funktioniert nicht?
- Prüfe aktuelle Uhrzeit vs. gewählte Fokus-Zeit
- Prüfe `inFocusWindow` Wert im Log
- Prüfe ob `isInFocusWindow` Funktion korrekt importiert ist

