# Settings & Dashboard - UX/IA Regeln

## Settings-Seiten Struktur

### Grundsatz
**Settings-Seiten enthalten keine "Quick Access"-Tools.**
Tools (Life in Weeks etc.) sind Dashboard/Utility-Views, nicht Settings.

### Was gehört wo

#### `/user/settings/*` (Settings-Seiten)
- **Nur Edit & Konfiguration**
- Formulare zum Bearbeiten von Daten
- Einstellungen für Verhalten/Funktionen
- Account-Verwaltung
- **KEINE Tools oder Quick Access Komponenten**

#### `/user/dashboard` (Dashboard)
- **Tools & Quick Access**
- Life in Weeks Preview
- Guide Feed
- Guide History
- Quick Access zu Tools

### Konkret: Life in Weeks

**❌ VERBOTEN in Settings:**
- `LifeWeeksPreview` Komponente
- "Quick Access" Sektionen
- Tool-Links die zu Utility-Views führen

**✅ ERLAUBT auf Dashboard:**
- `LifeWeeksPreview` als Quick Access Tool
- Links zu `/life-weeks` (vollständige Ansicht)
- Tool-Integration im Dashboard Flow

### Merge-Blocking Regel

**Wichtig:** Diese Trennung ist merge-blocking.
- Settings-Seiten müssen strikt "Edit & Konfiguration" bleiben
- Tools gehören auf Dashboard, nicht in Settings
- Keine Quick Access Komponenten in Settings-Layouts/Pages

### Beispiel-Struktur

```
/user/dashboard
  - Profile Header (Avatar, Name, Status, Ziel)
  - Guide Feed (Tool)
  - Life in Weeks Preview (Quick Access Tool) ✅
  - Guide History (Tool)

/user/settings/ziel
  - Ziel bearbeiten (Form)
  - Interessen bearbeiten (Form)
  - Projekte bearbeiten (Form)
  - ❌ KEIN Life in Weeks
  - ❌ KEIN Quick Access
```

### Code-Prüfung vor Merge

Vor jedem Merge prüfen:
1. Keine `LifeWeeksPreview` Importe in `/user/settings/*`
2. Keine Quick Access Sektionen in Settings-Pages
3. Dashboard behält alle Tool-Komponenten
