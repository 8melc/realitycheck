# Feld-Mapping Tabelle - RealityCheck

## Entscheidungstabelle: Wo gehört welches Feld hin?

| Feld | Onboarding | People sichtbar | Account/Settings | Begründung |
|------|-----------|-----------------|------------------|------------|
| **display_name** | ✅ Ja (Pflicht) | ✅ Ja | ✅ Ja (editierbar) | Basis-Identität, einmalig im Onboarding, später änderbar |
| **email** | ✅ Ja (read-only) | ❌ Nein | ✅ Ja (read-only) | Aus Auth, nicht öffentlich |
| **birth_date** | ✅ Ja (Pflicht) | ✅ Ja (Alter berechnet) | ❌ Nein | Basis für Zeitberechnung, einmalig |
| **target_age** | ✅ Ja (Pflicht) | ✅ Ja (Restjahre) | ❌ Nein | Basis für Zeitberechnung, einmalig |
| **goal** (freier Text) | ✅ Ja (Pflicht, ODER goalDirection) | ✅ Ja | ✅ Ja (editierbar) | Primäres Ziel, essentiell für Guide |
| **goal_direction** (Enum) | ✅ Ja (Pflicht, ODER goal) | ✅ Ja | ❌ Nein | Alternative zu goal, einmalig |
| **answer_style** | ✅ Ja (Pflicht) | ❌ Nein | ✅ Ja (editierbar) | Guide-Verhalten, grob im Onboarding |
| **guide_tone** | ✅ Ja (Pflicht) | ❌ Nein | ✅ Ja (editierbar) | Guide-Verhalten, grob im Onboarding |
| **bio** | ❌ Nein | ✅ Ja | ✅ Ja (editierbar) | Später veränderbar, nicht initial |
| **interests** | ❌ Nein | ✅ Ja | ✅ Ja (editierbar) | Später veränderbar, nicht initial |
| **focus_topic** | ❌ Nein | ✅ Ja | ✅ Ja (editierbar) | Später veränderbar, nicht initial |
| **lifestyle** | ❌ Nein | ✅ Ja | ✅ Ja (editierbar) | Später veränderbar, nicht initial |
| **music_taste** | ❌ Nein | ✅ Ja | ✅ Ja (editierbar) | Später veränderbar, nicht initial |
| **nudging_frequency** | ❌ Nein | ❌ Nein | ✅ Ja (editierbar) | Guide-Setting, später veränderbar |
| **focus_window** | ❌ Nein | ❌ Nein | ✅ Ja (editierbar) | Guide-Setting, später veränderbar |
| **slots_article** | ❌ Nein | ❌ Nein | ✅ Ja (editierbar) | Content-Filter, später veränderbar |
| **slots_podcast** | ❌ Nein | ❌ Nein | ✅ Ja (editierbar) | Content-Filter, später veränderbar |
| **slots_quote** | ❌ Nein | ❌ Nein | ✅ Ja (editierbar) | Content-Filter, später veränderbar |
| **daily_limit_minutes** | ❌ Nein | ❌ Nein | ✅ Ja (editierbar) | Tageslimit, später veränderbar |
| **avatar_type** | ❌ Nein | ✅ Ja | ✅ Ja (editierbar) | Profilbild, später veränderbar |
| **avatar_url** | ❌ Nein | ✅ Ja | ✅ Ja (editierbar) | Profilbild, später veränderbar |
| **is_public** | ❌ Nein | ❌ Nein | ✅ Ja (editierbar) | Privacy-Setting, später veränderbar |

---

## Zusammenfassung

### Onboarding (nur Initialisierung):
- ✅ Identität: display_name, email, birth_date, target_age
- ✅ Ziel: goal ODER goal_direction
- ✅ Guide-Grundstil: answer_style, guide_tone

### People sichtbar:
- ✅ Identität: display_name, Alter (aus birth_date), Restjahre (aus target_age)
- ✅ Ziel: goal oder goal_direction
- ✅ Profil: bio, interests, focus_topic, lifestyle, music_taste, avatar

### Account/Settings (später veränderbar):
- ✅ Alle Felder außer birth_date und target_age (einmalig)

---

## Implementierungsstatus

- ✅ Onboarding: Bereits refactored (nur erlaubte Felder)
- ⏳ People: Layout-Fixes ausstehend
- ⏳ Settings: Bereits vorhanden, Layout-Fixes ausstehend

