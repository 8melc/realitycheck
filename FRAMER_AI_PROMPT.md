# FYF Reality Check – Framer AI Landingpage Prompt

**Copy-paste ready für Framer.com/ai**

---

## Design-System & Brand Identity

**Farbpalette:**
- Primary: `#2D1B69` (violett, urban, für Headlines, CTAs, Akzente)
- Secondary: `#F5F5F5` (hellgrau, für Hintergründe, Cards)
- Accent: `#E8C0FF` (violett hell, für Hover-States, Highlights)
- Text Dark: `#1A1A1A` (für Headlines, Bold Text)
- Text Light: `#666666` (für Body-Text, Subtitles)

**Typografie:**
- Headlines: Inter Bold, 48-96px (responsive, clamp)
- Body: Inter Regular, 16-20px (responsive)
- Letter-spacing: Headlines -0.02em, Body normal
- Line-height: Headlines 0.9-1.1, Body 1.5-1.6

**Layout:**
- 8px Grid System (alle Spacing-Werte: 8, 16, 24, 32, 40, 48, 64px)
- Mobile-first Responsive Design
- Max-width Container: 1200px
- Padding: Mobile 24px, Desktop 64px

---

## Section 1: HERO (80vh Viewport Height)

**Layout:**
- Full-width Section, 80vh height
- Centered content, max-width 1200px
- Mobile: Stacked vertical, Desktop: Centered

**Content:**
- **Headline (H1):** "Deine 4000 Wochen sehen"
  - Inter Bold, 48-96px (clamp), Color: #1A1A1A
  - Center-aligned, max-width 60ch
  - Margin-bottom: 32px

- **Subheadline:** "Zeit ist dein Vermögen. FYF Reality Check."
  - Inter Regular, 20-24px, Color: #666666
  - Center-aligned, max-width 50ch
  - Margin-bottom: 48px

- **Life-in-Weeks Demo-Grid:**
  - 20x20 Grid (400 Kästchen total)
  - Each square: 12px x 12px (Mobile), 16px x 16px (Desktop)
  - Gap: 2px between squares
  - Colors: 
    - Past weeks: #2D1B69 (filled, violet)
    - Future weeks: #F5F5F5 (empty, light gray border 1px #E8C0FF)
  - Show ~30% filled (120 squares violet, 280 squares gray)
  - Container: Centered, max-width 600px, padding 32px
  - Background: #F5F5F5, border-radius 16px
  - Margin-bottom: 48px

- **Input Field:**
  - Label: "Geburtsdatum eingeben"
  - Input type: date picker
  - Style: 
    - Background: white
    - Border: 2px solid #E8C0FF
    - Border-radius: 8px
    - Padding: 16px 24px
    - Font: Inter Regular, 16px, Color: #1A1A1A
    - Width: 100%, max-width: 320px
    - Focus state: Border-color #2D1B69, outline none
  - Margin-bottom: 24px

- **CTA Button: "Starte jetzt"**
  - Background: #2D1B69
  - Color: white
  - Font: Inter Bold, 18px
  - Padding: 16px 48px
  - Border-radius: 8px
  - Border: none
  - Cursor: pointer
  - Hover: Background #1A0F4A, transform scale(1.02)
  - Transition: all 0.2s ease
  - Width: 100%, max-width: 320px

---

## Section 2: WAS IST FYF? (3-Karten-Layout)

**Layout:**
- Section padding: 80px 24px (Mobile), 120px 64px (Desktop)
- Background: white
- Grid: 1 column (Mobile), 3 columns (Desktop)
- Gap: 32px
- Max-width: 1200px, centered

**Card Design:**
- Background: #F5F5F5
- Border-radius: 16px
- Padding: 40px 32px
- Border: 1px solid #E8C0FF (subtle)
- Hover: Transform translateY(-4px), box-shadow 0 8px 24px rgba(45, 27, 105, 0.1)
- Transition: all 0.3s ease

**Card 1: GUIDE**
- **Icon/Emoji:** 🤖 (or custom icon placeholder)
- **Title:** "GUIDE"
  - Inter Bold, 24px, Color: #2D1B69
  - Margin-bottom: 16px
- **Subtitle:** "KI-Sparringpartner"
  - Inter Bold, 18px, Color: #1A1A1A
  - Margin-bottom: 12px
- **Description:** "Ehrlich, provokant"
  - Inter Regular, 16px, Color: #666666
  - Line-height: 1.6

**Card 2: FEEDBOARD**
- **Icon/Emoji:** 📊 (or custom icon placeholder)
- **Title:** "FEEDBOARD"
  - Inter Bold, 24px, Color: #2D1B69
  - Margin-bottom: 16px
- **Subtitle:** "Kuratierte Kacheln"
  - Inter Bold, 18px, Color: #1A1A1A
  - Margin-bottom: 12px
- **Description:** "Zeit/Freiheit/Fokus"
  - Inter Regular, 16px, Color: #666666
  - Line-height: 1.6

**Card 3: ACCESS**
- **Icon/Emoji:** 🎯 (or custom icon placeholder)
- **Title:** "ACCESS"
  - Inter Bold, 24px, Color: #2D1B69
  - Margin-bottom: 16px
- **Subtitle:** "Events & Workshops"
  - Inter Bold, 18px, Color: #1A1A1A
  - Margin-bottom: 12px
- **Description:** "Real-Life Check"
  - Inter Regular, 16px, Color: #666666
  - Line-height: 1.6

---

## Section 3: SOCIAL PROOF

**Layout:**
- Section padding: 80px 24px (Mobile), 120px 64px (Desktop)
- Background: #F5F5F5
- Max-width: 1200px, centered

**Content:**
- **Section Title:** "Was User sagen"
  - Inter Bold, 32px (Mobile), 48px (Desktop)
  - Color: #1A1A1A
  - Center-aligned
  - Margin-bottom: 48px

**Testimonial 1:**
- **Quote:** "Krass, dass schon 1/3 meines Lebens weg ist"
  - Inter Regular, 18px, Color: #1A1A1A
  - Font-style: italic
  - Margin-bottom: 16px
- **Author:** "– Circle Feedback"
  - Inter Regular, 14px, Color: #666666
- **Card Style:**
  - Background: white
  - Padding: 32px
  - Border-radius: 12px
  - Border-left: 4px solid #2D1B69
  - Margin-bottom: 24px

**Testimonial 2:**
- **Quote:** "Instagram-Zeit in Lebenswochen denken"
  - Inter Regular, 18px, Color: #1A1A1A
  - Font-style: italic
  - Margin-bottom: 16px
- **Author:** "– User Reaction"
  - Inter Regular, 14px, Color: #666666
- **Card Style:** Same as Testimonial 1

---

## Section 4: FINAL CTA (Sticky Mobile)

**Desktop Layout:**
- Section padding: 80px 24px (Mobile), 120px 64px (Desktop)
- Background: #2D1B69
- Max-width: 1200px, centered
- Text center-aligned

**Mobile Layout:**
- Sticky bottom bar (position: fixed, bottom: 0, width: 100%)
- Background: #2D1B69
- Padding: 24px
- Z-index: 1000

**Content:**
- **Headline:** "Geburtsdatum → Dashboard"
  - Inter Bold, 24px (Mobile), 32px (Desktop)
  - Color: white
  - Margin-bottom: 24px (Desktop only)

- **CTA Button:** "Jetzt starten"
  - Background: white
  - Color: #2D1B69
  - Font: Inter Bold, 18px
  - Padding: 16px 48px
  - Border-radius: 8px
  - Border: none
  - Width: 100% (Mobile), auto (Desktop)
  - Hover: Background #F5F5F5, transform scale(1.02)
  - Transition: all 0.2s ease

---

## FYF-Wording (Provokant, Urban Tone)

**Verwende diese Texte genau so:**

- "Kein Bullshit-Coaching. Zeit als Haltung."
- "Scrollst du dein Leben weg? Sieh's dir an."
- "Dein Guide: Direkt, respektvoll, ehrlich."
- "Feedboard: 6 Cluster, handverlesen, substanziell."
- "Reality Check: Events, die Zeit spürbar machen."

**Tone of Voice:**
- Direkt, ehrlich, provokant
- Urban, modern, kein Corporate-Speak
- Respektvoll, aber kein Small Talk
- Klare Aussagen, keine Floskeln

---

## Interaktive Elemente & Animationen

**Hover States:**
- Buttons: Scale 1.02, darker background
- Cards: TranslateY(-4px), subtle shadow
- Links: Color change to #2D1B69

**Transitions:**
- All interactive elements: 0.2s-0.3s ease
- Smooth, nicht bouncy

**Scroll Behavior:**
- Smooth scrolling enabled
- Mobile CTA sticky bar appears after hero section scroll

---

## Responsive Breakpoints

- **Mobile:** < 768px (1 column, stacked, sticky CTA)
- **Tablet:** 768px - 1024px (2 columns where applicable)
- **Desktop:** > 1024px (3 columns, full layout)

---

## Final Instructions für Framer AI

Erstelle eine moderne, provokante Landingpage für "FYF Reality Check" mit:
1. Hero-Section mit Life-in-Weeks Grid (20x20, interaktiv)
2. 3-Karten-Layout für "Was ist FYF?"
3. Social Proof Section mit Testimonials
4. Sticky CTA Bar (Mobile)
5. Exakte Farbpalette (#2D1B69, #F5F5F5, #E8C0FF)
6. Inter Font (Bold für Headlines, Regular für Body)
7. 8px Grid System
8. Mobile-first Responsive Design
9. Provokante, urbane Texte (siehe FYF-Wording)
10. Smooth Animations, moderne UX

**Style:** Urban, modern, provokant, kein Corporate-Design. Zeit als wertvolles Gut visualisieren.

---

**Ready to paste in Framer.com/ai → Generate**



