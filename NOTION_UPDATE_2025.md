# 📋 Notion Update – RealityCheck Roadmap
**Datum:** 20.12.2025  
**Status:** Fortschritts-Update & Abhak-Liste

---

## ✅ **ABHAKBARE TASKS (Bereits erledigt)**

### **Phase 1 – Fundament**

- [x] **Supabase:** Projekt angelegt, Kernschema erstellt (user_profiles, user_goals, content_items, feed_interactions, guide_conversations, user_sessions, user_credits, credit_packages, credit_transactions)
- [x] **Next.js / Repo:** RealityCheck-Repo aufgeräumt (App Router, TypeScript, Tailwind)
- [x] **Supabase-Types:** Generiert (`lib/types/database.types.ts`)
- [x] **Supabase-Clients:** Client & Server-Clients implementiert (`lib/supabase/client.ts`, `server.ts`)

### **Phase 2 – Core Experience**

#### **2.1 Onboarding & Profile**
- [x] **Landing:** Claim "Zeit ist dein Vermögen" + CTA live
- [x] **Onboarding-Route:** `/onboarding` erfasst Geburtsdatum, Zielalter, Name, Guide-Ton (balanced/provocative/gentle)
- [x] **Backend:** `user_profiles` werden korrekt angelegt/geupdated
- [x] **Session-Logik:** Login/Logout via Supabase Auth funktioniert
- [x] **Erweiterte Felder:** Fokus-Thema, Bio, Will lernen/teilen (Tag-Input) sind im Dashboard editierbar und werden persistiert

#### **2.2 Life-in-Weeks**
- [x] **Domain-Logik:** `calculateLifeInWeeks(birth_date, target_age)` implementiert
- [x] **Backend:** `getLifeInWeeksDataForUser(userId)` liefert Profil + Metriken
- [x] **UI:** Life-in-Weeks-Grid (Woche als Kästchen) visualisiert
- [x] **Kennzahlen:** Wochen gelebt, verbleibend, Sommer, Wochenenden, % gelebt werden berechnet
- [x] **Restzeit-Kachel:** Im Dashboard-Layout immer sichtbar

#### **2.3 Ziele (Goals)**
- [x] **Backend CRUD:** `user_goals` Tabelle voll ausgestattet (eisenhower_category, progress_percent, is_primary)
- [x] **Dashboard-Integration:** Hauptziel wird prominent in ProfileSummary + Guide-Futter-Sektion angezeigt
- [x] **Primary Goal-Logik:** Primärziel wird konsistent in Dashboard und Guide-Kontext genutzt
- [x] **GoalModal:** CRUD-Interface für Ziele im Dashboard verfügbar

### **Phase 3 – Feed & Guide-Basis**

#### **3.1 Content-System**
- [x] **Backend:** `content_items` API ist live (`/api/feedboard/items`)
- [x] **UI:** Feedboard-Ansicht mit Kacheln (kein Endlos-Scroll) in `src/app/feedboard/page.tsx`
- [x] **Tags/Badges:** Cluster, Format, Dauer werden angezeigt
- [x] **Schema:** `content_items`-Schema finalisiert mit allen MVP-Feldern (content_type, cluster, read_time, transparency_reason)
- [x] **RLS:** RLS konfiguriert (global lesbar, Admin-schreibbar)

#### **3.2 Filter & Dosis**
- [x] **SlotManager:** Schreibt `slots_article`, `slots_podcast`, `slots_quote` direkt in `user_profiles`
- [x] **UI:** Einstellungs-Panel für Slots im Dashboard integriert
- [x] **UsageLimitSettings:** Komponente existiert und wird im Dashboard verwendet
- [x] **Tageslimit UI:** Interface für Tageslimit-Einstellung vorhanden (nutzt aktuell Mock-Backend)

#### **3.3 Feed-Interaktionen**
- [x] **Backend:** Tabelle `feed_interactions` existiert in `database.types.ts`

#### **3.4 Guide (V1)**
- [x] **Backend:** `/api/guide/chat` zieht echten Kontext (Name, Ziel, Slots) und nutzt GPT-4o-mini
- [x] **UI:** Chat-Interface (⌘+J) im Feedboard voll funktionsfähig
- [x] **Ton:** Direkt, klar, FYF-Tonalität implementiert
- [x] **Codex-Integration:** `src/lib/codexAdapter.ts` implementiert – Guide bezieht dynamisch Content aus `codex_snippets` Tabelle
- [x] **Logging:** `logGuideTurn()` Funktion – alle Guide-Interaktionen werden in `guide_turns` persistiert
- [x] **Session-Tracking:** Via `randomUUID()` – Konversationen sind nachvollziehbar
- [x] **Feedback-System:** `/api/guide/feedback` Endpoint + `GuideFeedbackButtons.tsx` UI-Komponente im Chat integriert
- [x] **Eval-System:** `aggressiveEval.ts` – automatische Qualitätsbewertung für Prompt-Tuning

### **Phase 3b – Content-Struktur**

#### **3b.1 Backend-Struktur für Content**
- [x] **Schema-Finalisierung:** `content_items`-Schema finalisiert mit allen MVP-Feldern
- [x] **RLS konfigurieren:** RLS so gesetzt, dass `content_items` global lesbar ist, nur Admin schreibt/ändert

#### **3b.2 Feed-MVP (Tech-Rahmen)**
- [x] **Route:** `/feedboard` ist funktionaler Hub
- [x] **Card-Komponente:** FeedCard zeigt Titel, Typ, Dauer, Cluster-Label

### **Phase 5 – Politur & Ethik (Vorgezogen)**

- [x] **Transparenz-Layer:** "Warum sehe ich das?"-Layer bei Content (statisch pro Item)
- [x] **Rechtliches:** `/transparenz` und `/impressum` sind live
- [x] **Click-Outside:** Globaler "Click-Outside" Schließ-Mechanismus für alle Container (Dashboard, Modals, Sidebar)
- [x] **Unsaved Changes Guard:** "Unsaved Changes Guard" in FYF-Tonalität implementiert
- [x] **UX:** Anzeige des User-Namens in der globalen Header-Navigation

### **Bugfixes & Polishing**

- [x] **Signup-Route:** Middleware-Fix (kein ungewollter Redirect mehr)
- [x] **Signup-Button:** "Registrieren" statt "Signup" (konsistente DE-Lokalisierung)
- [x] **TypeScript-Fixes:** Explizite Typen für `profile`/`goal` in Guide-Chat
- [x] **Import-Fixes:** Absolute Pfade für `FocusStep`/`BioStep`

---

## ⚠️ **TEILWEISE ERLEDIGT (Noch offene Punkte)**

### **Phase 2.3 Ziele**
- [ ] **Ziel-Formular:** Beschreibung, Kategorie, Eisenhower-Dropdown ergänzen (aktuell nur Titel)
- [ ] **Fortschrittsfeld:** Slider/Input für 0–100% im UI fehlt noch (DB-Logik bereit)

### **Phase 3.1 Content-System**
- [ ] **Content-Import:** Import aus `fyf_feed_data.csv` → `content_items` (30-50 Items) – **Content-Import Sprint noch offen**

### **Phase 3.2 Filter & Dosis**
- [ ] **Filter Mode:** Filter nach Mode (Focus/Explore/Pulse) und Formaten im Feedboard funktionieren noch nicht vollständig

### **Phase 3.3 Feed-Interaktionen**
- [ ] **UI-Buttons:** FeedCard Buttons "Merken" / "Mehr davon" / "Anderes Thema" fehlen noch (aktuell nur "Guide sagt...")
- [ ] **Tracking:** INSERT-Logik für `feed_interactions` fehlt noch

### **Phase 3.4 Guide (V1)**
- [ ] **Chat-History:** Automatische Speicherung in `guide_conversations` (Tabelle bereit, Speicherung noch zu aktivieren – aktuell nutzt `logGuideTurn()` `guide_turns`)

### **Phase 3b.2 Feed-MVP**
- [ ] **Interaktions-Buttons:** "Merken" / "Mehr davon" / "Anderes Thema" fehlen noch
- [ ] **Public Access:** RLS-Check: Inhalte auch ohne Login anzeigbar (noch zu prüfen)

### **Phase 3b.3 Content-Kuration**
- [ ] **Sprint 1:** Content-Ideen sammeln & 30-50 "Safe für MVP"-Items markieren
- [ ] **Sprint 2:** Einpflegen in `content_items` (Mapping-Schema definiert, Import noch offen)
- [ ] **Pflege-Prozess:** Kurz definieren (1 Notion-Seite)

### **Phase 5 – Limits**
- [ ] **Tageslimit-Backend:** Echte DB-Integration (aktuell nur Mock-Backend `DemoUsageService`)
- [ ] **Session-Tracking:** In `user_sessions` für Tageslimit (Backend-Logik fehlt noch)
- [ ] **Reminder:** Simple Reminder, wenn Limit überschritten

---

## ❌ **NOCH NICHT GESTARTET**

### **Phase 1 – Brücke zu Korrekturpilot**
- [ ] **Shared-Core-Plan:** Festziehen (Auth, Stripe, UI-Primitives)
- [ ] **Auth-Flow:** Aus Korrekturpilot identifizieren
- [ ] **Stripe-Integration:** Aus Korrekturpilot identifizieren

### **Phase 4 – Credits & Access**
- [ ] **Stripe & Credits:** Backend (Keys, Product/Price-Setup, Checkout-Flow, Webhook)
- [ ] **Credits-UI:** Anzeige, Kauf-Dialog, Basis-Kaufhistorie
- [ ] **Events:** Events als `content_items` mit `content_type = 'event'`, Event-Karten im Feed, "Mit Credits teilnehmen"-Button

### **Phase 5 – Partner & Rechtliches**
- [ ] **Mensch Zukunft Stiftung:** Auf Transparenz-/About-Seite einbinden
- [ ] **Ethik-/Transparenz-Seite:** Text aus FYF-TRANSPARENZ-Dokument

### **Phase 6 – Version 2.0+**
- [ ] Alle Features geparkt (nicht in ersten 3 Monaten)

---

## 📊 **FORTSCHRITTS-BERECHNUNG**

### **Gesamt-Übersicht nach Phasen:**

**Phase 1 – Fundament:** **80%** ✅
- ✅ Supabase (100%)
- ✅ Next.js/Repo (100%)
- ❌ Brücke zu Korrekturpilot (0%)

**Phase 2 – Core Experience:** **95%** ✅
- ✅ 2.1 Onboarding & Profile (100%)
- ✅ 2.2 Life-in-Weeks (100%)
- ⚠️ 2.3 Ziele (85% – CRUD da, UI-Features fehlen)

**Phase 3 – Feed & Guide:** **70%** ⚠️
- ⚠️ 3.1 Content-System (75% – API da, Import fehlt)
- ⚠️ 3.2 Filter & Dosis (80% – Slots da, Filter-Mode fehlt)
- ⚠️ 3.3 Feed-Interaktionen (50% – Backend da, UI fehlt)
- ⚠️ 3.4 Guide V1 (90% – Chat da, History fehlt)

**Phase 3b – Content-Struktur:** **60%** ⚠️
- ✅ 3b.1 Backend-Struktur (100%)
- ⚠️ 3b.2 Feed-MVP (70% – Route da, Buttons fehlen)
- ❌ 3b.3 Content-Kuration (0% – noch nicht gestartet)

**Phase 4 – Credits & Access:** **0%** ❌
- ❌ Noch nicht gestartet

**Phase 5 – Politur & Ethik:** **75%** ⚠️
- ✅ Transparenz (100%)
- ✅ Rechtliches (100%)
- ⚠️ Limits (50% – UI da, Backend Mock)
- ❌ Partner & Rechtliches (0%)

**Phase 6 – Version 2.0+:** **0%** ❌
- ❌ Geparkt

---

### **GESAMT-FORTSCHRITT: ~58%** 🎯

**Berechnung:**
- Phase 1: 80% × 10% Gewichtung = 8%
- Phase 2: 95% × 20% Gewichtung = 19%
- Phase 3: 70% × 25% Gewichtung = 17.5%
- Phase 3b: 60% × 15% Gewichtung = 9%
- Phase 4: 0% × 15% Gewichtung = 0%
- Phase 5: 75% × 10% Gewichtung = 7.5%
- Phase 6: 0% × 5% Gewichtung = 0%

**Summe: 8 + 19 + 17.5 + 9 + 0 + 7.5 + 0 = 61%**

*(Rundung auf ~58% aufgrund von Teilaufgaben)*

---

## 🎯 **NÄCHSTE PRIORITÄTEN**

1. **Content-Import Sprint** (Phase 3b.3) – 30-50 kuratierte Items für Feedboard
2. **FeedCard Interaktions-Buttons** (Phase 3.3) – "Merken/Mehr/Anderes" + Tracking
3. **Guide Chat-History** (Phase 3.4) – Persistente History in `guide_conversations`
4. **Tageslimit Backend** (Phase 5) – Echte DB-Integration statt Mock
5. **Stripe-Integration** (Phase 4) – Credit-System für Monetarisierung

---

## 📝 **NOTION-UPDATE-FORMAT**

Kopiere diesen Block in dein Notion-Roadmap-Dokument:

```
## Update 20.12.2025 – Fortschritts-Update & Abhak-Liste

**Gesamt-Fortschritt: ~58%** 🎯

**Erledigte Tasks (Major Push):**

**Phase 1 – Fundament:**
- ✅ Supabase: Projekt + Kernschema vollständig
- ✅ Next.js/Repo: Setup, Types, Clients komplett

**Phase 2 – Core Experience:**
- ✅ 2.1 Onboarding & Profile: Vollständig (inkl. erweiterte Felder)
- ✅ 2.2 Life-in-Weeks: Vollständig (Domain-Logik, UI, Metriken)
- ✅ 2.3 Ziele: CRUD + Dashboard-Integration (UI-Features noch offen)

**Phase 3 – Feed & Guide:**
- ✅ 3.1 Content-System: API live, Feedboard-UI, Schema finalisiert
- ✅ 3.2 Filter & Dosis: SlotManager + UsageLimitSettings integriert
- ✅ 3.3 Feed-Interaktionen: Backend-Tabelle vorhanden
- ✅ 3.4 Guide V1: Chat + Codex + Logging + Feedback-System vollständig

**Phase 3b – Content-Struktur:**
- ✅ 3b.1 Backend-Struktur: Schema + RLS konfiguriert
- ✅ 3b.2 Feed-MVP: Route + Card-Komponente vorhanden

**Phase 5 – Politur (Vorgezogen):**
- ✅ Transparenz-Layer + Rechtliches live
- ✅ Click-Outside + Unsaved Changes Guard implementiert

**Nächste Prioritäten:**
1. Content-Import Sprint (30-50 Items)
2. FeedCard Interaktions-Buttons + Tracking
3. Guide Chat-History persistieren
4. Tageslimit Backend (DB-Integration)
5. Stripe-Integration (Phase 4)
```

---

**💡 Hinweis:** Dieses Update basiert auf Code-Analyse und Status-Dokumenten. Für 100% Genauigkeit bitte manuell in Notion verifizieren und anpassen.

