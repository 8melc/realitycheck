# Settings Page - Fehlende Features Analyse & Fix

## ✅ BEHOBEN: Zusammenfassung der Änderungen

### Problem 1: `nudging_frequency` DB-Spalte fehlt
**Status**: ✅ BEHOBEN
- Migration erstellt: `db/migrations/009_fix_nudging_frequency.sql`
- GuideSettings robuster gemacht: Spalten werden einzeln geladen, Fallbacks verwendet
- Komponente versteckt sich nicht mehr bei fehlenden Spalten

### Problem 2: Tageslimit/Fokuszeit fehlt auf Settings-Seite
**Status**: ✅ BEHOBEN
- `UsageLimitSettings` auf Settings-Seite integriert
- Erscheint jetzt als eigene Section "Tageslimit / Fokuszeit"

### Problem 3: Content-Quota (5 Podcasts, 3 Artikel, etc.)
**Status**: ❌ **NICHT IMPLEMENTIERT** (Feature existiert noch nicht)

---

## 📋 FUNDSTELLEN

### A) `nudging_frequency` Fehler

**Datei**: `src/components/GuideSettings.tsx`
- **Zeile 65-78**: Query versucht `nudging_frequency` zu laden
- **Problem**: Spalte existiert nicht in DB → Query schlägt fehl
- **Auswirkung**: Komplette GuideSettings-Komponente wird versteckt

**✅ Lösung implementiert**:
- Migration `009_fix_nudging_frequency.sql` erstellt
- GuideSettings lädt Spalten jetzt einzeln mit Fallbacks
- Komponente zeigt sich auch wenn Spalte fehlt (mit Defaults)

### B) Tageslimit/Fokuszeit

**Komponente existiert**: `src/components/profile/UsageLimitSettings.tsx`
- **Dashboard**: Wird in `src/app/user/dashboard/page.tsx` angezeigt (Zeile 290)
- **Settings**: War NICHT integriert → jetzt hinzugefügt

**✅ Lösung implementiert**:
- Section "Tageslimit / Fokuszeit" zu Settings-Seite hinzugefügt
- Nutzt bestehende `UsageLimitSettings` Komponente

### C) Content-Quota (5 Podcasts, 3 Artikel, etc.)

**Suchergebnisse**:
- ❌ Keine Komponente gefunden
- ❌ Keine API-Route gefunden  
- ❌ Keine DB-Spalten in `user_profiles` für Content-Quotas

**Mögliche Interpretationen**:
1. Feature ist noch nicht implementiert (zu entwickeln)
2. Gemeint ist `focus_window` (Zeitfenster für Content) - existiert bereits
3. Feature war geplant, wurde aber entfernt/verschoben

**Was existiert bereits**:
- `focus_window` in GuideSettings: Zeitfenster für Content-Empfehlungen (Morgen/Nachmittag/Abend/Spät)
- Content-Filter im Guide Feed (aber keine Quota-Einstellung)

---

## 🔧 IMPLEMENTIERTE FIXES

### 1. Migration: `009_fix_nudging_frequency.sql`
```sql
-- Fügt nudging_frequency Spalte hinzu (wenn nicht vorhanden)
-- Setzt Default 'standard' für bestehende User
```

### 2. GuideSettings robuster gemacht
- Spalten werden einzeln geladen (basic + nudging)
- Fehlende Spalten führen zu Defaults statt Error
- Komponente wird immer angezeigt (auch bei fehlenden Spalten)

### 3. UsageLimitSettings integriert
- Neue Section auf Settings-Seite hinzugefügt
- Position: Nach "Guide-Einstellungen", vor "Account-Verwaltung"

---

## 📝 NÄCHSTE SCHRITTE (für dich)

### 1. Migration ausführen
```bash
# In Supabase SQL Editor ausführen:
# db/migrations/009_fix_nudging_frequency.sql
```

### 2. Content-Quota Feature (wenn gewünscht)
**Option A**: Neu implementieren
- DB-Spalten: `content_quota_podcasts`, `content_quota_articles`, `content_quota_quotes`
- Komponente: `ContentQuotaSettings.tsx`
- API-Route: `PUT /api/profile/content-quota`

**Option B**: Klären ob `focus_window` gemeint war
- Existiert bereits in GuideSettings
- Kann Zeitfenster für Content-Empfehlungen setzen

---

## 🧪 VERIFIKATION

### Test-Checklist:

1. ✅ Settings-Seite lädt ohne Errors
2. ✅ GuideSettings wird angezeigt (auch wenn `nudging_frequency` fehlt)
3. ✅ Tageslimit-Section erscheint auf Settings-Seite
4. ✅ Tageslimit kann gesetzt/geändert werden
5. ⚠️ Content-Quota: Feature existiert noch nicht

### Erwartetes Verhalten nach Fix:

- **Settings-Seite**: Alle Sections sichtbar (Guide, Tageslimit, Avatar, etc.)
- **GuideSettings**: Funktioniert auch ohne `nudging_frequency` Spalte (verwendet Defaults)
- **Tageslimit**: Vollständig funktionsfähig auf Settings-Seite

---

## 📍 DATEIEN GEÄNDERT

1. `db/migrations/009_fix_nudging_frequency.sql` (NEU)
2. `src/components/GuideSettings.tsx` (ROBUSTER GEMACHT)
3. `src/app/user/settings/page.tsx` (USAGELIMITSETTINGS HINZUGEFÜGT)

