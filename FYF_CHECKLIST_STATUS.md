# FYF Checklist Status 3.1-3.4

## **3.1 Content-System**
- [x] content_items API live ✓
- [ ] Import fyf_feed_data.csv → content_items (48 Items?) - **STATUS: Prüfe COUNT in DB**
- [x] Feedboard Kacheln (kein Scroll) ✓
- [x] Tags: Cluster/Format/Dauer ✓

## **3.2 Filter & Dosis**  
- [x] SlotManager → user_profiles ✓
- [x] UsageLimitSettings.tsx (Dashboard) ✓ - **EXISTIERT & WIRD VERWENDET**
- [x] Tageslimit UI ✓ - **UsageLimitSettings.tsx im Dashboard integriert**
- [ ] Filter Mode (Focus/Explore/Pulse) → **Feedboard hat Mode-System, aber spezifische Filter-Mode-Integration unklar**

## **3.3 Feed-Interaktionen**
- [x] feed_interactions Tabelle ✓ - **EXISTIERT in database.types.ts**
- [ ] FeedCard Buttons (Merken/Mehr/Anderes) → **FEHLT: Keine Buttons in FeedCard gefunden**
- [ ] Tracking View (SQL) → **FEHLT: Keine INSERT-Logik für feed_interactions gefunden**

## **3.4 Guide V1**
- [x] /api/guide/chat + GPT-4o-mini ✓
- [ ] guide_conversations persistente History → **FEHLT: logGuideTurn verwendet 'guide_logs', nicht 'guide_conversations'**
- [x] Chat UI (⌘+J) ✓
- [x] FYF Tonalität ✓

---

## **STATUS CHECK:**

1. **content_items COUNT?** → **UNKNOWN** - Prüfe mit: `SELECT COUNT(*) FROM content_items WHERE is_published = true;`
2. **UsageLimitSettings.tsx existiert?** → **✅ JA** - `src/components/profile/UsageLimitSettings.tsx` & wird in Dashboard verwendet
3. **FeedCard Buttons (3 Stück) live?** → **❌ NEIN** - Keine "Merken/Mehr/Anderes" Buttons gefunden
4. **feed_interactions Tabelle?** → **✅ JA** - Existiert in `database.types.ts`, aber keine INSERT-Logik
5. **guide_conversations INSERT aktiv?** → **❌ NEIN** - `logGuideTurn()` verwendet `guide_logs`, nicht `guide_conversations`

---

## **UPDATE CHECKLIST:**

**3.1** [x] [ ] [x] [x] 
**3.2** [x] [x] [x] [ ] 
**3.3** [x] [ ] [ ] 
**3.4** [x] [ ] [x] [x]

---

## **NÄCHSTE 3 PRIORITÄTEN:**

1. **FeedCard Buttons implementieren** (Merken/Mehr/Anderes) → feed_interactions INSERT
2. **guide_conversations INSERT aktivieren** → logGuideTurn() erweitern oder neue Funktion
3. **content_items COUNT prüfen** → CSV-Import Status verifizieren

